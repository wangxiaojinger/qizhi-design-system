import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("支持非受控点击和键盘切换", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch aria-label="基础开关" onChange={onChange} />);
    const control = screen.getByRole("switch", { name: "基础开关" });

    expect(control).toHaveAttribute("aria-checked", "false");
    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenLastCalledWith(true, expect.any(Object));

    control.focus();
    await user.keyboard(" ");
    expect(control).toHaveAttribute("aria-checked", "false");
    await user.keyboard("{Enter}");
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("受控模式仅通知变化，不自行修改状态", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch aria-label="受控开关" checked={false} onChange={onChange} />);
    const control = screen.getByRole("switch", { name: "受控开关" });

    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it("禁用与加载状态均不可切换", async () => {
    const user = userEvent.setup();
    const disabledChange = vi.fn();
    const loadingChange = vi.fn();
    render(
      <>
        <Switch aria-label="禁用开关" disabled defaultChecked onChange={disabledChange} />
        <Switch aria-label="加载开关" loading defaultChecked onChange={loadingChange} />
      </>,
    );

    const disabled = screen.getByRole("switch", { name: "禁用开关" });
    const loading = screen.getByRole("switch", { name: "加载开关" });
    expect(disabled).toBeDisabled();
    expect(loading).toHaveAttribute("aria-disabled", "true");
    expect(loading).toHaveAttribute("tabindex", "-1");
    expect(loading.querySelector('[data-icon="icon-加载中"]')).toBeInTheDocument();
    await user.click(disabled);
    await user.click(loading);
    expect(disabledChange).not.toHaveBeenCalled();
    expect(loadingChange).not.toHaveBeenCalled();
  });

  it("呈现小型尺寸、开关文案并转发 ref", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    render(
      <Switch
        ref={ref}
        aria-label="文案开关"
        size="small"
        checkedText="ON"
        uncheckedText="OFF"
      />,
    );
    const control = screen.getByRole("switch", { name: "文案开关" });

    expect(ref.current).toBe(control);
    expect(control).toHaveClass("qizhi-switch-small");
    expect(control).toHaveTextContent("OFF");
    await user.click(control);
    expect(control).toHaveTextContent("ON");
  });
});
