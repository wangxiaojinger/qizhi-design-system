import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MenuDocsIsland } from "./MenuDocsIsland";
import { menuApi } from "./menuApi";
import { menuDemos } from "./menuDocs.registry";

describe("Menu docs", () => {
  it("locks the two legacy demos in exact order and copy", () => {
    expect(menuDemos.map((demo) => [demo.id, demo.title, demo.description]))
      .toEqual([
        [
          "顶部导航菜单",
          "顶部导航栏",
          "设置 mode 为 horizontal 时，使用水平菜单；仅当导航项无法在当前可用空间内完整展示时出现“更多”，空间恢复后自动展开全部导航项。",
        ],
        [
          "左侧菜单",
          "左侧菜单",
          "菜单内可以嵌入多个子项，通过 defaultOpenKeys 可以设置默认打开的子项。",
        ],
      ]);
  });

  it("preserves initial selection and complete selection paths", () => {
    render(<MenuDocsIsland />);

    const topDemo = document.getElementById("顶部导航菜单")!;
    const sideDemo = document.getElementById("左侧菜单")!;
    const modelService = within(topDemo).getByRole("menuitem", {
      name: "模型服务",
    });
    const workbench = within(topDemo).getByRole("menuitem", {
      name: "工作台",
    });
    expect(modelService).toHaveAttribute("aria-current", "page");
    fireEvent.click(workbench);
    expect(workbench).toHaveAttribute("aria-current", "page");

    const interactive = within(sideDemo).getByRole("menuitem", {
      name: "交互式建模",
    });
    expect(interactive).toHaveAttribute("aria-current", "page");
    const files = within(sideDemo).getByRole("menuitem", { name: "文件" });
    fireEvent.click(files);
    expect(files).toHaveAttribute("aria-current", "page");
  });

  it("preserves the complete top navigation structure and overflow", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getRect(this: HTMLElement) {
        const isArea = this.classList.contains("qizhi-top-navigation__scroll-area");
        const right = isArea ? 240 : 720;
        return {
          x: 0,
          y: 0,
          left: 0,
          right,
          top: 0,
          bottom: 56,
          width: right,
          height: 56,
          toJSON: () => undefined,
        };
      });
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get")
      .mockReturnValue(720);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockReturnValue(240);
    render(<MenuDocsIsland />);

    const topDemo = document.getElementById("顶部导航菜单")!;
    const top = topDemo.querySelector(".qizhi-top-navigation")!;
    expect(top).toBeInTheDocument();
    expect(within(topDemo).getByText("启智")).toBeInTheDocument();
    expect(within(topDemo).getByText("租户名称XX")).toBeInTheDocument();
    expect(within(topDemo).getByText("资源/帮助")).toBeInTheDocument();
    expect(within(topDemo).getByRole("button", { name: /七宝/ }))
      .toHaveTextContent("七宝");
    expect(within(topDemo).getByRole("menuitem", { name: "模型服务" }))
      .toHaveAttribute("aria-current", "page");

    const overflowTrigger = await waitFor(() => within(topDemo).getByRole("button", {
      name: /更多导航/,
    }));
    fireEvent.click(overflowTrigger);
    const overflow = within(topDemo).getByRole("menu", {
      name: "更多导航菜单",
    });
    expect(within(overflow).getAllByRole("menuitem").map((item) => (
      item.textContent
    ))).toEqual([
      "工作台",
      "定制模型",
      "模型服务",
      "Agent",
      "探索",
      "运营中心",
    ]);
  });

  it("reuses the legacy top navigation assets and visual structure", () => {
    render(<MenuDocsIsland />);

    const topDemo = document.getElementById("顶部导航菜单")!;
    expect(topDemo.querySelector(".qizhi-top-navigation__product"))
      .toBeInTheDocument();
    expect(topDemo.querySelector(".qizhi-top-navigation__logo"))
      .toBeInTheDocument();
    expect(topDemo.querySelectorAll(".qizhi-top-navigation__divider"))
      .toHaveLength(3);
    expect(topDemo.querySelector(".qizhi-top-navigation__avatar"))
      .toBeInTheDocument();
    expect(topDemo.querySelectorAll("img.qizhi-top-navigation__asset-icon"))
      .toHaveLength(5);
  });

  it("renders the legacy inline-code treatment in the description", () => {
    render(<MenuDocsIsland />);

    const topDemo = document.getElementById("顶部导航菜单")!;
    expect(within(topDemo).getByText("mode").tagName).toBe("CODE");
    expect(within(topDemo).getByText("horizontal").tagName).toBe("CODE");
  });

  it("preserves the framework-preview side menu content and states", () => {
    render(<MenuDocsIsland />);

    const sideDemo = document.getElementById("左侧菜单")!;
    expect(within(sideDemo).getByRole("button", {
      name: /AI4S_DEV_public_workspace/,
    })).toBeInTheDocument();
    expect(within(sideDemo).getAllByRole("group").map((group) => (
      group.getAttribute("aria-labelledby")
        ? group.querySelector("[id]")?.textContent
        : null
    ))).toEqual([
      "模型开发与训练",
      "模型评测",
      "AI资产管理",
      "空间管理",
    ]);
    expect(within(sideDemo).getAllByRole("menuitem").map((item) => (
      item.textContent?.trim()
    ))).toEqual([
      "空间概览",
      "交互式建模",
      "分布式训练",
      "高性能计算",
      "可视化建模",
      "评测任务",
      "评测报告",
      "数据集",
      "文件",
      "镜像管理",
      "模型仓库",
      "评测task",
    ]);
    for (const label of [
      "可视化建模",
      "评测任务",
      "评测报告",
      "数据集",
      "评测task",
    ]) {
      expect(within(sideDemo).getByRole("menuitem", { name: label }))
        .toBeDisabled();
    }
    expect(sideDemo.querySelector(".qizhi-side-navigation"))
      .toBeInTheDocument();
    expect(sideDemo.querySelectorAll(".qizhi-side-navigation__group-divider"))
      .toHaveLength(4);
    expect(sideDemo.querySelector(".qizhi-side-navigation__divider"))
      .toBeNull();
    const workspace = sideDemo.querySelector(
      ".qizhi-side-navigation__workspace-content",
    )!;
    expect(workspace.querySelector(".qizhi-divider")).toBeNull();
    expect(workspace.querySelectorAll(".qizhi-side-navigation__workspace-icon"))
      .toHaveLength(1);

    const source = menuDemos.find((demo) => demo.id === "左侧菜单")!.source;
    expect(source).toContain("SideNavigation");
    expect(source).toContain('from "@wangxiaojinger/qizhi-react"');
    expect(source).not.toContain("SideNavigationPreview");
  });

  it("keeps preview, displayed code and copied code on one TSX source", () => {
    for (const demo of menuDemos) {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toMatch(/<(button|input|select|textarea)\b/);
      expect(demo.source).not.toContain("<svg");
      expect(demo.source).not.toContain("style={{");
      expect(demo.source).not.toMatch(/qizhi-[\w-]+__/);
      expect(Math.max(...demo.source.split("\n").map((line) => line.length)))
        .toBeLessThanOrEqual(80);
    }

    render(<MenuDocsIsland />);
    expect(screen.getAllByRole("button", { name: "查看代码" }))
      .toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "复制代码" }))
      .toHaveLength(2);
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });

  it("publishes only implemented public Menu properties", () => {
    expect(menuApi.map((item) => item.name)).toEqual([
      "mode",
      "selectedKey",
      "defaultSelectedKey",
      "onSelect",
      "children",
      "className",
      "style",
      "ref",
    ]);
    render(<MenuDocsIsland />);
    expect(screen.getByRole("table", { name: "Menu API" }))
      .toBeInTheDocument();
    expect(screen.getByRole("table", { name: "TopNavigation API" }))
      .toBeInTheDocument();
    expect(screen.getByRole("table", { name: "SideNavigation API" }))
      .toBeInTheDocument();
  });
});
