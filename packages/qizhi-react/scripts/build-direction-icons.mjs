import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { directionIconManifest } from "../src/icon/direction-icons.manifest.ts";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const iconDirectory = resolve(scriptDirectory, "../src/icon");
const generatedDirectory = resolve(iconDirectory, "generated");

export function validateDirectionSvg(svg) {
  if (!/<svg\b[^>]*\bviewBox="[^"]+"/i.test(svg)) {
    throw new Error("Direction icon SVG requires a viewBox.");
  }
  if (/<script\b/i.test(svg)) {
    throw new Error("Direction icon SVG must not contain script.");
  }
  if (/(?:href|src)="https?:\/\//i.test(svg)) {
    throw new Error("Direction icon SVG must not contain an external resource.");
  }

  const unsupportedTag = [...svg.matchAll(/<([a-z][\w:-]*)\b/gi)]
    .map((match) => match[1])
    .find((tag) => !["svg", "g", "path"].includes(tag));
  if (unsupportedTag) {
    throw new Error(`Direction icon SVG contains unsupported tag: ${unsupportedTag}.`);
  }

  for (const match of svg.matchAll(/(?:fill|stroke)="([^"]+)"/gi)) {
    if (!["none", "black"].includes(match[1])) {
      throw new Error(`Direction icon SVG contains unsupported paint: ${match[1]}.`);
    }
  }

  if (/(?:url\(#|href="#)/i.test(svg)) {
    throw new Error("Direction icon SVG contains an unsupported internal reference.");
  }
}

export function transformDirectionSvg(svg) {
  validateDirectionSvg(svg);
  const viewBox = svg.match(/\bviewBox="([^"]+)"/i)?.[1];
  const path = svg.match(/<path\b[^>]*\/?\s*>/i)?.[0];
  if (!viewBox || !path) {
    throw new Error("Direction icon SVG requires exactly one path.");
  }
  if ((svg.match(/<path\b/gi) ?? []).length !== 1) {
    throw new Error("Direction icon SVG requires exactly one path.");
  }

  const jsx = path
    .replace(/\s+id="[^"]*"/gi, "")
    .replace(/\bfill="black"/gi, 'fill="currentColor"')
    .replace(/\s+(?:fill|stroke)-opacity="[^"]*"/gi, "")
    .replace(/\s*\/?>$/, " />");

  return { viewBox, jsx };
}

export function renderDirectionIconComponent({ componentName, sourceFile, svg }) {
  const { viewBox, jsx } = transformDirectionSvg(svg);
  return `// 由 scripts/build-direction-icons.mjs 生成，禁止手改。\n// Source: ${sourceFile}\nimport { createQizhiIcon } from "../createQizhiIcon";\n\nexport const ${componentName} = createQizhiIcon(\n  "${componentName}",\n  "${viewBox}",\n  ${jsx},\n);\n`;
}

export function renderDirectionCompatibilityModule(componentName, compatibilityName) {
  return `// 由 scripts/build-direction-icons.mjs 生成，禁止手改。\nexport { ${componentName} as ${compatibilityName} } from "./${componentName}";\n`;
}

export async function buildDirectionIcons() {
  if (directionIconManifest.length !== 38) {
    throw new Error(`Expected 38 direction icons, received ${directionIconManifest.length}.`);
  }

  await mkdir(generatedDirectory, { recursive: true });
  const exports = [];
  for (const item of directionIconManifest) {
    const sourcePath = resolve(iconDirectory, item.sourceFile);
    const svg = await readFile(sourcePath, "utf8");
    const component = renderDirectionIconComponent({
      componentName: item.componentName,
      sourceFile: item.sourceFile,
      svg,
    });
    await writeFile(resolve(generatedDirectory, `${item.componentName}.tsx`), component);
    exports.push(`export { ${item.componentName} } from "./${item.componentName}";`);
    for (const compatibilityName of item.compatibilityNames ?? []) {
      exports.push(`export { ${item.componentName} as ${compatibilityName} } from "./${item.componentName}";`);
      await writeFile(
        resolve(generatedDirectory, `${compatibilityName}.tsx`),
        renderDirectionCompatibilityModule(item.componentName, compatibilityName),
      );
    }
  }
  await writeFile(resolve(generatedDirectory, "index.ts"), `${exports.join("\n")}\nexport * from "./prompt";\nexport * from "./catalog";\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildDirectionIcons();
}
