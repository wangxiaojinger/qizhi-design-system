import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const EXCLUDED_DIRECTORIES = new Set([".git", "node_modules", "dist"]);

export function fingerprintFiles(root, files) {
  const hash = crypto.createHash("sha256");
  for (const file of [...new Set(files)].sort()) {
    hash.update(file);
    hash.update("\0");
    hash.update(fs.readFileSync(path.join(root, file)));
    hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}

export function collectSourceFiles(root, { roots = ["."], extensions = [] } = {}) {
  const accepted = new Set(extensions.map((extension) => extension.toLowerCase()));
  const files = [];
  const visit = (absolute) => {
    const stat = fs.statSync(absolute);
    if (stat.isFile()) {
      if (!accepted.size || accepted.has(path.extname(absolute).toLowerCase())) {
        files.push(path.relative(root, absolute).split(path.sep).join("/"));
      }
      return;
    }
    for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
      if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) continue;
      visit(path.join(absolute, entry.name));
    }
  };
  for (const sourceRoot of roots) {
    const absolute = path.resolve(root, sourceRoot);
    if (fs.existsSync(absolute)) visit(absolute);
  }
  return [...new Set(files)].sort();
}

export function staticAuditSourceFiles(root) {
  return collectSourceFiles(root, {
    roots: ["index.html", "styles.css", "packages/qizhi-react/src", "apps/qizhi-docs/src", "apps/qizhi-react-smoke/src", "generated-react-pages", "scripts/theme-audit-provenance.mjs", "scripts/theme-gap-audit-lib.mjs", "scripts/audit-theme-gaps.mjs"],
    extensions: [".css", ".html", ".js", ".jsx", ".mjs", ".ts", ".tsx"],
  });
}

export function runtimeAuditSourceFiles(root) {
  return collectSourceFiles(root, {
    roots: ["index.html", "styles.css", "script.js", "packages/qizhi-tokens/src/tokens.json", "packages/qizhi-react/src", "apps/qizhi-docs/src", "scripts/theme-audit-provenance.mjs", "scripts/audit-theme-runtime.mjs", "scripts/theme-runtime-audit-matrix.mjs"],
    extensions: [".css", ".html", ".js", ".jsx", ".json", ".mjs", ".ts", ".tsx"],
  });
}

export function staticAuditFingerprint(root) {
  return fingerprintFiles(root, staticAuditSourceFiles(root));
}

export function runtimeAuditFingerprint(root) {
  return fingerprintFiles(root, runtimeAuditSourceFiles(root));
}
