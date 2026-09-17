import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { PlatformShell } from "./PlatformShell";

describe("PlatformShell", () => {
  it("starts on workbench without a sider", () => {
    const { container } = render(
      <PlatformShell><div>页面内容</div></PlatformShell>,
    );

    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(screen.getByRole("menuitem", { name: "工作台" }))
      .toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("navigation", { name: "空间导航" }))
      .not.toBeInTheDocument();
    expect(screen.getByText("页面内容")).toBeInTheDocument();
  });

  it("maps uncontrolled navigation to the matching sider", async () => {
    const user = userEvent.setup();
    render(<PlatformShell><div>内容区</div></PlatformShell>);

    await user.click(screen.getByRole("menuitem", { name: "Agent" }));

    expect(screen.getByRole("menuitem", { name: "Skills 工坊" }))
      .toHaveAttribute("aria-current", "page");
  });

  it("keeps controlled navigation unchanged and reports selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <PlatformShell selectedKey="workbench" onSelect={onSelect}>
        <div>内容区</div>
      </PlatformShell>,
    );

    await user.click(screen.getByRole("menuitem", { name: "模型服务" }));

    expect(onSelect).toHaveBeenCalledWith("model-service");
    expect(screen.queryByRole("navigation", { name: "空间导航" }))
      .not.toBeInTheDocument();
  });

  it.each([
    ["定制模型", "交互式建模"],
    ["模型服务", "模型部署"],
    ["Agent", "Skills 工坊"],
    ["探索", "模型广场"],
    ["运营中心", "资源概览"],
  ])("maps %s to the %s sider variant", async (topLabel, sideLabel) => {
    const user = userEvent.setup();
    render(<PlatformShell><div>内容区</div></PlatformShell>);

    await user.click(screen.getByRole("menuitem", { name: topLabel }));

    expect(screen.getByRole("menuitem", { name: sideLabel }))
      .toHaveAttribute("aria-current", "page");
  });

  it("hides the sider for an unknown selected key", () => {
    render(
      <PlatformShell selectedKey="unknown-platform-domain">
        <div>内容区</div>
      </PlatformShell>,
    );

    expect(screen.queryByRole("navigation", { name: "空间导航" }))
      .not.toBeInTheDocument();
  });

  it("omits the greeting region when greeting is null", () => {
    render(
      <PlatformShell greeting={null}>
        <div>内容区</div>
      </PlatformShell>,
    );

    expect(screen.queryByRole("region", { name: "问候语" }))
      .not.toBeInTheDocument();
  });

  it("renders a custom greeting before its children", () => {
    const { container } = render(
      <PlatformShell greeting={<strong>你好，林猫猫</strong>}>
        <div>内容区</div>
      </PlatformShell>,
    );

    expect(screen.getByRole("region", { name: "问候语" }))
      .toHaveTextContent("你好，林猫猫");
    expect(container.textContent).toContain("你好，林猫猫内容区");
  });

  it("forwards public top navigation props without replacing shell selection", () => {
    render(
      <PlatformShell topNavigationProps={{ productName: "定制启智" }}>
        <div>内容区</div>
      </PlatformShell>,
    );

    expect(screen.getByText("定制启智")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "工作台" }))
      .toHaveAttribute("aria-current", "page");
  });

  it("forwards workspace and selection to the mapped sider", () => {
    render(
      <PlatformShell
        selectedKey="agent"
        sideNavigationProps={{
          workspace: "HW-H800-Public",
          selectedKey: "agent-item",
        }}
      >
        <div>内容区</div>
      </PlatformShell>,
    );

    expect(screen.getByRole("button", { name: /HW-H800-Public/ }))
      .toHaveTextContent("HW-H800-Public");
    expect(within(screen.getByRole("navigation", { name: "空间导航" }))
      .getByRole("menuitem", { name: "Agent" }))
      .toHaveAttribute("aria-current", "page");
  });

  it("enables the public sticky frosted header mode", () => {
    const { container } = render(
      <PlatformShell stickyHeader><div>页面内容</div></PlatformShell>,
    );

    expect(container.querySelector(".qizhi-platform-shell"))
      .toHaveClass("is-header-sticky");
  });
});
