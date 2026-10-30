import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

function checkDeclarations(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const file = resolve(folder, entry.name);
    if (entry.isDirectory()) { checkDeclarations(file); continue; }
    if (!file.endsWith(".d.ts")) continue;
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /^import\s+["'][^"']+\.css["']/m, `CSS side effect in ${file}`);
    for (const match of source.matchAll(/(?:from\s*|import\s*\(\s*)["'](\.[^"']+)["']/g)) {
      assert.match(match[1], /\.js$/, `NodeNext requires an explicit extension in ${file}`);
      assert.ok(existsSync(resolve(dirname(file), match[1].replace(/\.js$/, ".d.ts"))), `missing declaration ${match[1]} in ${file}`);
    }
  }
}
checkDeclarations(resolve(packageRoot, "dist"));
console.log("qizhi-react package exports and declaration imports are complete");
