import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Menu } from "./Menu";

describe("Menu", () => {
  it("selects items in uncontrolled mode and reports the selected key", () => {
    const onSelect = vi.fn();
    render(
      <Menu
        defaultSelectedKey="model"
        onSelect={onSelect}
        aria-label="功能导航"
      >
        <Menu.Item itemKey="workbench">工作台</Menu.Item>
        <Menu.Item itemKey="model">模型服务</Menu.Item>
      </Menu>,
    );

    const model = screen.getByRole("menuitem", { name: "模型服务" });
    const workbench = screen.getByRole("menuitem", { name: "工作台" });
    expect(model).toHaveAttribute("aria-current", "page");
    expect(model).toHaveAttribute("tabindex", "0");

    fireEvent.click(workbench);

    expect(workbench).toHaveAttribute("aria-current", "page");
    expect(onSelect).toHaveBeenCalledWith("workbench");
  });

  it("keeps controlled selection owned by the caller", () => {
    const onSelect = vi.fn();
    render(
      <Menu selectedKey="model" onSelect={onSelect} aria-label="受控导航">
        <Menu.Item itemKey="workbench">工作台</Menu.Item>
        <Menu.Item itemKey="model">模型服务</Menu.Item>
      </Menu>,
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "工作台" }));

    expect(onSelect).toHaveBeenCalledWith("workbench");
    expect(screen.getByRole("menuitem", { name: "模型服务" }))
      .toHaveAttribute("aria-current", "page");
  });

  it("uses direction-aware roving focus and skips disabled items", () => {
    render(
      <Menu
        mode="horizontal"
        defaultSelectedKey="model"
        aria-label="顶部导航"
      >
        <Menu.Item itemKey="workbench">工作台</Menu.Item>
        <Menu.Item itemKey="disabled" disabled>
          不可用
        </Menu.Item>
        <Menu.Item itemKey="model">模型服务</Menu.Item>
      </Menu>,
    );

    const model = screen.getByRole("menuitem", { name: "模型服务" });
    model.focus();
    fireEvent.keyDown(model, { key: "ArrowRight" });
    const workbench = screen.getByRole("menuitem", { name: "工作台" });
    expect(workbench).toHaveFocus();
    expect(workbench).toHaveAttribute("tabindex", "0");
    expect(model).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(model).toHaveFocus();
  });

  it("gives an unselected menu one visible keyboard entry point", () => {
    render(
      <Menu aria-label="无默认选中项">
        <Menu.Item itemKey="first">第一项</Menu.Item>
        <Menu.Item itemKey="second">第二项</Menu.Item>
      </Menu>,
    );

    expect(screen.getByRole("menuitem", { name: "第一项" }))
      .toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("menuitem", { name: "第二项" }))
      .toHaveAttribute("tabindex", "-1");
  });

  it("falls back to a visible tab stop when selection is hidden", () => {
    render(
      <Menu selectedKey="hidden" aria-label="响应式导航">
        <Menu.Item itemKey="visible">可见项</Menu.Item>
        <Menu.Item itemKey="hidden" style={{ display: "none" }}>
          隐藏选中项
        </Menu.Item>
      </Menu>,
    );

    expect(screen.getByRole("menuitem", { name: "可见项" }))
      .toHaveAttribute("tabindex", "0");
    expect(document.querySelector('[data-menu-item-key="hidden"]'))
      .toHaveAttribute("tabindex", "-1");
  });

  it("renders vertical groups, icons, disabled semantics and forwarded refs", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Menu ref={ref} aria-label="侧边导航">
        <Menu.Group title="模型开发与训练">
          <Menu.Item itemKey="interactive" icon={<span data-testid="icon" />}>
            交互式建模
          </Menu.Item>
          <Menu.Item itemKey="disabled" disabled>
            不可用
          </Menu.Item>
        </Menu.Group>
      </Menu>,
    );

    expect(ref.current).toHaveAttribute("role", "menu");
    expect(screen.getByRole("group", { name: "模型开发与训练" }))
      .toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "不可用" }))
      .toHaveAttribute("aria-disabled", "true");
    expect(screen.getByTestId("icon").parentElement)
      .toHaveAttribute("aria-hidden", "true");
  });
});
