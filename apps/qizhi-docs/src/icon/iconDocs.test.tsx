import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { directionIconManifest, editIconManifest, generalIconManifest, interactionIconManifest, promptIconManifest, trademarkIconManifest } from "@wangxiaojinger/qizhi-react/icon";
import { IconDocsIsland } from "./IconDocsIsland";
import { getIconUsageCode, iconDocsRegistry } from "./iconDocs.registry";

describe("Icon docs", () => {
  it("renders direction and migrated prompt icons from shared manifests", () => {
    render(<IconDocsIsland />);

    expect(iconDocsRegistry.map((item) => item.id)).toEqual(
      [...directionIconManifest, ...promptIconManifest, ...interactionIconManifest, ...editIconManifest, ...trademarkIconManifest, ...generalIconManifest].map((item) => item.id),
    );
    expect(screen.getAllByRole("button", { name: /复制.+组件代码/ })).toHaveLength(419);
    expect(screen.queryByRole("button", { name: /完整用法/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /提示建议类图标/ })).toHaveTextContent("44 个 React 组件");
    expect(screen.getByRole("heading", { name: /交互按钮类图标/ })).toHaveTextContent("71 个 React 组件");
    expect(screen.getByRole("heading", { name: /编辑类图标/ })).toHaveTextContent("53 个 React 组件");
    expect(screen.getByRole("heading", { name: /商标类图标/ })).toHaveTextContent("28 个 React 组件");
    expect(screen.getByRole("heading", { name: /通用类图标/ })).toHaveTextContent("185 个 React 组件");
    expect(screen.getByRole("button", { name: "复制状态-加载-白色组件代码" })).not.toHaveClass(
      "qizhi-icon-docs__cell--dark-preview",
    );
    expect(screen.queryByText("Demo.tsx")).not.toBeInTheDocument();
  });

  it("searches Chinese aliases and English component names", () => {
    render(<IconDocsIsland />);
    const search = screen.getByRole("searchbox", { name: "搜索图标" });

    fireEvent.change(search, { target: { value: "向下实心箭头" } });
    expect(screen.getAllByRole("button", { name: /复制.+组件代码/ })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "复制向下箭头（填充）组件代码" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /方向指示类图标/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /提示建议类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /交互按钮类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /编辑类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /商标类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /通用类图标/ })).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "ArrowRightAltIcon" } });
    expect(screen.getByRole("button", { name: "复制向右箭头（样式二）组件代码" })).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "UploadIcon" } });
    expect(screen.getByRole("button", { name: "复制上传组件代码" }))
      .toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /交互按钮类图标/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /方向指示类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /提示建议类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /编辑类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /商标类图标/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /通用类图标/ })).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "" } });
    expect(screen.getByRole("heading", { name: /方向指示类图标/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /提示建议类图标/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /交互按钮类图标/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /编辑类图标/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /商标类图标/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /通用类图标/ })).toBeInTheDocument();
  });

  it("uses the shared search input with a leading icon and clear interaction", () => {
    render(<IconDocsIsland />);
    const search = screen.getByRole("searchbox", { name: "搜索图标" });

    expect(search).toHaveAttribute("type", "text");
    expect(search.closest(".qizhi-input")).toHaveClass("qizhi-icon-docs__search");
    expect(search.previousElementSibling?.querySelector("svg")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "清空输入内容" })).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "UploadIcon" } });
    const clear = screen.getByRole("button", { name: "清空输入内容" });
    expect(clear.querySelector("svg")).toBeInTheDocument();
    fireEvent.click(clear);

    expect(search).toHaveValue("");
    expect(search).toHaveFocus();
    expect(screen.queryByRole("button", { name: "清空输入内容" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /复制.+组件代码/ })).toHaveLength(419);
  });

  it("filters outline, fill and migrated fixed-palette color icons", () => {
    render(<IconDocsIsland />);

    fireEvent.click(screen.getByRole("radio", { name: "线性图标" }));
    expect(screen.getAllByRole("button", { name: /复制.+组件代码/ })).toHaveLength(259);
    fireEvent.click(screen.getByRole("radio", { name: "面性图标" }));
    expect(screen.getAllByRole("button", { name: /复制.+组件代码/ })).toHaveLength(149);
    fireEvent.click(screen.getByRole("radio", { name: "多色图标" }));
    expect(screen.getAllByRole("button", { name: /复制.+组件代码/ })).toHaveLength(11);
    expect(screen.getByRole("button", { name: "复制Skill 服务组件代码" }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: "复制状态-完成组件代码" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "复制状态-失败组件代码" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /提示建议类图标/ })).toHaveTextContent("11 个 React 组件");
    expect(screen.queryByRole("heading", { name: /方向指示类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /交互按钮类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /编辑类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /商标类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /通用类图标/ })).not.toBeInTheDocument();
  });

  it("copies the fixed-palette status component usage", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<IconDocsIsland />);

    fireEvent.click(screen.getByRole("button", { name: "复制状态-完成组件代码" }));
    expect(writeText).toHaveBeenCalledWith(
      '<StatusSuccessIcon />',
    );
    expect(await screen.findByRole("status")).toHaveTextContent("复制成功!<StatusSuccessIcon />");
  });

  it("copies manifest-derived import and JSX directly from the icon cell", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<IconDocsIsland />);

    fireEvent.click(screen.getByRole("button", { name: "复制向下箭头（填充）组件代码" }));
    const code = getIconUsageCode(
      directionIconManifest.find((item) => item.id === "direction.arrow.down.fill")!,
    );
    expect(writeText).toHaveBeenCalledWith(code.jsxCode);
    const toast = await screen.findByRole("status");
    expect(toast).toHaveTextContent("复制成功!");
    expect(toast).toHaveTextContent("<ArrowDownFilledIcon />");
    expect(toast).toHaveClass("qizhi-message", "qizhi-message--success", "is-visible");
    expect(screen.getByRole("button", { name: "复制向下箭头（填充）组件代码" })).not.toHaveTextContent("已复制");
    expect(screen.queryByText(code.importCode)).not.toBeInTheDocument();
    expect(screen.getByText(code.jsxCode)).toBeInTheDocument();
  });

  it("falls back to a temporary selection when the Clipboard API is rejected", async () => {
    const writeText = vi.fn().mockRejectedValue(new DOMException("NotAllowedError"));
    const execCommand = vi.fn().mockReturnValue(true);
    Object.assign(navigator, { clipboard: { writeText } });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommand,
    });
    render(<IconDocsIsland />);

    fireEvent.click(screen.getByRole("button", { name: "复制向右箭头（样式二）组件代码" }));

    expect(await screen.findByRole("status")).toHaveTextContent("复制成功!<ArrowRightAltIcon />");
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea[data-qizhi-copy-fallback]")).toBeNull();
  });

  it("shows a global failure toast rather than changing the icon cell", async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new DOMException("NotAllowedError")) },
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });
    render(<IconDocsIsland />);

    const cell = screen.getByRole("button", { name: "复制向右箭头（样式二）组件代码" });
    fireEvent.click(cell);

    const toast = await screen.findByRole("alert");
    expect(toast).toHaveTextContent("复制失败，请检查浏览器剪贴板权限");
    expect(toast).toHaveClass("qizhi-message", "qizhi-message--error", "is-visible");
    expect(cell).not.toHaveTextContent("复制失败");
  });

  it("shows immediate copying feedback while the Clipboard API is still pending", () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockReturnValue(new Promise<void>(() => {})) },
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });
    render(<IconDocsIsland />);

    const cell = screen.getByRole("button", { name: "复制向右箭头（样式二）组件代码" });
    fireEvent.click(cell);

    expect(cell).not.toHaveTextContent("正在复制");
    expect(screen.getByRole("status")).toHaveTextContent("正在复制<ArrowRightAltIcon />");
  });

  it("shows a Chinese empty state for unmatched queries", () => {
    render(<IconDocsIsland />);
    fireEvent.change(screen.getByRole("searchbox", { name: "搜索图标" }), {
      target: { value: "不存在的旋转火箭图标" },
    });
    expect(screen.getByText("没有匹配的图标")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /方向指示类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /提示建议类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /交互按钮类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /编辑类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /商标类图标/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /通用类图标/ })).not.toBeInTheDocument();
  });

  it("documents size, color, CSS inheritance and accessibility contracts", () => {
    render(<IconDocsIsland />);

    expect(screen.getByRole("table", { name: "Icon API" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "size" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "color" })).toBeInTheDocument();
    expect(screen.getByText(/currentColor/)).toBeInTheDocument();
    expect(screen.getByText(/当 Remix Icon 无法覆盖、需要启智图标资产时，统一从 @wangxiaojinger\/qizhi-react\/icon 导入/)).toBeInTheDocument();
    expect(screen.getByText(/默认作为装饰图标隐藏/)).toBeInTheDocument();
    expect(screen.getByText(/fixedPalette/)).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "图标目录与检索 API" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "findIcons" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "directionIconManifest" })).toBeInTheDocument();
  });

  it("documents the boundary between standard icons and custom SVG resources", () => {
    render(<IconDocsIsland />);

    expect(screen.getByRole("heading", { name: "图标来源与使用规则" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Remix Icon" })).toHaveAttribute("href", "https://remixicon.com/");
    expect(screen.getByText(/标准界面图标优先从/)).toBeInTheDocument();
    expect(screen.getByText(/Remix Icon 中没有语义匹配的图标.*再从 @wangxiaojinger\/qizhi-react\/icon 中选择/)).toBeInTheDocument();
    expect(screen.getByText(/业务代码不得使用字符、Unicode 符号、Emoji、CSS 绘制、硬编码 SVG path 或 data URL/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "图标来源边界" })).toBeInTheDocument();
    expect(screen.getByText(/标准界面图标默认优先使用 Remix Icon/)).toBeInTheDocument();
    expect(screen.getByText(/不会自动获得 QizhiIconProps/)).toBeInTheDocument();
    expect(screen.getByText(/业务代码禁止使用字符、Unicode 符号、Emoji、CSS 绘制、硬编码 SVG path 或 data URL/)).toBeInTheDocument();
  });
});
