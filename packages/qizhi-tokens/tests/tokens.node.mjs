import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const packageRoot = new URL("../", import.meta.url);
const repoRoot = new URL("../../../", import.meta.url);

const read = async (url) => readFile(url, "utf8");

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
