import fs from "node:fs";
import path from "node:path";

const HEX_COLOR_LITERAL = /#[0-9a-f]{3,8}\b/i;
const NAMED_COLOR_LITERAL = /(?:^|[\s,(])(?:white|black)(?=$|[\s,)])/i;
const COLOR_FUNCTION = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\s*\([^)]*\)/gi;
const LENGTH_LITERAL = /(?:^|[\s,(*/+-])-?(?:\d*\.)?\d+(?:px|rem|em|vh|vw|vmin|vmax|%)\b/i;
const SPACING_PROPERTY = /^(?:margin(?:-(?:block|inline|top|right|bottom|left)(?:-(?:start|end))?)?|padding(?:-(?:block|inline|top|right|bottom|left)(?:-(?:start|end))?)?|gap|row-gap|column-gap|inset(?:-(?:block|inline)(?:-(?:start|end))?)?|top|right|bottom|left)$/i;
const POSITION_PROPERTY = /^(?:inset(?:-(?:block|inline)(?:-(?:start|end))?)?|top|right|bottom|left)$/i;
const COLOR_PROPERTY = /^(?:color|.*-color|background(?:-color|-image)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|fill|stroke|outline(?:-color)?|caret-color|text-decoration-color)$/i;
const SHADOW_PROPERTY = /^(?:box-shadow|text-shadow|filter)$/i;

export function classifyAuditScope(relativePath) {
  const normalized = relativePath.split(path.sep).join("/");
  if (normalized === "styles.css") return "legacy-runtime";
  if (normalized.startsWith("packages/qizhi-react/src/") && normalized.endsWith(".css")) return "component-runtime";
  if (normalized.startsWith("apps/qizhi-docs/src/") && normalized.endsWith(".css")) return "docs-runtime";
  if (normalized.startsWith("apps/qizhi-react-smoke/src/") && normalized.endsWith(".css")) return "smoke-runtime";
  if (normalized.startsWith("generated-react-pages/") && normalized.includes("/src/") && normalized.endsWith(".css")) return "generated-runtime";
  return null;
}

const SOURCE_REFERENCE_EXTENSION = /\.(?:css|html?|[cm]?[jt]sx?)$/i;
const CSS_REFERENCE = /["'`]([^"'`]+\.css(?:[?#][^"'`]*)?)["'`]/g;

function normalizeRelative(root, absolute) {
  return path.relative(root, absolute).split(path.sep).join("/");
}

export function discoverAuditCssInventory(root, { classify = classifyAuditScope } = {}) {
  const candidates = [];
  const referenceSources = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if ([".git", "node_modules", "dist"].includes(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) {
        const relative = normalizeRelative(root, absolute);
        if (entry.name.endsWith(".css") && classify(relative)) candidates.push(relative);
        if (SOURCE_REFERENCE_EXTENSION.test(entry.name)) referenceSources.push(relative);
      }
    }
  };
  visit(root);

  const referenced = new Set();
  for (const sourceFile of referenceSources) {
    const source = fs.readFileSync(path.join(root, sourceFile), "utf8");
    for (const match of source.matchAll(CSS_REFERENCE)) {
      const reference = match[1].split(/[?#]/, 1)[0];
      const absolute = reference.startsWith("/")
        ? path.resolve(root, `.${reference}`)
        : path.resolve(root, path.dirname(sourceFile), reference);
      const relative = normalizeRelative(root, absolute);
      if (!relative.startsWith("../") && classify(relative) && fs.existsSync(absolute)) referenced.add(relative);
    }
  }

  const sortedCandidates = candidates.sort();
  return {
    files: sortedCandidates.filter((file) => referenced.has(file)),
    unreferencedFiles: sortedCandidates.filter((file) => !referenced.has(file)),
  };
}

export function discoverAuditCssFiles(root) {
  return discoverAuditCssInventory(root).files;
}

function withoutComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
}

function extractDeclarations(source) {
  const clean = withoutComments(source);
  const declarations = [];
  const pattern = /([\w-]+)\s*:\s*([^;{}]+);/g;
  for (const match of clean.matchAll(pattern)) {
    declarations.push({
      property: match[1],
      value: match[2].trim().replace(/\s+/g, " "),
      line: clean.slice(0, match.index).split("\n").length,
      column: match.index - clean.lastIndexOf("\n", match.index - 1),
    });
  }
  return declarations;
}

function containsColorLiteral(value) {
  if (HEX_COLOR_LITERAL.test(value) || NAMED_COLOR_LITERAL.test(value)) return true;
  const withoutVariables = value.replace(/var\([^)]*\)/gi, "");
  return [...withoutVariables.matchAll(COLOR_FUNCTION)].some(([color]) => /(?:^|[^\w-])(?:\d*\.)?\d/.test(color));
}

function classifyFinding(category, property, value, scope) {
  if (scope !== "component-runtime" && scope !== "legacy-runtime") return "review-required";
  if (category === "shadow") return "theme-token-candidate";
  if (category === "layer") return /^-?[012]$/.test(value) ? "structural-constant" : "theme-token-candidate";
  if (category === "spacing") {
    if (POSITION_PROPERTY.test(property) || /(?:^|\s)-\d/.test(value)) return "structural-constant";
    if (value.includes("var(")) return "review-required";
    return /^(?:padding|gap|row-gap|column-gap)/i.test(property) ? "theme-token-candidate" : "review-required";
  }
  if (value.includes("var(")) return "review-required";
  return "theme-token-candidate";
}

function reasonFor(category, property, value, classification) {
  if (classification === "structural-constant") return category === "layer" ? "local stacking order" : "positional or geometric offset";
  if (value.includes("var(")) return `mixed ${category} literal and CSS variable`;
  if (classification === "review-required") return "non-component surface or ambiguous design responsibility";
  if (category === "spacing") return `${property} participates in component density`;
  return `unmediated ${category} responsibility`;
}

export function auditCssSource(source, file, scope = classifyAuditScope(file)) {
  const findings = [];
  for (const declaration of extractDeclarations(source)) {
    const { property, value, line, column } = declaration;
    let category = null;
    if (SHADOW_PROPERTY.test(property)
      && (property !== "filter" || /drop-shadow\s*\(/i.test(value))
      && value !== "none"
      && (LENGTH_LITERAL.test(value) || containsColorLiteral(value))) category = "shadow";
    else if (property === "z-index" && /-?\d/.test(value)) category = "layer";
    else if (SPACING_PROPERTY.test(property) && LENGTH_LITERAL.test(value) && !/^0(?:\s+0)*$/.test(value)) category = "spacing";
    else if ((COLOR_PROPERTY.test(property) || property.startsWith("--")) && containsColorLiteral(value)) category = "color";
    if (!category) continue;
    const classification = classifyFinding(category, property, value, scope);
    findings.push({
      id: `${category}:${file}:${line}:${column}:${property}`,
      scope,
      file,
      line,
      column,
      category,
      property,
      value,
      classification,
      reason: reasonFor(category, property, value, classification),
    });
  }
  return findings;
}

export function auditRepository(root) {
  const { files, unreferencedFiles } = discoverAuditCssInventory(root);
  const findings = files.flatMap((file) => auditCssSource(
    fs.readFileSync(path.join(root, file), "utf8"),
    file,
    classifyAuditScope(file),
  ));
  return { files, unreferencedFiles, findings };
}

export function summarizeAudit({ files, unreferencedFiles = [], findings }) {
  const summary = { files: files.length, unreferencedFiles: unreferencedFiles.length, findings: findings.length, byScope: {}, byCategory: {}, byClassification: {} };
  for (const finding of findings) {
    summary.byScope[finding.scope] = (summary.byScope[finding.scope] ?? 0) + 1;
    summary.byCategory[finding.category] = (summary.byCategory[finding.category] ?? 0) + 1;
    summary.byClassification[finding.classification] = (summary.byClassification[finding.classification] ?? 0) + 1;
  }
  return summary;
}
