import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const codeboxes = [
  "apps/qizhi-docs/src/code-preview/CodePreviewDemoCodebox.tsx",
  "apps/qizhi-docs/src/markdown-viewer/MarkdownViewerDemoCodebox.tsx",
  "apps/qizhi-docs/src/log-viewer/LogViewerDemoCodebox.tsx",
];

describe("content viewer docs boundary", () => {
  it.each(codeboxes)("%s uses the shared QIZHI action area", (path) => {
    const source = readFileSync(path, "utf8");

    expect(source).toContain("component-example-actions");
    expect(source).toContain("qizhi-code-action");
    expect(source).toContain("<CodeIcon");
    expect(source).toContain("<CopyIcon");
    expect(source).not.toMatch(/<button\b|<input\b|<select\b|<svg\b|style=\{\{/);
  });
});
