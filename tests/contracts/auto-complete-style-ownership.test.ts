import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const componentStyles = readFileSync("packages/qizhi-react/src/auto-complete/autoComplete.css", "utf8");

describe("AutoComplete style ownership", () => {
  it("使用组件根选择器隔离文档站 ul 缩进规则", () => {
    expect(componentStyles).toContain(".qizhi-auto-complete > .qizhi-auto-complete__popup {");
  });
});
