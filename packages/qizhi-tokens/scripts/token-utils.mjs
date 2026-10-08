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

  for (const [name, token] of entries) {
    if (!/^[a-z][a-z0-9]*(?:\.[a-z0-9]+)*$/.test(name)) errors.push(`invalid token name: ${name}`);
    if (token.name !== name) errors.push(`token name field must match key: ${name}`);
    if (!/^--[a-z0-9-]+$/.test(token.cssVariable ?? "")) errors.push(`invalid css variable: ${name}`);
    if (!token.category) errors.push(`missing category: ${name}`);
    if (!token.description) errors.push(`missing description: ${name}`);
    if (cssVariables.has(token.cssVariable)) errors.push(`duplicate css variable: ${token.cssVariable}`);
    cssVariables.set(token.cssVariable, name);
  }

  for (const [name, token] of entries) {
    for (const match of String(token.value).matchAll(/var\((--[a-zA-Z0-9-]+)\)/g)) {
      if (!cssVariables.has(match[1])) errors.push(`${name} references missing ${match[1]}`);
    }
  }

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
  }]),
);

export const renderTypes = () => "export interface QizhiToken { readonly name: string; readonly value: string; readonly cssVariable: `--${string}`; readonly category: string; readonly description: string; }\nexport declare const tokens: Readonly<Record<string, QizhiToken>>;\n";
