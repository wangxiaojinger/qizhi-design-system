import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input", () => {
  it("keeps a controlled value when clearing is rejected by its owner", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input value="固定值" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "清空输入内容" }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox")).toHaveValue("固定值");
  });

  it("never normalizes readonly values or composition confirmation", () => {
    const normalize = vi.fn((value: string) => value.trim());
    const { rerender } = render(<Input readOnly defaultValue=" value " normalize={normalize} />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(normalize).not.toHaveBeenCalled();
    rerender(<Input defaultValue=" value " normalize={normalize} normalizeTrigger="enter" />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", isComposing: true });
    expect(normalize).not.toHaveBeenCalled();
  });

  it("allows consumers to cancel Enter search", () => {
    const onSearch = vi.fn();
    render(<Input.Search onSearch={onSearch} onKeyDown={(event) => event.preventDefault()} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSearch).not.toHaveBeenCalled();
  });
  it("disables search and password actions with their fields", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const onVisibilityChange = vi.fn();
    render(<><Input.Search disabled searchButton onSearch={onSearch} /><Input.Password disabled onVisibilityChange={onVisibilityChange} /></>);
    expect(screen.getByRole("button", { name: "搜索" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "显示密码" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "搜索" }));
    expect(onSearch).not.toHaveBeenCalled();
    expect(onVisibilityChange).not.toHaveBeenCalled();
  });

  it("searches with the icon but ignores composition Enter", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<Input.Search defaultValue="研究" onSearch={onSearch} />);
    await user.click(screen.getByRole("button", { name: "搜索" }));
    expect(onSearch).toHaveBeenCalledWith("研究");
    onSearch.mockClear();
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", isComposing: true });
    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it("combines count with clear and supplies usable event methods", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn((event) => { event.preventDefault(); event.stopPropagation(); expect(event.isDefaultPrevented()).toBe(true); });
    render(<Input defaultValue="abc" maxLength={10} showWordLimit onChange={onChange} />);
    expect(screen.getByText("3/10")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "清空输入内容" }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByText("0/10")).toBeInTheDocument();
  });
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
    expect(screen.getByRole("button", { name: "清空输入内容" })).toBeInTheDocument();
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
