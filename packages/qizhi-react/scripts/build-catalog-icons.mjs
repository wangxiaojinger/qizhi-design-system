import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  additionalCatalogItems,
  compatibilityMarkerComponentNames,
  editComponentNames,
  generalComponentNames,
  getCatalogFamily,
  interactionComponentNames,
  reusedComponentNames,
  trademarkComponentNames,
} from "./catalog-icons.config.mjs";
import { renderPromptMarkupIconComponent } from "./build-prompt-icons.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(scriptDirectory, "../../..");
const iconDirectory = resolve(scriptDirectory, "../src/icon");
const generatedDirectory = resolve(iconDirectory, "generated/catalog");
const manifestFile = resolve(iconDirectory, "catalog-icons.manifest.ts");
const correctedSources = new Map([
  ["TimeIcon", ["assets/icons/figma-combination/qz-icon-0-5374.svg", "0:5374"]],
  ["TimeFilledIcon", ["assets/icons/figma-combination/qz-icon-0-5378.svg", "0:5378"]],
  ["OnlineInferenceIcon", [
    "assets/icons/figma-combination/qz-icon-online-inference-provided.svg",
    "provided:在线推理.svg",
  ]],
]);
const solidCurrentColorComponentNames = new Set([
  "TagIcon",
  "TeamIcon",
  "TimeIcon",
  "UserPersonIcon",
]);

const decodeHtml = (value) => value
  .replaceAll("&amp;amp;", "&")
  .replaceAll("&amp;", "&")
  .replaceAll("&#64;", "@");

const toKebab = (value) => value
  .replace(/Icon$/, "")
  .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
  .toLowerCase();

function parseSection(html, semantic, componentNames) {
  const marker = `data-icon-semantic-section="${semantic}"`;
  const start = html.indexOf(marker);
  const end = html.indexOf("data-icon-semantic-section=", start + marker.length);
  if (start < 0) throw new Error(`Missing legacy icon section: ${semantic}.`);
  const section = html.slice(start, end < 0 ? undefined : end);
  const rows = [...section.matchAll(/<li class="icon-cell qizhi-icon-item"([\s\S]*?)<\/li>/g)];
  if (rows.length !== componentNames.length) {
    throw new Error(`${semantic} icon count mismatch: ${rows.length} !== ${componentNames.length}.`);
  }

  const rawItems = rows.map((match, index) => {
    const row = match[1];
    const read = (pattern, label) => {
      const value = row.match(pattern)?.[1];
      if (!value) throw new Error(`Missing ${label} in ${semantic} icon ${index + 1}.`);
      return decodeHtml(value.trim());
    };
    const dataName = read(/data-icon-name="([^"]+)"/, "data-icon-name");
    const legacyName = read(/data-icon-component="([^"]+)"/, "legacy component name");
    const displayName = read(/qizhi-icon-item__name">([^<]+)</, "display name");
    const category = read(/data-icon-category="([^"]+)"/, "category");
    const assetPath = read(/src="\.\/([^"]+\.svg)"/, "asset path");
    const sourceNodeId = dataName.match(/(\d+):(\d+)\s*$/)?.[0];
    if (!sourceNodeId) throw new Error(`Missing source node id for ${legacyName}.`);
    const componentName = componentNames[index];
    const correctedStyles = new Map([
      ["icon-发送-面性", "fill"],
      ["icon-时间-面性", "fill"],
      ["icon-时间", "outline"],
      ["icon-博客-面性", "fill"],
    ]);
    const style = correctedStyles.get(legacyName) ?? category;
    const correctedSource = correctedSources.get(componentName);
    return {
      assetPath: correctedSource?.[0] ?? assetPath,
      componentName,
      dataName,
      displayName,
      legacyName,
      sourceNodeId: correctedSource?.[1] ?? sourceNodeId,
      style,
    };
  });

  const duplicateDisplayNames = new Set(rawItems
    .filter((item, index, all) => all.some((other, otherIndex) => otherIndex !== index && other.displayName === item.displayName))
    .map((item) => item.displayName));

  return rawItems.map((item) => ({
    id: `${semantic}.${toKebab(item.componentName)}`,
    componentName: item.componentName,
    displayName: duplicateDisplayNames.has(item.displayName) && item.style === "fill"
      ? `${item.displayName}\uff08\u586b\u5145\uff09`
      : item.componentName.endsWith("AltIcon")
        ? `${item.displayName}\uff08\u6837\u5f0f\u4e8c\uff09`
        : item.displayName,
    legacyName: item.legacyName,
    aliases: [item.displayName, item.dataName, item.componentName.replace(/Icon$/, "")],
    semantic,
    family: getCatalogFamily(item.componentName),
    style: item.style,
    colorMode: "currentColor",
    sourceNodeId: item.sourceNodeId,
    sourceFile: `../../../../${item.assetPath}`,
    importPath: "@wangxiaojinger/qizhi-react/icon",
  }));
}

function renderManifest(interactionItems, editItems, trademarkItems, generalItems) {
  return `// \u7531 scripts/build-catalog-icons.mjs \u6839\u636e\u65e7\u89c4\u8303\u7ad9生成，禁止手改。\nimport type { CatalogIconManifestItem } from "./IconManifest.types";\n\nexport const interactionIconManifest = ${JSON.stringify(interactionItems, null, 2)} as const satisfies readonly CatalogIconManifestItem[];\n\nexport const editIconManifest = ${JSON.stringify(editItems, null, 2)} as const satisfies readonly CatalogIconManifestItem[];\n\nexport const trademarkIconManifest = ${JSON.stringify(trademarkItems, null, 2)} as const satisfies readonly CatalogIconManifestItem[];\n\nexport const generalIconManifest = ${JSON.stringify(generalItems, null, 2)} as const satisfies readonly CatalogIconManifestItem[];\n`;
}

export async function buildCatalogIcons() {
  const html = await readFile(resolve(projectDirectory, "index.html"), "utf8");
  const interactionItems = [
    ...parseSection(html, "interaction", interactionComponentNames),
    ...additionalCatalogItems,
  ];
  const editItems = parseSection(html, "edit", editComponentNames);
  const trademarkItems = parseSection(html, "trademark", trademarkComponentNames);
  const generalItems = parseSection(html, "general", generalComponentNames);
  const items = [...interactionItems, ...editItems, ...trademarkItems, ...generalItems];
  const names = new Set(items.map((item) => item.componentName));
  if (names.size !== items.length) throw new Error("Catalog icon component names must be unique.");

  await mkdir(generatedDirectory, { recursive: true });
  const exports = [];
  for (const item of items) {
    const sourcePath = resolve(iconDirectory, item.sourceFile);
    let svg = await readFile(sourcePath, "utf8");
    svg = svg.replace(/#(?:8C8C8C|818181)/gi, "black");
    if (solidCurrentColorComponentNames.has(item.componentName)) {
      svg = svg.replaceAll('fill-opacity="0.45"', 'fill-opacity="1"');
    }
    let component = renderPromptMarkupIconComponent({
      componentName: item.componentName,
      sourceFile: item.sourceFile,
      item,
      svg,
    }).replace("build-prompt-icons.mjs", "build-catalog-icons.mjs");
    if (compatibilityMarkerComponentNames.has(item.componentName)) {
      component = component.replace(
        /,\n\);\n$/,
        `,\n  { "data-icon": ${JSON.stringify(item.legacyName)} },\n);\n`,
      );
    }
    if (reusedComponentNames.has(item.componentName)) {
      const compatibleComponent = component
        .replace('from "../../createQizhiMarkupIcon"', 'from "./createQizhiMarkupIcon"');
      await writeFile(
        resolve(iconDirectory, `${item.componentName}.tsx`),
        compatibleComponent,
      );
      continue;
    }
    await writeFile(resolve(generatedDirectory, `${item.componentName}.tsx`), component);
    exports.push(`export { ${item.componentName} } from "./${item.componentName}";`);
  }
  await writeFile(resolve(generatedDirectory, "index.ts"), `${exports.join("\n")}\n`);
  await writeFile(manifestFile, renderManifest(interactionItems, editItems, trademarkItems, generalItems));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildCatalogIcons();
}
