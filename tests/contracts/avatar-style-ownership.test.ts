import { readFileSync } from "node:fs";

const componentSource = readFileSync("packages/qizhi-react/src/avatar/Avatar.tsx", "utf8");
const componentStyles = readFileSync("packages/qizhi-react/src/avatar/avatar.css", "utf8");

it("loads public Avatar visuals whenever the component is imported", () => {
  expect(componentSource).toContain('import "./avatar.css";');
  expect(componentStyles).toContain(".qizhi-avatar {");
  expect(componentStyles).toContain(".qizhi-avatar-size-default {");
  expect(componentStyles).toContain(".qizhi-avatar-shape-circle {");
  expect(componentStyles).toContain(".qizhi-avatar-group {");
});
