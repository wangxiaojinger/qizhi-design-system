import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Agent management page contract", () => {
  it("renders the screenshot-aligned list shell without internal Mock controls", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
    render(<App />);

    expect(document.querySelectorAll(".qizhi-platform-shell")).toHaveLength(1);
    expect(screen.getByRole("navigation", { name: "空间导航" }))
      .toHaveClass("qizhi-side-navigation", "agent-page-side-navigation");
    expect(screen.getByRole("menubar", { name: "顶部导航" })).toBeInTheDocument();
    const sideMenu = screen.getByRole("menu", { name: "空间导航" });
    expect(within(sideMenu).getByRole("menuitem", { name: "Agent" }))
      .toHaveAttribute("aria-current", "page");
    expect(screen.getByText("HW-H800-Public")).toBeInTheDocument();
    expect(screen.queryByText("Mock Demo")).not.toBeInTheDocument();
    expect(screen.queryByText("仅使用本地数据与 React 内存状态，未接入真实 API、认证、权限或持久化服务。"))
      .not.toBeInTheDocument();
    expect(screen.queryByText("Mock 状态")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Agent 管理列表" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "我创建的" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "全部" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Agent 范围" }))
      .toHaveClass("qizhi-radio-group-type-button");
    expect(document.querySelector(".agent-page-toolbar .qizhi-segmented")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("输入关键字搜索")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "所属项目筛选" })).toHaveValue("全部");
    expect(screen.getByRole("button", { name: "刷新" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ 新建 Agent" })).toBeInTheDocument();
    [
      "Agent 名称",
      "版本号",
      "所属项目",
      "标签",
      "描述",
      "创建人",
      "更新时间",
      "操作",
    ].forEach((heading) => {
      expect(screen.getByRole("columnheader", { name: heading })).toBeInTheDocument();
    });
    screen.getAllByRole("button", { name: "删除" }).forEach((button) => {
      expect(button).not.toHaveClass("qizhi-button--danger");
      expect(button).toHaveClass("agent-page-row-action-button--delete");
    });
  });

  it("opens the shared create Drawer and exposes confirmed form copy", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "+ 新建 Agent" }));

    expect(screen.getByRole("dialog", { name: "新建 Agent" })).toBeInTheDocument();
    expect(screen.getByText("基本信息")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "版本号" })).toBeEnabled();
    expect(screen.getByPlaceholderText("请输入 Agent 名称")).toBeInTheDocument();
    expect(screen.getByText("Agent 指令")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "录入方式" }))
      .toHaveClass("qizhi-radio-group-type-button");
    expect(screen.getByRole("textbox", { name: "Agent 指令内容" })
      .closest(".qizhi-textarea"))
      .toBeInTheDocument();
    expect(screen.getByText("能力设置")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "取消" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "新建" })).toBeInTheDocument();
  });

  it("keeps version editable for create and read-only for edit", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "+ 新建 Agent" }));
    const createVersion = screen.getByRole("textbox", { name: "版本号" });
    await user.clear(createVersion);
    await user.type(createVersion, "V2");
    expect(createVersion).toHaveValue("V2");
    await user.click(screen.getByRole("button", { name: "取消" }));

    await user.click(screen.getAllByRole("button", { name: "编辑" })[0]);
    expect(screen.getByRole("textbox", { name: "版本号" })).toBeDisabled();
  });

  it("validates the name and confirms dirty Drawer closing", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "+ 新建 Agent" }));
    const nameInput = screen.getByPlaceholderText("请输入 Agent 名称");

    await user.type(nameInput, "1invalid");
    await user.click(screen.getByRole("button", { name: "新建" }));
    expect(screen.getByText("名称只能包含字母、数字、下划线、短横线和点，且必须以字母开头")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "关闭抽屉" }));
    expect(screen.getByRole("dialog", { name: "放弃未保存内容" })).toBeInTheDocument();
    expect(screen.getByText("关闭后，当前未保存的内容将丢失。确定要关闭吗？")).toBeInTheDocument();
  });

  it("focuses the first invalid field when create is blocked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "+ 新建 Agent" }));
    await user.click(within(screen.getByRole("dialog", { name: "新建 Agent" })).getByRole("button", { name: "新建" }));

    expect(screen.getByPlaceholderText("请输入 Agent 名称")).toHaveFocus();
  });

  it("creates an Agent after all confirmed required fields are valid", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "+ 新建 Agent" }));
    const drawer = screen.getByRole("dialog", { name: "新建 Agent" });
    await user.type(within(drawer).getByPlaceholderText("请输入 Agent 名称"), "unit-created-agent");
    await user.click(within(drawer).getByRole("combobox", { name: "所属项目" }));
    await user.click(screen.getByRole("option", { name: "基础-启智" }));
    await user.type(within(drawer).getByPlaceholderText("请输入 Agent 指令内容"), "仅用于单元测试的指令。");
    await user.click(within(drawer).getByRole("button", { name: "新建" }));

    expect(await screen.findByRole("row", { name: /unit-created-agent/ })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "新建 Agent" })).not.toBeInTheDocument();
  });

  it("commits a typed label as a Tag and shows it in the created Agent row", async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1440 });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "+ 新建 Agent" }));
    const drawer = screen.getByRole("dialog", { name: "新建 Agent" });
    await user.type(within(drawer).getByPlaceholderText("请输入 Agent 名称"), "tagged-created-agent");
    await user.click(within(drawer).getByRole("combobox", { name: "所属项目" }));
    await user.click(screen.getByRole("option", { name: "基础-启智" }));
    await user.type(within(drawer).getByRole("textbox", { name: "标签" }), "金融分析");
    await user.type(within(drawer).getByPlaceholderText("请输入 Agent 指令内容"), "用于验证标签提交与列表展示。");
    await user.click(within(drawer).getByRole("button", { name: "新建" }));

    const row = await screen.findByRole("row", { name: /tagged-created-agent/ });
    expect(within(row).getByText("金融分析").closest(".qizhi-tag")).toBeInTheDocument();
  });

  it("opens Agent detail with versions, instructions, and configuration lists", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "详情" })[0]);

    expect(screen.getByText("Agent 详情")).toBeInTheDocument();
    expect(document.querySelector(".agent-page-detail-header-card.qizhi-detail-header"))
      .toBeInTheDocument();
    expect(document.querySelector(".agent-page-detail-header")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "返回 Agent 管理列表" })).toBeInTheDocument();
    expect(screen.getByText("版本列表")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ 新增版本" })).toBeInTheDocument();
    expect(screen.getByText("Agent 指令")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "预览" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Markdown" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "编辑" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument();
  });

  it("shows the reference-blocked deletion state", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.clear(screen.getByPlaceholderText("输入关键字搜索"));
    await user.type(screen.getByPlaceholderText("输入关键字搜索"), "memory-agent-01");
    await user.click(screen.getByRole("button", { name: "删除" }));

    const dialog = screen.getByRole("dialog", { name: "删除 Agent" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/删除后无法恢复/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "删除" }));
    expect(await screen.findByText("该 Agent 仍被其他对象引用，当前不会执行删除。"))
      .toBeInTheDocument();
  });
});
