import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { publicTokenValues, readManifest, renderCss, renderTypes, validateManifest } from "./token-utils.mjs";

const packageRoot = new URL("../", import.meta.url);
const sourceUrl = new URL("src/tokens.json", packageRoot);
const distUrl = new URL("dist/", packageRoot);
const manifest = await readManifest(sourceUrl);
const errors = validateManifest(manifest);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const tokens = publicTokenValues(manifest);
await mkdir(fileURLToPath(distUrl), { recursive: true });
await Promise.all([
  writeFile(new URL("style.css", distUrl), renderCss(manifest), "utf8"),
  writeFile(new URL("tokens.json", distUrl), `${JSON.stringify(manifest, null, 2)}\n`, "utf8"),
  writeFile(new URL("index.js", distUrl), `export const tokens = ${JSON.stringify(tokens, null, 2)};\n`, "utf8"),
  writeFile(new URL("index.d.ts", distUrl), renderTypes(), "utf8"),
]);
