import { render, screen } from "@testing-library/react";
import { buttonApi } from "./buttonApi";
import { buttonDemos } from "./buttonDocs.registry";

describe("Button docs registry", () => {
  it("registers the eight QIZHI Button demos with real source", () => {
    expect(buttonDemos.map((demo) => demo.id)).toEqual([
      "基本用法", "图标按钮", "按钮形状", "按钮尺寸", "按钮状态", "禁用按钮", "加载中按钮", "长按钮",
    ]);
    for (const demo of buttonDemos) {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).toContain("const App = () => {");
      expect(demo.source).toContain("return (");
      expect(demo.source).toContain("export default App;");
      expect(demo.source.split("\n").length).toBeGreaterThan(5);
    }
    expect(buttonDemos[0].source).toContain("Button, Space");
    expect(buttonDemos[0].source).toContain('<Space size="large">');
    expect(buttonDemos.find((demo) => demo.id === "按钮形状")?.source).not.toMatch(/shape="(?:round|circle)"/);
    expect(buttonDemos.some((demo) => demo.source.includes("<Button.Group"))).toBe(false);
  });

  it("renders every registered demo", () => {
    for (const demo of buttonDemos) {
      const Demo = demo.component;
      const { unmount } = render(<Demo />);
      expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
      unmount();
    }
  });

  it("documents the complete QIZHI Button API with independent descriptions", () => {
    expect(buttonApi.map((item) => item.name)).toEqual([
      "disabled", "iconOnly", "iconPosition", "loading", "loadingFixedWidth", "long", "href", "target", "htmlType",
      "size", "status", "type", "icon", "anchorProps", "className", "style", "onClick",
    ]);
    expect(buttonApi).toContainEqual(expect.objectContaining({
      name: "type",
      type: '"default" | "primary" | "secondary" | "dashed" | "text"',
      defaultValue: '"default"',
    }));
    expect(buttonApi).toContainEqual(expect.objectContaining({ name: "loading", type: "boolean", defaultValue: "false" }));
    expect(buttonApi.find((item) => item.name === "type")?.description).toContain(
      "secondary 和 `default` 均为中性线框次要按钮",
    );
    expect(buttonDemos[0].description).toContain("次要按钮为中性线框样式");
    expect(buttonDemos[0].source).not.toContain('type="outline"');
    expect(buttonApi.every((item) => item.description.length > 2)).toBe(true);
    expect(buttonApi.every((item) => item.description !== `设置按钮的 ${item.name}`)).toBe(true);
  });
});
