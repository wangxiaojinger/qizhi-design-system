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
  const values = publicTokenValues(manifest);
  const types = renderTypes();
  const migration = JSON.parse(renderMigrationMap(manifest));
  const packageJson = JSON.parse(await read(new URL("package.json", packageRoot)));

  assert.deepEqual(
    { tier: values["primary.6"].tier, status: values["primary.6"].status, replacedBy: values["primary.6"].replacedBy },
    { tier: "alias", status: "stable", replacedBy: undefined },
  );
  assert.match(types, /QizhiTokenTier = "seed" \| "map" \| "alias" \| "component"/);
  assert.match(types, /QizhiTokenStatus = "stable" \| "deprecated"/);
  assert.equal(Object.keys(migration).length, Object.keys(manifest.tokens).length);
  assert.deepEqual(new Set(Object.values(migration).map((entry) => entry.action)), new Set(["keep", "alias"]));
  assert.equal(migration["primary.6"].valueType, "reference");
  assert.equal(packageJson.exports["./migration-map.json"], "./dist/migration-map.json");
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
