import { fireEvent, render, screen } from "@testing-library/react";
import { ChoiceCard, ChoiceCardGroup } from "./ChoiceCard";

describe("ChoiceCard", () => {
  it("supports an uncontrolled initial value and click selection", () => {
    const onChange = vi.fn();
    render(
      <ChoiceCardGroup defaultValue="public" onChange={onChange} aria-label="选择空间计费方式">
        <ChoiceCard value="public" title="公共空间" description="按资源使用量计费。" />
        <ChoiceCard value="private" title="独立空间" description="按时间买断空间内资源。" />
      </ChoiceCardGroup>,
    );
    expect(screen.getByRole("radio", { name: /公共空间/ })).toBeChecked();
    fireEvent.click(screen.getByText("独立空间"));
    expect(screen.getByRole("radio", { name: /独立空间/ })).toBeChecked();
    expect(onChange).toHaveBeenCalledWith("private");
  });

  it("does not select disabled cards", () => {
    const onChange = vi.fn();
    render(
      <ChoiceCardGroup onChange={onChange} aria-label="选择部署模式">
        <ChoiceCard value="dedicated" title="专属实例" />
        <ChoiceCard value="scheduled" title="定时实例" disabled />
      </ChoiceCardGroup>,
    );
    fireEvent.click(screen.getByText("定时实例"));
    expect(screen.getByRole("radio", { name: /定时实例/ })).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("loops through enabled cards with arrow keys", () => {
    render(
      <ChoiceCardGroup defaultValue="first" aria-label="方向键选择">
        <ChoiceCard value="first" title="第一项" />
        <ChoiceCard value="disabled" title="禁用项" disabled />
        <ChoiceCard value="last" title="最后一项" />
      </ChoiceCardGroup>,
    );
    const first = screen.getByRole("radio", { name: /第一项/ });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(screen.getByRole("radio", { name: /最后一项/ })).toBeChecked();
    fireEvent.keyDown(screen.getByRole("radio", { name: /最后一项/ }), { key: "ArrowRight" });
    expect(first).toBeChecked();
  });

  it("obeys a controlled value", () => {
    const { rerender } = render(
      <ChoiceCardGroup value="a" aria-label="受控选择">
        <ChoiceCard value="a" title="A" />
        <ChoiceCard value="b" title="B" />
      </ChoiceCardGroup>,
    );
    fireEvent.click(screen.getByText("B"));
    expect(screen.getByRole("radio", { name: "A" })).toBeChecked();
    rerender(
      <ChoiceCardGroup value="b" aria-label="受控选择">
        <ChoiceCard value="a" title="A" />
        <ChoiceCard value="b" title="B" />
      </ChoiceCardGroup>,
    );
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
  });
});
