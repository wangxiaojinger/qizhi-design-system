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
    if (token.themes && (typeof token.themes !== "object" || Array.isArray(token.themes))) errors.push(`invalid themes: ${name}`);
    if (cssVariables.has(token.cssVariable)) errors.push(`duplicate css variable: ${token.cssVariable}`);
    cssVariables.set(token.cssVariable, name);
  }

  const dependencies = new Map(entries.map(([name]) => [name, []]));
  for (const [name, token] of entries) {
    const values = [token.value, ...Object.values(token.themes ?? {})];
    for (const value of values) for (const match of String(value).matchAll(/var\((--[a-zA-Z0-9-]+)\)/g)) {
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

const renderDeclarations = (tokens, readValue) => Object.values(tokens)
  .map((token) => {
    const value = readValue(token);
    return value === undefined ? null : `  ${token.cssVariable}: ${value};`;
  })
  .filter(Boolean)
  .join("\n");

export const renderCss = (manifest) => {
  const light = `  color-scheme: light;\n${renderDeclarations(manifest.tokens, (token) => token.value)}`;
  const darkDeclarations = renderDeclarations(manifest.tokens, (token) => token.themes?.dark);
  const dark = darkDeclarations ? `  color-scheme: dark;\n${darkDeclarations}` : null;
  return [`:root {\n${light}\n}`, dark ? `body[data-theme="dark"] {\n${dark}\n}` : null]
    .filter(Boolean)
    .join("\n\n") + "\n";
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

export const renderTypes = () => "export type QizhiTokenTier = \"seed\" | \"map\" | \"alias\" | \"component\";\nexport type QizhiTokenStatus = \"stable\" | \"deprecated\";\nexport interface QizhiToken { readonly name: string; readonly value: string; readonly cssVariable: `--${string}`; readonly category: string; readonly description: string; readonly tier: QizhiTokenTier; readonly status: QizhiTokenStatus; readonly replacedBy?: string; }\nexport declare const tokens: Readonly<Record<string, QizhiToken>>;\n";
