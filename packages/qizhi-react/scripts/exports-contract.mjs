import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"));
const requiredExports = [".", "./icon", "./chart", "./markdown", "./code-preview", "./style.css"];

for (const key of requiredExports) assert.ok(pkg.exports[key], `missing export ${key}`);
for (const target of Object.values(pkg.exports)) {
  const paths = typeof target === "string" ? [target] : Object.values(target);
  for (const relative of paths) assert.ok(existsSync(resolve(packageRoot, relative)), `missing ${relative}`);
}

console.log("qizhi-react package exports are complete");
