import { layoutDemos } from "./layoutDocs.registry";

describe("Layout legacy registry", () => {
  it("preserves the exact old-site order, titles and descriptions", () => {
    expect(layoutDemos.map(({ id, title, description }) => ({ id, title, description }))).toEqual([
      {
        id: "layout-basic",
        title: "基础用法",
        description: "典型的页面布局。上方展示 Header、Content、Footer 纵向结构，下方展示带 Sider 的复合结构。",
      },
      {
        id: "layout-framework-preview",
        title: "框架结构预览",
        description: "启智结构预览",
      },
    ]);
  });

  it("keeps the framework preview sourced from public PlatformShell", () => {
    const frameworkSource = layoutDemos.find(({ id }) => id === "layout-framework-preview")?.source;

    expect(frameworkSource).toContain('import { PlatformShell } from "@wangxiaojinger/qizhi-react"');
    expect(frameworkSource).toContain("<PlatformShell");
    expect(frameworkSource).not.toContain("Layout");
    expect(frameworkSource).not.toContain("TopNavigation");
    expect(frameworkSource).not.toContain("SideNavigation");
    expect(frameworkSource).not.toContain("../../menu/demos/SideMenuDemo");
    expect(
      [...(frameworkSource?.matchAll(/className="([^"]+)"/g) ?? [])]
        .map(([, className]) => className),
    ).toEqual([
      "layout-framework-demo",
      "layout-framework-demo__content",
    ]);
  });
});
