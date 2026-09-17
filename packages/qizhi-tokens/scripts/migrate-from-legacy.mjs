import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const packageRoot = new URL("../", import.meta.url);
const repoRoot = new URL("../../../", import.meta.url);
const target = new URL("src/tokens.json", packageRoot);
const css = await readFile(new URL("styles.css", repoRoot), "utf8");
const root = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1];

if (!root) throw new Error("styles.css does not contain the legacy :root block");

const categoryFor = (name) => {
  if (/^--(?:qizhiblue|red|green|gold|orange|orangered|yellow|lime|cyan|blue|purple|pinkpurple|magenta|gray)-/.test(name)) return "基础色板";
  if (/^--(?:primary|link|success|warning|danger|data)-/.test(name)) return "语义色板";
  if (/^--color-text-/.test(name)) return "文字颜色";
  if (/^--color-border-/.test(name)) return "边框颜色";
  if (/^--color-fill-/.test(name)) return "填充颜色";
  if (/^--color-bg-/.test(name)) return "背景颜色";
  if (/^--color-/.test(name)) return "语义颜色";
  if (/radius/.test(name)) return "边框圆角";
  if (/shadow/.test(name)) return "阴影";
  if (/font-weight/.test(name)) return "字重";
  if (/font|line-height/.test(name)) return "字体";
  if (/height|width|gap/.test(name)) return "组件尺寸";
  return "基础变量";
};

const descriptionFor = (name, category) => {
  const label = name.slice(2).replaceAll("-", " ");
  return `${category}：${label}`;
};

const entries = [...root.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)]
  .map((match) => [`--${match[1]}`, match[2].replace(/\s+/g, " ").trim()])
  .filter(([name]) => !name.startsWith("--doc-"));

const tokens = Object.fromEntries(entries.map(([cssVariable, value]) => {
  const name = cssVariable.slice(2).replaceAll("-", ".");
  const category = categoryFor(cssVariable);
  return [name, {
    name,
    value,
    cssVariable,
    category,
    description: descriptionFor(cssVariable, category),
  }];
}));

await mkdir(fileURLToPath(new URL("src/", packageRoot)), { recursive: true });
await writeFile(target, `${JSON.stringify({
  name: "QIZHI Design Tokens",
  version: "0.1.0",
  tokens,
}, null, 2)}\n`, "utf8");

console.log(`Migrated ${Object.keys(tokens).length} public tokens from the legacy :root block.`);
