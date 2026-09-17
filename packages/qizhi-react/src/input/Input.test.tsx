import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input", () => {
  it("forwards native attributes and ref with the approved default contract", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} name="service" placeholder="请输入内容" data-testid="input" />);

    expect(ref.current).toBe(screen.getByPlaceholderText("请输入内容"));
    expect(ref.current).toHaveAttribute("name", "service");
    expect(ref.current?.parentElement).toHaveClass("qizhi-input", "qizhi-input--size-default");
  });

  it("supports controlled input and clears through the public value callback", async () => {
    const user = userEvent.setup();
    function ControlledInput() {
      const [value, setValue] = useState("QIZHI");
      return <Input value={value} onChange={(event) => setValue(event.target.value)} />;
    }
    render(<ControlledInput />);

    const clearButton = screen.getByRole("button", { name: "清空输入内容" });
    expect(clearButton.querySelector('[data-icon="icon-运算符-乘号"]')).not.toBeNull();
    await user.click(clearButton);
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("does not render a clear button when excluded, disabled, or readonly", () => {
    const { rerender } = render(<Input defaultValue="内容" allowClear={false} />);
    expect(screen.queryByRole("button", { name: "清空输入内容" })).not.toBeInTheDocument();
    rerender(<Input defaultValue="内容" disabled />);
    expect(screen.queryByRole("button", { name: "清空输入内容" })).not.toBeInTheDocument();
    rerender(<Input defaultValue="内容" readOnly />);
    expect(screen.queryByRole("button", { name: "清空输入内容" })).not.toBeInTheDocument();
  });

  it("applies status, size, affixes, and addons without changing native semantics", () => {
    render(<Input status="error" size="large" prefix="用户" suffix="信息" addBefore="+86" addAfter="KG" aria-label="重量" style={{ "--qizhi-input-height": "40px" } as React.CSSProperties} />);
    const input = screen.getByRole("textbox", { name: "重量" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.parentElement).toHaveClass("qizhi-input--error", "qizhi-input--size-large");
    expect(screen.getByText("用户")).toHaveClass("qizhi-input__prefix");
    expect(screen.getByText("信息")).toHaveClass("qizhi-input__suffix");
    expect(screen.getByText("+86")).toHaveClass("qizhi-input__addon--before");
    expect(screen.getByText("KG")).toHaveClass("qizhi-input__addon--after");
    expect(input.closest(".qizhi-input__group")).toHaveClass("qizhi-input__group--size-large");
    expect(input.closest(".qizhi-input__group")).toHaveStyle("--qizhi-input-height: 40px");
  });

  it("shows word count and marks error-only overflow without truncating", async () => {
    const user = userEvent.setup();
    render(<Input maxLength={{ length: 3, errorOnly: true }} showWordLimit />);
    await user.type(screen.getByRole("textbox"), "QIZHI");
    expect(screen.getByRole("textbox")).toHaveValue("QIZHI");
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("5/3")).toHaveClass("qizhi-input__word-limit--error");
    expect(screen.queryByRole("button", { name: "清空输入内容" })).not.toBeInTheDocument();
  });

  it("normalizes on the approved trigger and reports the normalized value", async () => {
    const user = userEvent.setup();
    render(<Input normalize={(value) => value.trim()} normalizeTrigger="enter" />);
    const input = screen.getByRole("textbox");
    await user.type(input, " QIZHI ");
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("QIZHI");
  });
});
