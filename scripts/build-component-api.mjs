import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsRoot = resolve(repoRoot, "apps/qizhi-docs/src");
const outputPath = resolve(docsRoot, "api/component-api.json");

const isApiItems = (value) => Array.isArray(value)
  && value.length > 0
  && value.every((item) => item && typeof item === "object"
    && ["name", "description", "type", "defaultValue"].every((key) => typeof item[key] === "string"));

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    else if (entry.name.endsWith("Api.ts")) files.push(path);
  }
  return files.sort();
};

const buildManifest = async () => {
  const apis = {};
  for (const path of await collectFiles(docsRoot)) {
    const module = await import(`${pathToFileURL(path).href}?component-api-build`);
    for (const [name, value] of Object.entries(module)) {
      if (isApiItems(value)) {
        if (apis[name]) throw new Error(`Duplicate component API key: ${name}`);
        const defaultBehaviors = module[`${name}DefaultBehaviors`];
        if (defaultBehaviors !== undefined && (!Array.isArray(defaultBehaviors)
          || !defaultBehaviors.every((item) => typeof item === "string"))) {
          throw new Error(`Invalid default behaviors for ${name}`);
        }
        apis[name] = { source: relative(repoRoot, path).replaceAll("/", "\\"), items: value,
          ...(defaultBehaviors ? { defaultBehaviors } : {}) };
      } else if (Array.isArray(value)) {
        value.forEach((group) => {
          if (!group || typeof group.title !== "string" || !isApiItems(group.items)) return;
          const key = `${name}:${group.title}`;
          apis[key] = { source: relative(repoRoot, path).replaceAll("/", "\\"), items: group.items };
        });
      }
    }
  }
  return {
    name: "QIZHI React Component API",
    version: "0.1.0",
    generatedFrom: [
      "packages/qizhi-react/src/index.ts",
      "packages/qizhi-react/src/**/*.types.ts",
      "apps/qizhi-docs/src/**/*Api.ts",
    ],
    apis,
  };
};

const serialized = `${JSON.stringify(await buildManifest(), null, 2)}\n`;
if (process.argv.includes("--check")) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== serialized) {
    console.error("apps/qizhi-docs/src/api/component-api.json is stale. Run pnpm api:build.");
    process.exit(1);
  }
  console.log("Component API manifest is current.");
} else {
  await writeFile(outputPath, serialized, "utf8");
  console.log(`Generated ${Object.keys(JSON.parse(serialized).apis).length} component API groups.`);
}
