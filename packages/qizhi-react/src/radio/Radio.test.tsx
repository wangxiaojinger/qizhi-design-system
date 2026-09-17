import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Radio } from "./Radio";

describe("Radio", () => {
  it("renders the QIZHI radio structure and forwards the input ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Radio ref={ref}>单选框</Radio>);

    const input = screen.getByRole("radio", { name: "单选框" });
    expect(input).toBe(ref.current);
    expect(input).toHaveAttribute("type", "radio");
    expect(input.closest("label")).toHaveClass("qizhi-radio");
    expect(input.nextElementSibling).toHaveClass("qizhi-radio-mask-wrapper");
  });

  it("supports uncontrolled and controlled checked state", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Radio defaultChecked onChange={onChange}>非受控</Radio>);
    const input = screen.getByRole("radio", { name: "非受控" });
    expect(input).toBeChecked();

    rerender(<Radio checked={false} onChange={onChange}>受控</Radio>);
    fireEvent.click(input);
    expect(onChange).toHaveBeenCalledWith(true, undefined, expect.anything());
    expect(input).not.toBeChecked();
  });

  it("keeps disabled state inert", () => {
    const onChange = vi.fn();
    render(<Radio disabled onChange={onChange}>禁用单选框</Radio>);
    const input = screen.getByRole("radio", { name: "禁用单选框" });
    fireEvent.click(input);
    expect(input).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
    expect(input.closest("label")).toHaveClass("qizhi-radio-disabled");
  });

  it("renders the approved outline button appearance in all sizes", () => {
    const { rerender } = render(<Radio type="button" size="small">北京</Radio>);
    expect(screen.getByRole("radio", { name: "北京" }).closest("label")).toHaveClass("qizhi-radio-button", "qizhi-radio-size-small");

    rerender(<Radio type="button" size="large">上海</Radio>);
    expect(screen.getByRole("radio", { name: "上海" }).closest("label")).toHaveClass("qizhi-radio-size-large");
    expect(screen.getByRole("radio", { name: "上海" }).closest("label")).not.toHaveClass("qizhi-segmented-item");
  });
});

describe("Radio.Group", () => {
  it("coordinates child radios and reports the selected value", () => {
    const onChange = vi.fn();
    render(<Radio.Group defaultValue="a" onChange={onChange} aria-label="城市"><Radio value="a">北京</Radio><Radio value="b">上海</Radio></Radio.Group>);
    const beijing = screen.getByRole("radio", { name: "北京" });
    const shanghai = screen.getByRole("radio", { name: "上海" });

    expect(beijing).toBeChecked();
    fireEvent.click(shanghai);
    expect(shanghai).toBeChecked();
    expect(beijing).not.toBeChecked();
    expect(onChange).toHaveBeenCalledWith("b", expect.anything());
  });

  it("renders primitive and object options with disabled state", () => {
    render(<Radio.Group aria-label="选项" options={["选项一", { label: "选项二", value: "b", disabled: true }]} />);
    expect(screen.getByRole("radio", { name: "选项一" })).toHaveAttribute("value", "选项一");
    expect(screen.getByRole("radio", { name: "选项二" })).toBeDisabled();
  });

  it("keeps a controlled value until its owner updates it", () => {
    const onChange = vi.fn();
    render(<Radio.Group value="a" onChange={onChange} aria-label="受控组"><Radio value="a">选项一</Radio><Radio value="b">选项二</Radio></Radio.Group>);
    fireEvent.click(screen.getByRole("radio", { name: "选项二" }));
    expect(onChange).toHaveBeenCalledWith("b", expect.anything());
    expect(screen.getByRole("radio", { name: "选项一" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "选项二" })).not.toBeChecked();
  });

  it("applies outline group button appearance and disables every child", () => {
    render(<Radio.Group type="button" size="large" disabled aria-label="按钮组"><Radio value="a">北京</Radio><Radio value="b">上海</Radio></Radio.Group>);
    const group = screen.getByRole("radiogroup", { name: "按钮组" });
    expect(group).toHaveClass("qizhi-radio-group-type-button", "qizhi-radio-size-large");
    expect(group).not.toHaveClass("qizhi-segmented");
    expect(screen.getAllByRole("radio").every((radio) => (radio as HTMLInputElement).disabled)).toBe(true);
  });
});
