import { readFileSync } from "node:fs";

const legacyStyles = readFileSync("styles.css", "utf8");
const componentSource = readFileSync("packages/qizhi-react/src/button/Button.tsx", "utf8");
const componentStyles = readFileSync("packages/qizhi-react/src/button/button.css", "utf8");

it("keeps public Button visuals in the component package and document layout in the site", () => {
  for (const selector of [".qizhi-btn {", ".qizhi-btn-primary {", ".qizhi-btn-size-mini {"]) {
    expect(componentStyles).toContain(selector);
  }
  expect(legacyStyles).not.toContain(":is(.button-demo-row, .button-long-demo__inner) .qizhi-btn");
  expect(legacyStyles).not.toContain(".button-size-demo-row .qizhi-btn-size-");
  expect(legacyStyles).not.toContain(".qizhi-drawer-footer .qizhi-btn-secondary");
  expect(legacyStyles).toContain(".button-demo-row {");
  expect(componentStyles).not.toContain(".button-demo-row");
});

it("loads public Button visuals whenever the component is imported", () => {
  expect(componentSource).toContain('import "./button.css";');
});
