import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { TopNavigation } from "./TopNavigation";

describe("TopNavigation", () => {
  it("preserves the current default copy and selections", () => {
    const { container } = render(<TopNavigation />);
    expect(screen.getByText("启智")).toBeInTheDocument();
    expect(screen.getByText("租户名称XX")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "模型服务" }))
      .toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /七宝/ }))
      .toHaveTextContent("七宝");
    expect(screen.getByRole("button", { name: /中文/ }))
      .toHaveTextContent("中文");
    expect(container.querySelector(
      ".qizhi-top-navigation__item--explore + .qizhi-top-navigation__divider + .qizhi-top-navigation__item--operations",
    )).toBeInTheDocument();
  });

  it("hides overflow when every item fits after reclaiming the trigger width", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function getRect(this: HTMLElement) {
        const isArea = this.classList.contains("qizhi-top-navigation__scroll-area");
        const isOverflow = this.classList.contains("qizhi-top-navigation__overflow");
        const isLastItem = this.dataset.menuItemKey === "operations";
        const left = isOverflow ? 680 : isLastItem ? 620 : 0;
        const right = isArea ? 680 : isOverflow ? 712 : isLastItem ? 700 : 100;
        return {
          x: left,
          y: 0,
          left,
          right,
          top: 0,
          bottom: 56,
          width: right - left,
          height: 56,
          toJSON: () => undefined,
        };
      });
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get")
      .mockImplementation(function getScrollWidth(this: HTMLElement) {
        return this.classList.contains("qizhi-top-navigation__scroll-area")
          ? 700
          : 0;
      });
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(function getClientWidth(this: HTMLElement) {
        if (!this.classList.contains("qizhi-top-navigation__scroll-area")) {
          return 0;
        }
        const overflow = this.closest(".qizhi-top-navigation")
          ?.querySelector<HTMLElement>(".qizhi-top-navigation__overflow");
        return overflow?.hidden ? 712 : 680;
      });

    render(<TopNavigation />);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /更多导航/ }))
        .not.toBeInTheDocument();
    });
  });

  it("supports controlled navigation selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <TopNavigation selectedKey="workbench" onSelect={onSelect} />,
    );
    await user.click(screen.getByRole("menuitem", { name: "模型服务" }));
    expect(onSelect).toHaveBeenCalledWith("model-service");
    expect(screen.getByRole("menuitem", { name: "工作台" }))
      .toHaveAttribute("aria-current", "page");
  });

  it("supports uncontrolled region and language selection", async () => {
    const user = userEvent.setup();
    render(<TopNavigation />);
    await user.click(screen.getByRole("button", { name: /七宝/ }));
    await user.click(screen.getByRole("menuitemradio", {
      name: "张江科研二号楼1楼404机房",
    }));
    expect(screen.getByRole("button", { name: /张江/ }))
      .toHaveTextContent("张江");
    await user.click(screen.getByRole("button", { name: /中文/ }));
    await user.click(screen.getByRole("menuitemradio", {
      name: "English",
    }));
    expect(screen.getByRole("button", { name: /English/ }))
      .toHaveTextContent("English");
  });

  it("supports custom disabled items and business callbacks", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onHelp = vi.fn();
    const onUserMenu = vi.fn();
    render(
      <TopNavigation
        items={[
          { key: "enabled", label: "可用" },
          { key: "disabled", label: "禁用", disabled: true },
        ]}
        defaultSelectedKey="enabled"
        onSelect={onSelect}
        onHelp={onHelp}
        onUserMenu={onUserMenu}
      />,
    );
    await user.click(screen.getByRole("menuitem", { name: "禁用" }));
    expect(onSelect).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "资源/帮助" }));
    await user.click(screen.getByRole("button", { name: "打开用户菜单" }));
    expect(onHelp).toHaveBeenCalledTimes(1);
    expect(onUserMenu).toHaveBeenCalledTimes(1);
  });

  it("notifies controlled option changes without mutating labels", async () => {
    const user = userEvent.setup();
    const onRegionChange = vi.fn();
    const onLanguageChange = vi.fn();
    render(
      <TopNavigation
        region="qibao"
        onRegionChange={onRegionChange}
        language="zh-CN"
        onLanguageChange={onLanguageChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /七宝/ }));
    await user.click(screen.getByRole("menuitemradio", { name: "松江机房" }));
    expect(onRegionChange).toHaveBeenCalledWith("songjiang");
    expect(screen.getByRole("button", { name: /七宝/ }))
      .toHaveTextContent("七宝");
    await user.click(screen.getByRole("button", { name: /中文/ }));
    await user.click(screen.getByRole("menuitemradio", { name: "English" }));
    expect(onLanguageChange).toHaveBeenCalledWith("en-US");
    expect(screen.getByRole("button", { name: /中文/ }))
      .toHaveTextContent("中文");
  });
});
