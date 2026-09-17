import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("使用真实 checkbox 并支持非受控点击与键盘切换", async () => {
    const user = userEvent.setup();
    render(<Checkbox defaultChecked={false}>复选框</Checkbox>);
    const input = screen.getByRole("checkbox", { name: "复选框" });
    expect(input).not.toBeChecked();
    await user.click(input);
    expect(input).toBeChecked();
    input.focus();
    await user.keyboard(" ");
    expect(input).not.toBeChecked();
  });

  it("不使用容易受事件时序影响的自定义焦点状态", async () => {
    const user = userEvent.setup();
    render(<Checkbox>聚焦项</Checkbox>);
    const input = screen.getByRole("checkbox", { name: "聚焦项" });
    const root = input.closest("label")!;
    await user.click(root);
    expect(root).not.toHaveClass("qizhi-checkbox-focus-visible");
    await user.tab();
    await user.tab({ shift: true });
    expect(input).toHaveFocus();
    expect(root).not.toHaveClass("qizhi-checkbox-focus-visible");
  });

  it("同步半选、禁用状态和 input ref", () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(<Checkbox ref={ref} indeterminate disabled onChange={onChange}>半选禁用</Checkbox>);
    const input = screen.getByRole("checkbox", { name: "半选禁用" });
    expect(ref.current).toBe(input);
    expect(input).toBeDisabled();
    expect((input as HTMLInputElement).indeterminate).toBe(true);
    fireEvent.click(input);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("受控模式只通过外部值更新", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [checked, setChecked] = useState(false);
      return <><Checkbox checked={checked} onChange={() => undefined}>受控项</Checkbox><button onClick={() => setChecked(true)}>外部选中</button></>;
    }
    render(<Controlled />);
    const input = screen.getByRole("checkbox", { name: "受控项" });
    await user.click(input);
    expect(input).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "外部选中" }));
    expect(input).toBeChecked();
  });
});

describe("Checkbox.Group", () => {
  it("用 options 维护非受控值并跳过禁用项", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox.Group defaultValue={["A"]} options={["A", { label: "选项 B", value: "B", disabled: true }, "C"]} onChange={onChange} />);
    expect(screen.getByRole("checkbox", { name: "A" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "选项 B" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "C" }));
    expect(onChange).toHaveBeenLastCalledWith(["A", "C"], expect.any(Object));
    await user.click(screen.getByRole("checkbox", { name: "A" }));
    expect(onChange).toHaveBeenLastCalledWith(["C"], expect.any(Object));
  });

  it("children 优先于 options，并支持纵向和整组禁用", () => {
    render(<Checkbox.Group direction="vertical" disabled options={["不会渲染"]}><Checkbox value="A">选项 A</Checkbox></Checkbox.Group>);
    const group = screen.getByRole("group");
    expect(group).toHaveClass("qizhi-checkbox-group--vertical");
    expect(screen.getByRole("checkbox", { name: "选项 A" })).toBeDisabled();
    expect(screen.queryByRole("checkbox", { name: "不会渲染" })).not.toBeInTheDocument();
  });
});
