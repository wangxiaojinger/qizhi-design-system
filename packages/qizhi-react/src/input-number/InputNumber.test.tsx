import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InputNumber } from "./InputNumber";

describe("InputNumber", () => {
  it("steps an empty embedded input and clamps only explicit bounds", () => {
    render(<InputNumber min={0} max={2} placeholder="Please enter" />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    expect(input).toHaveValue("1");
    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    expect(input).toHaveValue("2");
  });

  it("does not turn an unbounded button-mode value into zero", () => {
    render(<InputNumber mode="button" defaultValue={500} />);
    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("501");
  });

  it("uses the greater decimal precision from precision and step", () => {
    render(<InputNumber defaultValue={1.11} step={0.01} precision={1} />);
    fireEvent.click(screen.getByRole("button", { name: "减少" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("1.10");
  });

  it("parses user input and formats it after editing", () => {
    render(
      <InputNumber
        defaultValue={12000}
        step={1000}
        prefix="¥"
        parser={(value) => value.replaceAll(",", "")}
        formatter={(value, { userTyping }) => userTyping
          ? String(value)
          : String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      />,
    );
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue("12,000");
    fireEvent.change(input, { target: { value: "12345" } });
    expect(input).toHaveValue("12345");
    fireEvent.blur(input);
    expect(input).toHaveValue("12,345");
    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    expect(input).toHaveValue("13,345");
  });

  it("passes the live input to formatter with userTyping enabled", () => {
    render(
      <InputNumber
        defaultValue={12}
        formatter={(value, { userTyping, input }) => userTyping
          ? `[${input}]`
          : String(value)}
      />,
    );
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "123" } });
    expect(input).toHaveValue("[123]");
  });

  it("increments strict decimal strings without Number conversion", () => {
    const onChange = vi.fn();
    render(
      <InputNumber
        strictMode
        mode="button"
        defaultValue="100000000000000000000"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    expect(screen.getByRole("spinbutton")).toHaveValue("100000000000000000001");
    expect(onChange).toHaveBeenLastCalledWith("100000000000000000001");
  });

  it("supports keyboard stepping and reports an empty value as undefined", () => {
    const onChange = vi.fn();
    render(<InputNumber defaultValue={2} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("3");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("blocks changes while disabled or readOnly", () => {
    const { rerender } = render(<InputNumber defaultValue={2} disabled />);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
    expect(screen.getByRole("button", { name: "增加" })).toBeDisabled();
    rerender(<InputNumber defaultValue={2} readOnly />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "增加" }));
    expect(input).toHaveValue("2");
  });

  it("exposes embedded control visibility without consumer CSS overrides", () => {
    const { rerender } = render(<InputNumber controls="hidden" defaultValue={8} />);
    expect(screen.queryByRole("button", { name: "增加" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "减少" })).not.toBeInTheDocument();

    rerender(<InputNumber controls="always" defaultValue={8} />);
    const root = screen.getByRole("spinbutton").closest(".qizhi-input-number");
    expect(root).toHaveClass("qizhi-input-number--controls-always");
    expect(screen.getByRole("button", { name: "增加" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "减少" })).toBeInTheDocument();
  });
});
