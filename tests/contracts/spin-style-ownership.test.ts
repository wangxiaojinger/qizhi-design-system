import { readFileSync } from "node:fs";

const legacyStyles = readFileSync("styles.css", "utf8");
const componentStyles = readFileSync(
  "packages/qizhi-react/src/spin/spin.css",
  "utf8",
);
const docsStyles = readFileSync(
  "apps/qizhi-docs/src/spin/spinDocs.css",
  "utf8",
);

it("keeps Spin behavior styles in the package and layout in the docs", () => {
  expect(componentStyles).toContain(".qizhi-spin {");
  expect(componentStyles).toContain(".qizhi-spin__overlay {");
  expect(componentStyles).not.toContain("spin-demo-card");
  expect(docsStyles).toContain(".spin-demo-card {");
  expect(docsStyles).not.toContain(".qizhi-spin__overlay {");
  expect(legacyStyles).not.toContain(".qizhi-spin__indicator {");
  expect(legacyStyles).not.toContain(".qizhi-spin--container {");
});
