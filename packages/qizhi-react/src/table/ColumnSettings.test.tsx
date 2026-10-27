import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ColumnSettings } from "./ColumnSettings";
import type { ColumnSettingsProps } from "./ColumnSettings";
import { Drawer } from "../drawer/Drawer";

const items = [
  {
    key: "name",
    label: "名称",
    visible: true,
    hideable: true,
    width: 180,
    minWidth: 120,
    maxWidth: Infinity,
    resizable: true,
    canMoveBefore: false,
    canMoveAfter: true,
  },
  {
    key: "status",
    label: "状态",
    visible: false,
    hideable: true,
    width: 120,
    minWidth: 80,
    maxWidth: 240,
    resizable: true,
    canMoveBefore: true,
    canMoveAfter: false,
  },
  {
    key: "actions",
    label: "操作",
    visible: true,
    hideable: false,
    visibilityDisabledReason: "至少保留一列数据",
    width: 96,
    minWidth: 80,
    maxWidth: 160,
    resizable: false,
    canMoveBefore: false,
    canMoveAfter: false,
  },
] as const;

const renderColumnSettings = (overrides: Partial<ColumnSettingsProps> = {}) => {
  const handlers = {
    onVisibility: vi.fn(),
    onVisibilityAll: vi.fn(),
    onMove: vi.fn(),
    onResize: vi.fn(),
    onReset: vi.fn(),
  };
  render(
    <ColumnSettings
      items={items}
      visibility
      reorder
      resize
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
};

describe("ColumnSettings", () => {
  it("consumes Escape before a containing Drawer can close", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Drawer open title="测试抽屉" onClose={onClose}>
      <ColumnSettings items={items} visibility reorder resize onVisibility={vi.fn()}
        onVisibilityAll={vi.fn()} onMove={vi.fn()} onResize={vi.fn()} onReset={vi.fn()} />
    </Drawer>);
    const trigger = screen.getByRole("button", { name: "列设置" });
    await user.click(trigger);
    screen.getByRole("spinbutton", { name: "列宽名称" }).focus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "列设置" })).toBeNull());
    expect(onClose).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });
  it("uses formal controls and delegates visibility and movement decisions to its parent", async () => {
    const user = userEvent.setup();
    const handlers = renderColumnSettings();

    await user.click(screen.getByRole("button", { name: "列设置" }));

    expect(screen.getByRole("dialog", { name: "列设置" })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "全选" })).toHaveAttribute("aria-checked", "mixed");
    expect(screen.getByRole("checkbox", { name: "操作" })).toBeDisabled();
    expect(screen.getByText("至少保留一列数据")).toBeVisible();

    await user.click(screen.getByRole("checkbox", { name: "全选" }));
    await user.click(screen.getByRole("checkbox", { name: "状态" }));
    await user.click(screen.getByRole("button", { name: "前移状态" }));
    await user.click(screen.getByRole("button", { name: "恢复默认" }));

    expect(handlers.onVisibilityAll).toHaveBeenCalledWith(true);
    expect(handlers.onVisibility).toHaveBeenCalledWith("status", true);
    expect(handlers.onMove).toHaveBeenCalledWith("status", -1);
    expect(handlers.onReset).toHaveBeenCalledTimes(1);
  });

  it("keeps width edits local until Enter or blur and does not duplicate the same commit", async () => {
    const user = userEvent.setup();
    const handlers = renderColumnSettings();

    await user.click(screen.getByRole("button", { name: "列设置" }));
    const widthInput = screen.getByRole("spinbutton", { name: "列宽名称" });
    fireEvent.change(widthInput, { target: { value: "260" } });
    expect(handlers.onResize).not.toHaveBeenCalled();

    fireEvent.keyDown(widthInput, { key: "Enter" });
    fireEvent.blur(widthInput);

    expect(handlers.onResize).toHaveBeenCalledTimes(1);
    expect(handlers.onResize).toHaveBeenCalledWith("name", 260);
    expect(widthInput).not.toHaveAttribute("aria-valuemax");
  });

  it("restores the controlled width after a rejected edit and permits retry", async () => {
    const user = userEvent.setup();
    const handlers = renderColumnSettings();
    await user.click(screen.getByRole("button", { name: "列设置" }));
    const input = screen.getByRole("spinbutton", { name: "列宽名称" });
    fireEvent.change(input, { target: { value: "260" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("180");
    fireEvent.blur(input);
    expect(handlers.onResize).toHaveBeenCalledTimes(1);
    fireEvent.change(input, { target: { value: "260" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handlers.onResize).toHaveBeenCalledTimes(2);
  });

  it("uses the real Popover Escape path to close and restore trigger focus", async () => {
    const user = userEvent.setup();
    renderColumnSettings();
    const trigger = screen.getByRole("button", { name: "列设置" });

    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "列设置" })).toBeVisible();
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "列设置" })).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("passes the complete Popover element to renderTrigger", async () => {
    const user = userEvent.setup();
    renderColumnSettings({
      renderTrigger: (trigger) => <div data-testid="external-column-toolbar">{trigger}</div>,
    });

    expect(screen.getByTestId("external-column-toolbar")).toContainElement(
      screen.getByRole("button", { name: "列设置" }),
    );
    await user.click(screen.getByRole("button", { name: "列设置" }));
    expect(screen.getByRole("dialog", { name: "列设置" })).toBeVisible();
  });
});
