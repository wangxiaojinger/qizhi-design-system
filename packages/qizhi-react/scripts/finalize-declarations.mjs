import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
async function exists(path) { try { return (await stat(path)).isFile(); } catch { return false; } }
async function walk(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = resolve(folder, entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!file.endsWith(".d.ts")) continue;
    let source = await readFile(file, "utf8");
    source = source.replace(/^import\s+["'][^"']+\.css["'];?\s*$/gm, "");
    const matches = [...source.matchAll(/(?:from\s*|import\s*\(\s*)["'](\.[^"']+)["']/g)];
    for (const match of matches) {
      const specifier = match[1];
      if (/\.(?:js|mjs|cjs|json)$/.test(specifier)) continue;
      const target = resolve(dirname(file), specifier);
      const suffix = await exists(`${target}.d.ts`) ? ".js" : await exists(resolve(target, "index.d.ts")) ? "/index.js" : undefined;
      if (!suffix) throw new Error(`Unresolved declaration import in ${relative(root, file)}: ${specifier}`);
      source = source.replaceAll(`"${specifier}"`, `"${specifier}${suffix}"`).replaceAll(`'${specifier}'`, `'${specifier}${suffix}'`);
    }
    await writeFile(file, source);
  }
}
await walk(root);
console.log("Declaration imports finalized for bundler and NodeNext.");
