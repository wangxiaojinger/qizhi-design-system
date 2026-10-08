import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import {
  classifyTokenValue,
  publicTokenValues,
  renderMigrationMap,
  renderTypes,
  validateManifest,
} from "../scripts/token-utils.mjs";

const packageRoot = new URL("../", import.meta.url);
const repoRoot = new URL("../../../", import.meta.url);

const read = async (url) => readFile(url, "utf8");

test("legacy public token names, values, and value types stay compatible", async () => {
  const manifest = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const baseline = JSON.parse(await read(new URL("src/legacy-contract.json", packageRoot)));

  assert.equal(Object.keys(baseline).length, 362);
  for (const [name, legacy] of Object.entries(baseline)) {
    const current = manifest.tokens[name];
    assert.ok(current, `missing legacy token: ${name}`);
    assert.equal(current.cssVariable, legacy.cssVariable, `${name} changed cssVariable`);
    assert.equal(current.value, legacy.value, `${name} changed value`);
    assert.equal(classifyTokenValue(current.value), legacy.valueType, `${name} changed value type`);
  }
});

test("all public tokens declare a valid tier and lifecycle status", async () => {
  const manifest = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const tiers = new Set(["seed", "map", "alias", "component"]);
  const statuses = new Set(["stable", "deprecated"]);

  for (const [name, token] of Object.entries(manifest.tokens)) {
    assert.ok(tiers.has(token.tier), `${name} has invalid tier: ${token.tier}`);
    assert.ok(statuses.has(token.status), `${name} has invalid status: ${token.status}`);
  }
});

test("deprecated tokens require a resolvable replacement", () => {
  const withoutReplacement = {
    tokens: {
      old: { name: "old", value: "1px", cssVariable: "--old", category: "test", description: "old", tier: "map", status: "deprecated" },
    },
  };
  assert.ok(validateManifest(withoutReplacement).some((error) => error.includes("old") && error.includes("replacedBy")));

  const missingReplacement = structuredClone(withoutReplacement);
  missingReplacement.tokens.old.replacedBy = "missing";
  assert.ok(validateManifest(missingReplacement).some((error) => error.includes("old") && error.includes("missing")));
});

test("token dependency validation rejects cycles and upward references", () => {
  const token = (name, value, tier) => ({
    name,
    value,
    cssVariable: `--${name}`,
    category: "test",
    description: name,
    tier,
    status: "stable",
  });

  const cycle = { tokens: { a: token("a", "var(--b)", "alias"), b: token("b", "var(--a)", "alias") } };
  const cycleErrors = validateManifest(cycle).join("\n");
  assert.match(cycleErrors, /cycle.*a.*b|cycle.*b.*a/i);

  const upward = { tokens: { mapped: token("mapped", "var(--semantic)", "map"), semantic: token("semantic", "#fff", "alias") } };
  assert.ok(validateManifest(upward).some((error) => error.includes("mapped") && error.includes("semantic")));

  const componentChain = { tokens: { first: token("first", "var(--second)", "component"), second: token("second", "#fff", "component") } };
  assert.ok(validateManifest(componentChain).some((error) => error.includes("first") && error.includes("second")));
});

test("public token metadata and migration map are generated from the manifest", async () => {
  const manifest = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const baseline = JSON.parse(await read(new URL("src/legacy-contract.json", packageRoot)));
  const values = publicTokenValues(manifest);
  const types = renderTypes();
  const migration = JSON.parse(renderMigrationMap(manifest, baseline));
  const packageJson = JSON.parse(await read(new URL("package.json", packageRoot)));

  assert.deepEqual(
    { tier: values["primary.6"].tier, status: values["primary.6"].status, replacedBy: values["primary.6"].replacedBy },
    { tier: "alias", status: "stable", replacedBy: undefined },
  );
  assert.match(types, /QizhiTokenTier = "seed" \| "map" \| "alias" \| "component"/);
  assert.match(types, /QizhiTokenStatus = "stable" \| "deprecated"/);
  assert.equal(Object.keys(migration).length, Object.keys(manifest.tokens).length);
  assert.deepEqual(new Set(Object.values(migration).map((entry) => entry.action)), new Set(["keep", "compat-alias", "add"]));
  assert.equal(migration["brand.blue.6"].action, "keep");
  assert.equal(migration["brand.blue.6"].recommendedToken, "brand.blue.6");
  assert.equal(migration["primary.6"].action, "compat-alias");
  assert.equal(migration["primary.6"].recommendedToken, "qizhiblue.6");
  assert.equal(migration["component.button.primary.default"].action, "add");
  assert.equal(migration["component.button.primary.default"].recommendedToken, "component.button.primary.default");
  assert.equal(migration["primary.6"].valueType, "reference");
  assert.equal(packageJson.exports["./migration-map.json"], "./dist/migration-map.json");
  const migrationDocument = await read(new URL("MIGRATION.md", packageRoot));
  assert.match(migrationDocument, /\| `primary\.6` \| `--primary-6` \| 兼容别名 \| `qizhiblue\.6` \|/);
  assert.match(migrationDocument, /保留：271；兼容别名：91；新增：161；弃用：0/);
});

test("shared typography and spacing scales expose the approved values", async () => {
  const { tokens } = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const values = (names) => names.map((name) => tokens[name]?.value);

  assert.deepEqual(values([12, 14, 16, 18, 20, 24, 28, 32].map((size) => `font.size.${size}`)), ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"]);
  assert.deepEqual(values([18, 20, 22, 24, 26, 28, 30, 32, 36].map((size) => `line.height.${size}`)), ["18px", "20px", "22px", "24px", "26px", "28px", "30px", "32px", "36px"]);
  assert.deepEqual(values([0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48].map((size) => `space.${size}`)), ["0px", "2px", "4px", "6px", "8px", "12px", "16px", "20px", "24px", "32px", "40px", "48px"]);
});

test("shared control, border, motion, shadow, and layer scales preserve current geometry", async () => {
  const { tokens } = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  assert.deepEqual(
    ["mini", "small", "medium", "large"].map((size) => tokens[`control.height.${size}`]?.value),
    ["24px", "28px", "32px", "36px"],
  );
  assert.deepEqual(
    ["none", "thin", "thick"].map((size) => tokens[`line.width.${size}`]?.value),
    ["0px", "1px", "2px"],
  );
  assert.deepEqual(
    ["fast", "base", "slow"].map((speed) => tokens[`motion.duration.${speed}`]?.value),
    ["160ms", "200ms", "300ms"],
  );
  assert.deepEqual(
    ["sticky", "dropdown", "modal", "message", "tooltip"].map((layer) => tokens[`z.index.${layer}`]?.value),
    ["100", "60", "999", "1200", "1200"],
  );
  assert.deepEqual(
    ["low", "popup", "modal"].map((level) => tokens[`shadow.${level}`]?.value),
    [
      "0 1px 2px rgba(0, 0, 0, 0.08)",
      "0 6px 16px rgba(29, 33, 41, 0.12)",
      "0 16px 48px rgba(0, 0, 0, 0.22)",
    ],
  );
  assert.deepEqual(
    ["standard", "enter", "exit"].map((kind) => tokens[`motion.easing.${kind}`]?.value),
    ["ease", "ease-out", "ease-in"],
  );
});

test("Button component tokens preserve legacy overrides and drive the component stylesheet", async () => {
  const { tokens } = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const css = await read(new URL("packages/qizhi-react/src/button/button.css", repoRoot));
  const expected = {
    "component.button.control.height.mini": "var(--control-height-mini)",
    "component.button.control.height.small": "var(--control-height-small)",
    "component.button.control.height.medium": "var(--control-height-medium)",
    "component.button.control.height.large": "var(--control-height-large)",
    "component.button.padding.inline.mini": "11px",
    "component.button.padding.inline.small": "13px",
    "component.button.padding.inline.medium": "12px",
    "component.button.padding.inline.large": "15px",
    "component.button.gap": "var(--space-8)",
    "component.button.radius": "var(--border-radius-medium)",
    "component.button.font.size": "var(--font-size-14)",
    "component.button.font.weight": "var(--font-weight-400)",
    "component.button.border.width": "var(--line-width-thin)",
    "component.button.primary.default": "rgb(var(--primary-6))",
    "component.button.primary.hover": "rgb(var(--primary-5))",
    "component.button.primary.active": "rgb(var(--primary-7))",
    "component.button.primary.disabled": "rgb(var(--primary-3))",
    "component.button.primary.text": "var(--color-white)",
    "component.button.secondary.text": "var(--color-text-2)",
    "component.button.secondary.border.default": "var(--color-border-2)",
    "component.button.secondary.border.hover": "var(--color-border-3)",
    "component.button.secondary.border.active": "var(--color-border-4)",
    "component.button.secondary.background.hover": "var(--color-fill-1)",
    "component.button.secondary.background.active": "var(--color-fill-2)",
    "component.button.disabled.text": "var(--color-text-4)",
    "component.button.disabled.background": "var(--color-fill-2)",
    "component.button.disabled.border": "var(--color-border-1)",
    "component.button.icon.size": "var(--font-size-16)",
    "component.button.focus.color": "rgb(var(--primary-6))",
    "component.button.focus.width": "var(--line-width-thick)",
    "component.button.focus.offset": "var(--space-2)",
    "component.button.motion.duration": "var(--motion-duration-base)",
    "component.button.motion.easing": "var(--motion-easing-standard)",
    "component.button.active.scale": "0.98",
  };

  for (const [name, value] of Object.entries(expected)) {
    assert.equal(tokens[name]?.tier, "component", `${name} must be a component token`);
    assert.equal(tokens[name]?.value, value, `${name} must preserve the approved fallback`);
    assert.match(css, new RegExp(`var\\(${tokens[name]?.cssVariable?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`), `${name} is not consumed by button.css`);
  }
});

test("Input and Select component tokens preserve shared scales and semantic override paths", async () => {
  const { tokens } = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const inputCss = await read(new URL("packages/qizhi-react/src/input/input.css", repoRoot));
  const selectCss = await read(new URL("packages/qizhi-react/src/select/select.css", repoRoot));
  const shared = {
    "control.height.mini": "var(--control-height-mini)",
    "control.height.small": "var(--control-height-small)",
    "control.height.medium": "var(--control-height-medium)",
    "control.height.large": "var(--control-height-large)",
    "radius": "var(--border-radius-small)",
    "font.size": "var(--font-size-14)",
    "border.width": "var(--line-width-thin)",
    "border.default": "var(--color-border-2)",
    "border.hover": "var(--color-border-3)",
    "border.focus": "rgb(var(--primary-6))",
    "border.error": "var(--color-danger)",
    "border.warning": "var(--color-warning)",
    "background.default": "var(--color-bg-2)",
    "background.disabled": "var(--color-fill-1)",
    "text.default": "var(--color-text-1)",
    "text.disabled": "var(--color-text-4)",
    "text.placeholder": "var(--color-text-4)",
    "focus.ring": "var(--color-primary-light-1)",
    "focus.width": "var(--line-width-thick)",
    "icon.size": "var(--font-size-16)",
    "motion.duration": "var(--motion-duration-fast)",
    "motion.easing": "var(--motion-easing-standard)",
  };

  for (const [component, css] of [["input", inputCss], ["select", selectCss]]) {
    for (const [suffix, value] of Object.entries(shared)) {
      const name = `component.${component}.${suffix}`;
      assert.equal(tokens[name]?.tier, "component", `${name} must be a component token`);
      assert.equal(tokens[name]?.value, value, `${name} must preserve the approved fallback`);
      assert.ok(css.includes(`var(${tokens[name]?.cssVariable}`), `${name} is not consumed by ${component}.css`);
    }
  }

  for (const [name, value] of Object.entries({
    "component.input.focus.error.ring": "var(--color-danger-light-1)",
    "component.input.focus.warning.ring": "var(--color-warning-light-1)",
  })) {
    assert.equal(tokens[name]?.tier, "component", `${name} must be a component token`);
    assert.equal(tokens[name]?.value, value, `${name} must preserve the approved fallback`);
    assert.ok(inputCss.includes(`var(${tokens[name]?.cssVariable}`), `${name} is not consumed by input.css`);
  }

  assert.equal(tokens["component.input.padding.inline"]?.value, "var(--space-12)");
  assert.ok(inputCss.includes("var(--component-input-padding-inline)"));
  assert.equal(tokens["component.select.padding.inline"]?.value, "11px");
  assert.ok(selectCss.includes("var(--component-select-padding-inline)"));
  assert.equal(tokens["component.select.popup.shadow"]?.value, "var(--shadow-popup)");
  assert.ok(selectCss.includes("var(--component-select-popup-shadow)"));
  assert.equal(tokens["component.select.option.height"]?.value, "var(--control-height-medium)");
  assert.ok(selectCss.includes("var(--component-select-option-height)"));
  assert.equal(tokens["component.input.content.width"], undefined);
  assert.equal(tokens["component.select.content.width"], undefined);
});

test("Modal component tokens preserve current geometry and legacy semantic colors", async () => {
  const { tokens } = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const css = await read(new URL("packages/qizhi-react/src/modal/modal.css", repoRoot));
  const expected = {
    "component.modal.z.index": "var(--z-index-modal)",
    "component.modal.mask.background": "rgba(0, 0, 0, 0.45)",
    "component.modal.radius": "var(--border-radius-large)",
    "component.modal.shadow": "var(--shadow-modal)",
    "component.modal.header.height": "56px",
    "component.modal.title.font.size": "var(--font-size-16)",
    "component.modal.title.line.height": "var(--line-height-24)",
    "component.modal.content.padding.block": "var(--space-16)",
    "component.modal.content.padding.inline": "var(--space-24)",
    "component.modal.footer.gap": "var(--space-12)",
    "component.modal.motion.duration": "180ms",
    "component.modal.motion.easing": "var(--motion-easing-standard)",
    "component.modal.background": "var(--color-bg-white)",
    "component.modal.text.primary": "var(--color-text-1)",
    "component.modal.text.secondary": "var(--color-text-2)",
    "component.modal.border": "var(--color-border-1)",
  };

  for (const [name, value] of Object.entries(expected)) {
    assert.equal(tokens[name]?.tier, "component", `${name} must be a component token`);
    assert.equal(tokens[name]?.value, value, `${name} must preserve the approved value`);
    assert.ok(css.includes(`var(${tokens[name]?.cssVariable}`), `${name} is not consumed by modal.css`);
  }
});

test("Table publishes a deferred component-token mapping without claiming CSS consumption", async () => {
  const { tokens } = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const expected = {
    "component.table.header.background": "rgb(var(--gray-1))",
    "component.table.cell.padding.block.large": "var(--space-16)",
    "component.table.cell.padding.block.medium": "var(--space-12)",
    "component.table.cell.padding.block.small": "var(--space-8)",
    "component.table.cell.padding.inline": "var(--space-16)",
    "component.table.font.size": "var(--font-size-14)",
    "component.table.line.height": "var(--line-height-regular)",
    "component.table.border": "var(--color-border-1)",
    "component.table.fixed.z.index": "2",
    "component.table.row.hover.background": "var(--color-fill-1)",
    "component.table.row.selected.background": "var(--color-primary-light-1)",
  };

  for (const [name, value] of Object.entries(expected)) {
    assert.equal(tokens[name]?.tier, "component", `${name} must be a component token`);
    assert.equal(tokens[name]?.value, value, `${name} must match the current Table baseline`);
    assert.match(tokens[name]?.description ?? "", /deferred|延后/i);
  }
});

const parseRootDeclarations = (css) => {
  const root = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  return Object.fromEntries(
    [...root.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)].map((match) => [
      `--${match[1]}`,
      match[2].replace(/\s+/g, " ").trim(),
    ]),
  );
};

test("tokens.json is the only source of public design tokens", async () => {
  const manifest = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const legacy = parseRootDeclarations(await read(new URL("styles.css", repoRoot)));
  const current = Object.fromEntries(
    Object.values(manifest.tokens).map((token) => [token.cssVariable, token.value]),
  );

  assert.deepEqual(Object.keys(legacy), [
    "--doc-content-title-margin-top",
    "--doc-content-title-margin-bottom",
    "--doc-content-title-font-size",
  ]);
  assert.equal(new Set(Object.keys(current)).size, Object.keys(current).length);
  assert.equal(Object.keys(current).some((name) => name.startsWith("--doc-")), false);
});

test("manifest references resolve and public metadata is complete", async () => {
  const manifest = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const names = new Set(Object.keys(manifest.tokens));

  for (const [name, token] of Object.entries(manifest.tokens)) {
    assert.match(name, /^[a-z][a-z0-9]*(?:\.[a-z0-9]+)*$/);
    assert.equal(token.name, name);
    assert.match(token.cssVariable, /^--[a-z0-9-]+$/);
    assert.ok(token.category);
    assert.ok(token.description);
    for (const reference of token.value.matchAll(/var\(--([a-zA-Z0-9-]+)\)/g)) {
      const target = Object.entries(manifest.tokens).find(([, item]) => item.cssVariable === `--${reference[1]}`)?.[0];
      assert.ok(target && names.has(target), `${name} references missing --${reference[1]}`);
    }
  }
});

test("publishes the shared monospace font token", async () => {
  const manifest = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const mono = manifest.tokens["font.mono"];

  assert.equal(mono.cssVariable, "--font-mono");
  assert.match(mono.value, /ui-monospace/);
  assert.equal(mono.category, "字体");
});

test("validation rejects a stale TypeScript declaration", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "qizhi-token-test-"));
  const tempPackage = join(tempRoot, "qizhi-tokens");
  await cp(new URL(".", packageRoot), tempPackage, { recursive: true });
  await writeFile(join(tempPackage, "dist/index.d.ts"), "stale declaration\n", "utf8");

  const result = spawnSync(process.execPath, ["scripts/validate.mjs"], {
    cwd: tempPackage,
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /dist\/index\.d\.ts is stale/);
});

test("validation rejects generated metadata after source metadata changes", async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "qizhi-token-metadata-test-"));
  const tempPackage = join(tempRoot, "qizhi-tokens");
  await cp(new URL(".", packageRoot), tempPackage, { recursive: true });
  const sourcePath = join(tempPackage, "src/tokens.json");
  const manifest = JSON.parse(await readFile(sourcePath, "utf8"));
  manifest.tokens["primary.6"].status = "deprecated";
  manifest.tokens["primary.6"].replacedBy = "color.primary.light.1";
  await writeFile(sourcePath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const result = spawnSync(process.execPath, ["scripts/validate.mjs"], {
    cwd: tempPackage,
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /dist\/(tokens\.json|index\.js|migration-map\.json) is stale/);
});

test("generated artifacts are current and package exports are stable", async () => {
  const packageJson = JSON.parse(await read(new URL("package.json", packageRoot)));
  const css = await read(new URL("dist/style.css", packageRoot));
  const js = await read(new URL("dist/index.js", packageRoot));
  const types = await read(new URL("dist/index.d.ts", packageRoot));

  assert.equal(packageJson.name, "@wangxiaojinger/qizhi-tokens");
  assert.equal(packageJson.exports["./style.css"], "./dist/style.css");
  assert.equal(packageJson.exports["./tokens.json"], "./dist/tokens.json");
  assert.match(css, /^:root \{/);
  assert.match(js, /export const tokens/);
  assert.match(types, /export declare const tokens/);
});

test("legacy site loads generated tokens before its compatibility stylesheet", async () => {
  const html = await read(new URL("index.html", repoRoot));
  const tokenLink = html.match(/\.\/packages\/qizhi-tokens\/dist\/style\.css\?v=[^"]+/)?.[0];
  const legacyLink = html.match(/\.\/styles\.css\?v=[^"]+/)?.[0];
  const scriptLink = html.match(/\.\/script\.js\?v=[^"]+/)?.[0];

  assert.ok(tokenLink);
  assert.ok(legacyLink);
  assert.ok(scriptLink);
  assert.equal(tokenLink.split("?v=")[1], legacyLink.split("?v=")[1]);
  assert.equal(tokenLink.split("?v=")[1], scriptLink.split("?v=")[1]);
  assert.ok(html.indexOf(tokenLink) < html.indexOf(legacyLink));
});

test("design token docs are rendered from generated token data", async () => {
  const html = await read(new URL("index.html", repoRoot));
  const script = await read(new URL("script.js", repoRoot));
  const section = html.match(/<section class="doc-section" id="design-tokens">([\s\S]*?)<section class="doc-section" id="spacing">/)?.[1] ?? "";

  assert.match(section, /data-token-docs/);
  assert.doesNotMatch(section, /<table class="token-table">/);
  assert.match(
    script,
    /new URL\(\s*"\.\/packages\/qizhi-tokens\/dist\/tokens\.json",\s*import\.meta\.url,\s*\)/,
  );
  assert.match(script, /fetch\(tokenManifestUrl\)/);
  assert.match(script, /token\.name/);
  assert.match(script, /token\.category/);
  assert.match(script, /token\.cssVariable/);
  assert.match(script, /token\.description/);
});

test("QIZHI React and root verification consume the token package", async () => {
  const reactPackage = JSON.parse(await read(new URL("packages/qizhi-react/package.json", repoRoot)));
  const reactEntry = await read(new URL("packages/qizhi-react/src/index.ts", repoRoot));
  const rootPackage = JSON.parse(await read(new URL("package.json", repoRoot)));

  assert.equal(reactPackage.dependencies["@wangxiaojinger/qizhi-tokens"], "workspace:*");
  assert.match(reactEntry, /^import "@wangxiaojinger\/qizhi-tokens\/style\.css";/);
  assert.match(rootPackage.scripts.build, /@wangxiaojinger\/qizhi-tokens build/);
  assert.match(rootPackage.scripts.test, /@wangxiaojinger\/qizhi-tokens test/);
  const tokenBuildIndex = rootPackage.scripts.verify.indexOf("@wangxiaojinger/qizhi-tokens build");
  const tokenValidateIndex = rootPackage.scripts.verify.indexOf("@wangxiaojinger/qizhi-tokens validate");

  assert.ok(tokenBuildIndex >= 0);
  assert.ok(tokenValidateIndex > tokenBuildIndex);
});
