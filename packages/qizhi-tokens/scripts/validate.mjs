import { readFile } from "node:fs/promises";
import { publicTokenValues, readManifest, renderCss, renderTypes, validateManifest } from "./token-utils.mjs";

const packageRoot = new URL("../", import.meta.url);
const manifest = await readManifest(new URL("src/tokens.json", packageRoot));
const errors = validateManifest(manifest);

const expected = {
  "dist/style.css": renderCss(manifest),
  "dist/tokens.json": `${JSON.stringify(manifest, null, 2)}\n`,
  "dist/index.js": `export const tokens = ${JSON.stringify(publicTokenValues(manifest), null, 2)};\n`,
  "dist/index.d.ts": renderTypes(),
};

for (const [path, content] of Object.entries(expected)) {
  const actual = await readFile(new URL(path, packageRoot), "utf8").catch(() => "");
  if (actual !== content) errors.push(`${path} is stale; run pnpm --filter @wangxiaojinger/qizhi-tokens build`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${Object.keys(manifest.tokens).length} QIZHI tokens.`);
