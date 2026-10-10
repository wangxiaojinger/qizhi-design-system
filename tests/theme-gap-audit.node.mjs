import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  auditCssSource,
  classifyAuditScope,
  discoverAuditCssFiles,
  discoverAuditCssInventory,
} from "../scripts/theme-gap-audit-lib.mjs";

test("detects multiline and mixed literal declarations instead of dropping any value containing var()", () => {
  const source = `
    .notice {
      box-shadow:
        0 4px 16px var(--shadow-color);
      padding: var(--space-8, 8px) 12px;
      color: var(--text, #1d2129);
      z-index: 1200;
    }
  `;

  const findings = auditCssSource(source, "packages/qizhi-react/src/message/message.css", "component-runtime");

  assert.deepEqual(
    findings.map(({ category, property }) => [category, property]),
    [
      ["shadow", "box-shadow"],
      ["spacing", "padding"],
      ["color", "color"],
      ["layer", "z-index"],
    ],
  );
  assert.equal(findings[0].classification, "theme-token-candidate");
  assert.equal(findings[1].classification, "review-required");
  assert.equal(findings[2].classification, "review-required");
  assert.equal(findings[3].classification, "theme-token-candidate");
  assert.ok(findings.every((finding) => finding.line > 0));
});

test("classifies structural offsets separately from density candidates", () => {
  const findings = auditCssSource(
    ".arrow { left: -4px; padding: 8px 12px; gap: 4px; z-index: 1; }",
    "packages/qizhi-react/src/tooltip/tooltip.css",
    "component-runtime",
  );

  assert.equal(findings.find(({ property }) => property === "left")?.classification, "structural-constant");
  assert.equal(findings.find(({ property }) => property === "padding")?.classification, "theme-token-candidate");
  assert.equal(findings.find(({ property }) => property === "gap")?.classification, "theme-token-candidate");
  assert.equal(findings.find(({ property }) => property === "z-index")?.classification, "structural-constant");
});

test("ignores token-mediated colors while retaining literal fallbacks and fixed alpha", () => {
  const findings = auditCssSource(`
    .token-only {
      color: rgb(var(--primary-6));
      background: var(--color-white);
    }
    .literal-fallback {
      -webkit-text-fill-color: var(--color-text-1, #1d2129);
      --qizhi-tooltip-bg: var(--component-tooltip-background, #1d2129);
      color: rgba(var(--primary-6), 0.2);
    }
  `, "packages/qizhi-react/src/input/input.css", "component-runtime");

  assert.deepEqual(
    findings.map(({ property }) => property),
    ["-webkit-text-fill-color", "--qizhi-tooltip-bg", "color"],
  );
});

test("assigns a unique id to repeated declarations on the same line", () => {
  const findings = auditCssSource(
    ".one { color: #fff; } .two { color: #000; }",
    "packages/qizhi-react/src/button/button.css",
    "component-runtime",
  );

  assert.equal(findings.length, 2);
  assert.equal(new Set(findings.map(({ id }) => id)).size, findings.length);
  assert.notEqual(findings[0].column, findings[1].column);
});

test("includes every first-party runtime surface and excludes vendor assets", () => {
  const paths = [
    "styles.css",
    "packages/qizhi-react/src/button/button.css",
    "apps/qizhi-docs/src/button/buttonDocs.css",
    "apps/qizhi-react-smoke/src/smoke.css",
    "generated-react-pages/agent-management/src/page.css",
    "assets/remixicon/remixicon.css",
    "dist/assets/index.css",
    "node_modules/vendor/index.css",
  ];

  assert.deepEqual(paths.map(classifyAuditScope), [
    "legacy-runtime",
    "component-runtime",
    "docs-runtime",
    "smoke-runtime",
    "generated-runtime",
    null,
    null,
    null,
  ]);
});

test("repository discovery returns sorted first-party CSS paths", () => {
  const files = discoverAuditCssFiles(process.cwd());
  assert.ok(files.includes("styles.css"));
  assert.ok(files.includes("packages/qizhi-react/src/button/button.css"));
  assert.ok(files.includes("apps/qizhi-react-smoke/src/smoke.css"));
  assert.ok(files.includes("generated-react-pages/agent-management/src/page.css"));
  assert.ok(!files.includes("assets/remixicon/remixicon.css"));
  assert.deepEqual(files, [...files].sort());
});

test("repository discovery excludes unreferenced first-party CSS and reports it", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "qizhi-theme-audit-"));
  try {
    fs.mkdirSync(path.join(root, "apps/example/src"), { recursive: true });
    fs.writeFileSync(path.join(root, "apps/example/src/index.ts"), 'import "./used.css";\n');
    fs.writeFileSync(path.join(root, "apps/example/src/used.css"), ".used { color: #fff; }\n");
    fs.writeFileSync(path.join(root, "apps/example/src/orphan.css"), ".orphan { color: #000; }\n");

    const classify = (relativePath) => relativePath.endsWith(".css") ? "fixture-runtime" : null;
    const inventory = discoverAuditCssInventory(root, { classify });

    assert.deepEqual(inventory.files, ["apps/example/src/used.css"]);
    assert.deepEqual(inventory.unreferencedFiles, ["apps/example/src/orphan.css"]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
