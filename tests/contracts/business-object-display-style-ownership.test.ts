import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const component = readFileSync(
  "packages/qizhi-react/src/business-objects/businessObjects.css",
  "utf8",
);
const legacy = readFileSync("styles.css", "utf8");

test("object display card visuals belong to qizhi-react", () => {
  [
    ".qizhi-model-card {",
    ".qizhi-skill-service-card {",
    ".qizhi-project-card {",
    ".qizhi-confirmation-summary {",
  ].forEach((selector) => {
    expect(component).toContain(selector);
    expect(legacy).not.toContain(selector);
  });
});

test("object display docs CSS does not style component internals", () => {
  const docs = readFileSync(
    "apps/qizhi-docs/src/business-object-display/businessObjectDisplay.css",
    "utf8",
  );
  expect(docs).not.toMatch(/\.qizhi-[a-z0-9-]+__/);
});
