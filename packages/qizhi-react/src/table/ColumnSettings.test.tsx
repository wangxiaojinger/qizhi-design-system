import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ColumnSettings } from "./ColumnSettings";
import { Drawer } from "../drawer/Drawer";

const items = [
  { key: "name", label: "名称", visible: true, hideable: true },
  { key: "status", label: "状态", visible: false, hideable: true },
  { key: "actions", label: "操作", visible: true, hideable: false,
    visibilityDisabledReason: "必需列" },
];
const props = () => ({ items, visibility: true,
  onVisibility: vi.fn(), onVisibilityAll: vi.fn() });

describe("ColumnSettings", () => {
  it("only offers visibility and delegates effective checkbox changes", async () => {
    const callbacks = props();
    render(<ColumnSettings {...callbacks} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "列设置" }));
    expect(screen.queryByRole("spinbutton")).toBeNull();
    expect(screen.queryByRole("button", { name: /前移|后移|恢复默认/ })).toBeNull();
    expect(screen.getByRole("checkbox", { name: "全选" })).toHaveAttribute("aria-checked", "mixed");
    expect(screen.getByRole("checkbox", { name: "操作" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "状态" }));
    await user.click(screen.getByRole("checkbox", { name: "全选" }));
    expect(callbacks.onVisibility).toHaveBeenCalledWith("status", true);
    expect(callbacks.onVisibilityAll).toHaveBeenCalledWith(true);
  });

  it("shows read-only checkboxes when visibility changes are disabled", async () => {
    render(<ColumnSettings {...props()} visibility={false} />);
    await userEvent.click(screen.getByRole("button", { name: "列设置" }));
    expect(screen.getAllByRole("checkbox").every((node) => (node as HTMLInputElement).disabled))
      .toBe(true);
  });

  it("closes only the panel on Escape in a Drawer and restores trigger focus", async () => {
    const onClose = vi.fn();
    render(<Drawer open title="抽屉" onClose={onClose}>
      <ColumnSettings {...props()} />
    </Drawer>);
    const user = userEvent.setup();
    const trigger = screen.getByRole("button", { name: "列设置" });
    await user.click(trigger);
    screen.getByRole("checkbox", { name: "状态" }).focus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "列设置" })).toBeNull());
    expect(onClose).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it("supports an external toolbar slot", async () => {
    render(<ColumnSettings {...props()}
      renderTrigger={(trigger) => <div data-testid="toolbar">{trigger}</div>} />);
    const trigger = screen.getByRole("button", { name: "列设置" });
    expect(screen.getByTestId("toolbar")).toContainElement(trigger);
    await userEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "列设置" })).toBeVisible();
  });
});
