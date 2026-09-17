import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promptIconManifest } from "../src/icon/prompt-icons.manifest.ts";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const iconDirectory = resolve(scriptDirectory, "../src/icon");
const generatedDirectory = resolve(iconDirectory, "generated/prompt");

const normalizePaint = (paint) => paint.toUpperCase();
const normalizeApprovedPaint = (paint) => paint === "white" ? "#FFFFFF" : normalizePaint(paint);

export function validatePromptSvg(svg, item) {
  if (!/<svg\b[^>]*\bviewBox="[^"]+"/i.test(svg)) throw new Error("Prompt icon SVG requires a viewBox.");
  if (/<(?:script|foreignObject|style)\b/i.test(svg)) throw new Error("Prompt icon SVG contains unsafe content.");
  if (/\son[a-z]+=/i.test(svg)) throw new Error("Prompt icon SVG must not contain event handlers.");
  if (/(?:href|src)="https?:\/\//i.test(svg)) throw new Error("Prompt icon SVG must not contain external resources.");
  const allowedTags = new Set([
    "svg", "g", "path", "circle", "rect", "defs", "linearGradient",
    "stop", "clipPath", "mask", "filter", "feFlood", "feColorMatrix",
    "feOffset", "feGaussianBlur", "feComposite", "feBlend", "feDropShadow",
    "feMerge", "feMergeNode",
  ]);
  const unsupportedTag = [...svg.matchAll(/<([a-z][\w:-]*)\b/gi)].map((match) => match[1]).find((tag) => !allowedTags.has(tag));
  if (unsupportedTag) throw new Error(`Prompt icon SVG contains unsupported tag: ${unsupportedTag}.`);

  const ids = new Set([...svg.matchAll(/\bid="([^"]+)"/gi)].map((match) => match[1]));
  for (const match of svg.matchAll(/url\(#([^)]+)\)/gi)) {
    if (!ids.has(match[1])) throw new Error(`Prompt icon SVG references missing id: ${match[1]}.`);
  }

  const fixed = item.colorMode === "fixedPalette"
    ? new Set(item.fixedColors.map(normalizeApprovedPaint))
    : new Set(["BLACK", "#FFFFFF"]);
  for (const match of svg.matchAll(/(?:fill|stroke|stop-color)="([^"]+)"/gi)) {
    const paint = match[1];
    if (paint === "none" || /^url\(#/.test(paint)) continue;
    if (!fixed.has(normalizeApprovedPaint(paint))) {
      throw new Error(`Prompt icon SVG contains unsupported paint: ${paint}.`);
    }
  }
}

export function transformPromptSvgMarkup(svg, item) {
  validatePromptSvg(svg, item);
  const viewBox = svg.match(/\bviewBox="([^"]+)"/i)?.[1];
  let markup = svg.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/i)?.[1];
  if (!viewBox || markup === undefined) throw new Error("Prompt icon SVG cannot be transformed.");
  markup = markup
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\sdata-figma-[\w-]+="[^"]*"/gi, "")
    .replace(/\bid="([^"]+)"/gi, 'id="__QIZHI_ICON_ID__-$1"')
    .replace(/url\(#([^)]+)\)/gi, "url(#__QIZHI_ICON_ID__-$1)");
  if (item.colorMode === "currentColor") {
    markup = markup.replace(/\b(fill|stroke)="black"/gi, '$1="currentColor"');
  }
  return { viewBox, markup: markup.trim() };
}

export function renderPromptMarkupIconComponent({ componentName, sourceFile, item, svg }) {
  const { viewBox, markup } = transformPromptSvgMarkup(svg, item);
  return `// 由 scripts/build-prompt-icons.mjs 生成，禁止手改。\n// Source: ${sourceFile}\nimport { createQizhiMarkupIcon } from "../../createQizhiMarkupIcon";\n\nexport const ${componentName} = createQizhiMarkupIcon(\n  "${componentName}",\n  "${viewBox}",\n  ${JSON.stringify(markup)},\n);\n`;
}

export function validateFixedPaletteSvg(svg, approvedPaints) {
  if (!/<svg\b[^>]*\bviewBox="[^"]+"/i.test(svg)) {
    throw new Error("Fixed palette icon SVG requires a viewBox.");
  }
  if (/<script\b/i.test(svg)) {
    throw new Error("Fixed palette icon SVG must not contain script.");
  }
  if (/(?:href|src)="https?:\/\//i.test(svg)) {
    throw new Error("Fixed palette icon SVG must not contain an external resource.");
  }
  if (/(?:url\(#|href="#)/i.test(svg)) {
    throw new Error("Fixed palette icon SVG must not contain an internal reference.");
  }

  const unsupportedTag = [...svg.matchAll(/<([a-z][\w:-]*)\b/gi)]
    .map((match) => match[1])
    .find((tag) => !["svg", "g", "path"].includes(tag));
  if (unsupportedTag) {
    throw new Error(`Fixed palette icon SVG contains unsupported tag: ${unsupportedTag}.`);
  }
  if ((svg.match(/<path\b/gi) ?? []).length !== 1) {
    throw new Error("Fixed palette icon SVG requires exactly one path.");
  }

  const allowedPaints = new Set(["NONE", ...approvedPaints.map(normalizePaint)]);
  for (const match of svg.matchAll(/(?:fill|stroke)="([^"]+)"/gi)) {
    if (!allowedPaints.has(normalizePaint(match[1]))) {
      throw new Error(`Fixed palette icon SVG contains unsupported paint: ${match[1]}.`);
    }
  }
}

export function transformFixedPaletteSvg(svg, approvedPaints) {
  validateFixedPaletteSvg(svg, approvedPaints);
  const viewBox = svg.match(/\bviewBox="([^"]+)"/i)?.[1];
  const path = svg.match(/<path\b[^>]*\/?\s*>/i)?.[0];
  if (!viewBox || !path) {
    throw new Error("Fixed palette icon SVG requires exactly one path.");
  }

  const jsx = path
    .replace(/\s+id="[^"]*"/gi, "")
    .replace(/\bfill-rule=/gi, "fillRule=")
    .replace(/\bclip-rule=/gi, "clipRule=")
    .replace(/\bfill-opacity=/gi, "fillOpacity=")
    .replace(/\bstroke-opacity=/gi, "strokeOpacity=")
    .replace(/\s*\/?>$/, " />");

  return { viewBox, jsx };
}

export function renderPromptIconComponent({
  componentName,
  sourceFile,
  approvedPaints,
  svg,
}) {
  const { viewBox, jsx } = transformFixedPaletteSvg(svg, approvedPaints);
  return `// 由 scripts/build-prompt-icons.mjs 生成，禁止手改。\n// Source: ${sourceFile}\nimport { createQizhiIcon } from "../../createQizhiIcon";\n\nexport const ${componentName} = createQizhiIcon(\n  "${componentName}",\n  "${viewBox}",\n  ${jsx},\n);\n`;
}

export async function buildPromptIcons() {
  await mkdir(generatedDirectory, { recursive: true });
  const exports = [];
  for (const item of promptIconManifest) {
    const svg = await readFile(resolve(iconDirectory, item.sourceFile), "utf8");
    const useSinglePathFixed = item.componentName === "StatusSuccessIcon" || item.componentName === "StatusFailureIcon";
    const component = useSinglePathFixed
      ? renderPromptIconComponent({ componentName: item.componentName, sourceFile: item.sourceFile, approvedPaints: item.fixedColors, svg })
      : renderPromptMarkupIconComponent({ componentName: item.componentName, sourceFile: item.sourceFile, item, svg });
    await writeFile(resolve(generatedDirectory, `${item.componentName}.tsx`), component);
    exports.push(`export { ${item.componentName} } from "./${item.componentName}";`);
  }
  await writeFile(resolve(generatedDirectory, "index.ts"), `${exports.join("\n")}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildPromptIcons();
}
