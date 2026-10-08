import { readFile } from "node:fs/promises";

export const readManifest = async (url) => JSON.parse(await readFile(url, "utf8"));

export const classifyTokenValue = (value) => {
  const normalized = String(value).trim();
  if (/^var\(--[a-zA-Z0-9-]+\)$/.test(normalized)) return "reference";
  if (/^\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}$/.test(normalized)) return "rgb-channel";
  if (/^(?:#[0-9a-f]{3,8}|rgba?\()/i.test(normalized)) return "color";
  if (/^-?(?:\d+|\d*\.\d+)%$/.test(normalized)) return "percentage";
  if (/^-?(?:\d+|\d*\.\d+)(?:px|rem|em|vh|vw|ms|s)$/.test(normalized)) return "length";
  if (/^-?(?:\d+|\d*\.\d+)$/.test(normalized)) return "number";
  if (/\b-?(?:\d+|\d*\.\d+)px\b/.test(normalized) && /(?:rgba?|#)/i.test(normalized)) return "shadow";
  return "font-family";
};

export const validateManifest = (manifest) => {
  const errors = [];
  const entries = Object.entries(manifest.tokens ?? {});
  const cssVariables = new Map();
  const tokenNames = new Set(entries.map(([name]) => name));
  const tierRank = { seed: 0, map: 1, alias: 2, component: 3 };

  for (const [name, token] of entries) {
    if (!/^[a-z][a-z0-9]*(?:\.[a-z0-9]+)*$/.test(name)) errors.push(`invalid token name: ${name}`);
    if (token.name !== name) errors.push(`token name field must match key: ${name}`);
    if (!/^--[a-z0-9-]+$/.test(token.cssVariable ?? "")) errors.push(`invalid css variable: ${name}`);
    if (!token.category) errors.push(`missing category: ${name}`);
    if (!token.description) errors.push(`missing description: ${name}`);
    if (!(token.tier in tierRank)) errors.push(`invalid tier: ${name}`);
    if (!new Set(["stable", "deprecated"]).has(token.status)) errors.push(`invalid status: ${name}`);
    if (token.status === "deprecated" && !token.replacedBy) errors.push(`deprecated token ${name} requires replacedBy`);
    if (token.replacedBy && !tokenNames.has(token.replacedBy)) errors.push(`${name} replacedBy target is missing: ${token.replacedBy}`);
    if (cssVariables.has(token.cssVariable)) errors.push(`duplicate css variable: ${token.cssVariable}`);
    cssVariables.set(token.cssVariable, name);
  }

  const dependencies = new Map(entries.map(([name]) => [name, []]));
  for (const [name, token] of entries) {
    for (const match of String(token.value).matchAll(/var\((--[a-zA-Z0-9-]+)\)/g)) {
      const target = cssVariables.get(match[1]);
      if (!target) {
        errors.push(`${name} references missing ${match[1]}`);
        continue;
      }
      dependencies.get(name).push(target);
      const targetToken = manifest.tokens[target];
      if (token.tier in tierRank && targetToken.tier in tierRank) {
        if (tierRank[targetToken.tier] > tierRank[token.tier]) {
          errors.push(`${name} (${token.tier}) cannot reference ${target} (${targetToken.tier})`);
        }
        if (token.tier === "component" && targetToken.tier === "component") {
          errors.push(`${name} component token cannot reference component token ${target}`);
        }
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  const visit = (name, path) => {
    if (visiting.has(name)) {
      const start = path.indexOf(name);
      errors.push(`token reference cycle: ${[...path.slice(start), name].join(" -> ")}`);
      return;
    }
    if (visited.has(name)) return;
    visiting.add(name);
    for (const dependency of dependencies.get(name) ?? []) visit(dependency, [...path, name]);
    visiting.delete(name);
    visited.add(name);
  };
  for (const [name] of entries) visit(name, []);

  return errors;
};

export const renderCss = (manifest) => {
  const declarations = Object.values(manifest.tokens)
    .map((token) => `  ${token.cssVariable}: ${token.value};`)
    .join("\n");
  return `:root {\n${declarations}\n}\n`;
};

export const publicTokenValues = (manifest) => Object.fromEntries(
  Object.entries(manifest.tokens).map(([name, token]) => [name, {
    name: token.name,
    value: token.value,
    cssVariable: token.cssVariable,
    category: token.category,
    description: token.description,
    tier: token.tier,
    status: token.status,
    ...(token.replacedBy ? { replacedBy: token.replacedBy } : {}),
  }]),
);

const migrationEntries = (manifest, legacyContract) => {
  const tokenByCssVariable = new Map(Object.entries(manifest.tokens).map(([name, token]) => [token.cssVariable, name]));
  return Object.fromEntries(Object.entries(manifest.tokens).map(([name, token]) => {
    const referencedCssVariable = String(token.value).match(/^var\((--[a-zA-Z0-9-]+)\)$/)?.[1];
    const action = token.status === "deprecated"
      ? "deprecated"
      : !(name in legacyContract)
        ? "add"
        : referencedCssVariable
          ? "compat-alias"
          : "keep";
    return [name, {
    token: name,
    cssVariable: token.cssVariable,
    action,
    recommendedToken: token.replacedBy ?? (referencedCssVariable ? tokenByCssVariable.get(referencedCssVariable) : name) ?? name,
    valueType: classifyTokenValue(token.value),
    replacement: token.replacedBy ?? null,
    note: token.status === "deprecated" ? `Use ${token.replacedBy}` : token.description,
    }];
  }));
};

export const renderMigrationMap = (manifest, legacyContract) => `${JSON.stringify(migrationEntries(manifest, legacyContract), null, 2)}\n`;

export const renderMigrationMarkdown = (manifest, legacyContract) => {
  const entries = Object.values(migrationEntries(manifest, legacyContract));
  const counts = Object.fromEntries(["keep", "compat-alias", "add", "deprecated"].map((action) => [action, entries.filter((entry) => entry.action === action).length]));
  const actionLabels = { keep: "保留", "compat-alias": "兼容别名", add: "新增", deprecated: "弃用" };
  const rows = entries.map((entry) => `| \`${entry.token}\` | \`${entry.cssVariable}\` | ${actionLabels[entry.action]} | \`${entry.recommendedToken}\` | ${entry.valueType} | ${entry.note.replaceAll("|", "\\|")} |`).join("\n");
  return `# QIZHI 变量重构映射表\n\n> 本文件由 \`packages/qizhi-tokens/src/tokens.json\` 与 \`src/legacy-contract.json\` 生成，请勿手工编辑。\n\n保留：${counts.keep}；兼容别名：${counts["compat-alias"]}；新增：${counts.add}；弃用：${counts.deprecated}\n\n| 原 Token | CSS 变量 | 处理方式 | 推荐 Token | 值类型 | 迁移说明 |\n| --- | --- | --- | --- | --- | --- |\n${rows}\n`;
};

export const renderTypes = () => "export type QizhiTokenTier = \"seed\" | \"map\" | \"alias\" | \"component\";\nexport type QizhiTokenStatus = \"stable\" | \"deprecated\";\nexport interface QizhiToken { readonly name: string; readonly value: string; readonly cssVariable: `--${string}`; readonly category: string; readonly description: string; readonly tier: QizhiTokenTier; readonly status: QizhiTokenStatus; readonly replacedBy?: string; }\nexport declare const tokens: Readonly<Record<string, QizhiToken>>;\n";
