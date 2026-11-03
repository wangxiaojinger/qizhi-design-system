import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../input/Input";
import { AutoComplete } from "./AutoComplete";

describe("AutoComplete", () => {
  it("复用 Input 并支持非受控输入、过滤和选择", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelect = vi.fn();
    const { container } = render(
      <AutoComplete
        aria-label="城市"
        data={["Beijing", "Shanghai", "Beihai"]}
        onChange={onChange}
        onSelect={onSelect}
      />,
    );
    const input = screen.getByRole("combobox", { name: "城市" });

    expect(container.querySelector(".qizhi-input")).toBeInTheDocument();
    await user.type(input, "bei");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    await user.click(screen.getByRole("option", { name: "Beijing" }));
    expect(input).toHaveValue("Beijing");
    expect(onChange).toHaveBeenLastCalledWith("Beijing");
    expect(onSelect).toHaveBeenCalledWith("Beijing", expect.objectContaining({ value: "Beijing" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("严格区分大小写", async () => {
    const user = userEvent.setup();
    render(<AutoComplete aria-label="严格匹配" strict data={["beijing", "beihai", "baoding"]} />);
    const input = screen.getByRole("combobox", { name: "严格匹配" });

    await user.type(input, "B");
    expect(screen.getByRole("status")).toHaveTextContent("暂无匹配结果");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "b");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("支持上下方向键、Enter 选择和 Escape 关闭", async () => {
    const user = userEvent.setup();
    render(<AutoComplete aria-label="键盘选择" data={["one", "two", "three"]} />);
    const input = screen.getByRole("combobox", { name: "键盘选择" });

    await user.type(input, "o");
    await user.keyboard("{ArrowDown}");
    const activeId = input.getAttribute("aria-activedescendant");
    expect(activeId).toBeTruthy();
    expect(document.getElementById(activeId!)).toHaveTextContent("one");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(input).toHaveValue("two");

    await user.type(input, "x");
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("受控模式仅通知变化", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AutoComplete aria-label="受控输入" value="Beijing" data={["Beijing"]} onChange={onChange} />);
    const input = screen.getByRole("combobox", { name: "受控输入" });

    await user.type(input, "x");
    expect(onChange).toHaveBeenCalledWith("Beijingx");
    expect(input).toHaveValue("Beijing");
    expect(screen.getByRole("option", { name: "Beijing" })).toBeInTheDocument();
  });

  it("运行中变为 disabled 后关闭弹层并阻止交互", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { rerender } = render(<AutoComplete aria-label="动态禁用" data={["Beijing"]} onSelect={onSelect} />);
    const input = screen.getByRole("combobox", { name: "动态禁用" });

    await user.type(input, "Bei");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    rerender(<AutoComplete aria-label="动态禁用" data={["Beijing"]} disabled onSelect={onSelect} />);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("readOnly 时不打开弹层或选择候选项", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<AutoComplete aria-label="只读城市" defaultValue="Bei" data={["Beijing"]} readOnly onSelect={onSelect} />);
    const input = screen.getByRole("combobox", { name: "只读城市" });

    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");

    expect(input).toHaveValue("Bei");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("异步候选项变化后清空旧的活动项", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AutoComplete aria-label="异步候选" data={["Beijing", "Beihai", "Beian"]} />);
    const input = screen.getByRole("combobox", { name: "异步候选" });

    await user.type(input, "Bei");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringMatching(/option-1$/));
    rerender(<AutoComplete aria-label="异步候选" data={["Beijing"]} />);

    expect(input).not.toHaveAttribute("aria-activedescendant");
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("IME 组合输入期间不搜索或误选，结束后搜索最终文本", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const onSelect = vi.fn();
    render(<AutoComplete aria-label="中文输入" data={["北京"]} onSearch={onSearch} onSelect={onSelect} />);
    const input = screen.getByRole("combobox", { name: "中文输入" });

    await user.click(input);
    input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "bei" }));
    await user.type(input, "bei");
    await user.keyboard("{Enter}");
    expect(onSearch).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();

    input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "北京" }));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenLastCalledWith("bei");
  });

  it("支持 Option 子项、分组和自定义候选内容", async () => {
    const user = userEvent.setup();
    render(
      <AutoComplete aria-label="自定义选项" filterOption={false}>
        <AutoComplete.Option value="beijing" group="华北"><span>北京</span></AutoComplete.Option>
        <AutoComplete.Option value="shanghai" group="华东"><span>上海</span><small>20 results</small></AutoComplete.Option>
      </AutoComplete>,
    );
    const input = screen.getByRole("combobox", { name: "自定义选项" });
    await user.type(input, "a");

    expect(screen.getByText("华北")).toBeInTheDocument();
    expect(screen.getByText("华东")).toBeInTheDocument();
    expect(within(screen.getByRole("option", { name: /20 results/ })).getByText("上海")).toBeInTheDocument();
  });

  it("复用 Input.TextArea 作为自定义输入组件", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AutoComplete
        aria-label="自定义文本域"
        data={["hello_0", "hello_1"]}
        triggerElement={<Input.TextArea placeholder="用您自己的文字进行自定义" />}
      />,
    );
    const input = screen.getByRole("combobox", { name: "自定义文本域" });

    expect(input.tagName).toBe("TEXTAREA");
    expect(container.querySelector(".qizhi-textarea")).toBeInTheDocument();
    await user.type(input, "hello");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("同时合并组件 ref 和自定义输入原有 ref", () => {
    const autoCompleteRef = createRef<HTMLInputElement | HTMLTextAreaElement>();
    const triggerRef = createRef<HTMLTextAreaElement>();

    render(
      <AutoComplete
        ref={autoCompleteRef}
        aria-label="ref 合并"
        triggerElement={<Input.TextArea ref={triggerRef} />}
      />,
    );

    expect(autoCompleteRef.current).toBe(screen.getByRole("combobox", { name: "ref 合并" }));
    expect(triggerRef.current).toBe(autoCompleteRef.current);
  });

  it("未显式传入时继承自定义输入的 disabled 和 readOnly，显式 false 可覆盖", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <>
        <AutoComplete aria-label="继承禁用" data={["Beijing"]} triggerElement={<Input.TextArea disabled />} />
        <AutoComplete aria-label="继承只读" data={["Shanghai"]} triggerElement={<Input.TextArea readOnly />} />
      </>,
    );

    expect(screen.getByRole("combobox", { name: "继承禁用" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "继承只读" })).toHaveAttribute("readonly");
    await user.click(screen.getByRole("combobox", { name: "继承只读" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    rerender(
      <>
        <AutoComplete disabled={false} aria-label="继承禁用" data={["Beijing"]} triggerElement={<Input.TextArea disabled />} />
        <AutoComplete readOnly={false} aria-label="继承只读" data={["Shanghai"]} triggerElement={<Input.TextArea readOnly />} />
      </>,
    );

    expect(screen.getByRole("combobox", { name: "继承禁用" })).toBeEnabled();
    expect(screen.getByRole("combobox", { name: "继承只读" })).not.toHaveAttribute("readonly");
    await user.type(screen.getByRole("combobox", { name: "继承只读" }), "Sh");
    expect(screen.getByRole("option", { name: "Shanghai" })).toBeInTheDocument();
  });

  it("callback ref 在普通重渲染、弹层开关和候选更新时不产生 null-node 抖动", async () => {
    const user = userEvent.setup();
    const triggerRef = vi.fn<(node: HTMLTextAreaElement | null) => void>();
    const { rerender } = render(
      <AutoComplete aria-label="稳定 ref" data={["Beijing"]} triggerElement={<Input.TextArea ref={triggerRef} />} />,
    );
    const input = screen.getByRole("combobox", { name: "稳定 ref" });

    expect(triggerRef.mock.calls).toEqual([[input]]);
    await user.type(input, "Bei");
    await user.keyboard("{Escape}");
    rerender(<AutoComplete aria-label="稳定 ref" data={["Beijing", "Beihai"]} triggerElement={<Input.TextArea ref={triggerRef} />} />);

    expect(triggerRef.mock.calls).toEqual([[input]]);
  });

  it("自定义输入的 callback ref 更换时清理旧 ref 并同步新 ref", () => {
    const firstRef = vi.fn<(node: HTMLTextAreaElement | null) => void>();
    const secondRef = vi.fn<(node: HTMLTextAreaElement | null) => void>();
    const { rerender } = render(
      <AutoComplete aria-label="更换 ref" triggerElement={<Input.TextArea ref={firstRef} />} />,
    );
    const input = screen.getByRole("combobox", { name: "更换 ref" });

    expect(firstRef.mock.calls).toEqual([[input]]);
    rerender(<AutoComplete aria-label="更换 ref" triggerElement={<Input.TextArea ref={secondRef} />} />);

    expect(firstRef).toHaveBeenLastCalledWith(null);
    expect(secondRef).toHaveBeenLastCalledWith(input);
  });

  it("组件卸载时同步清空合并的 callback ref", () => {
    const autoCompleteRef = vi.fn<(node: HTMLInputElement | HTMLTextAreaElement | null) => void>();
    const triggerRef = vi.fn<(node: HTMLTextAreaElement | null) => void>();
    const { unmount } = render(
      <AutoComplete ref={autoCompleteRef} aria-label="卸载 ref" triggerElement={<Input.TextArea ref={triggerRef} />} />,
    );

    unmount();

    expect(autoCompleteRef).toHaveBeenLastCalledWith(null);
    expect(triggerRef).toHaveBeenLastCalledWith(null);
  });

  it("将候选弹层 Portal 到 document.body", async () => {
    const user = userEvent.setup();
    const { container } = render(<AutoComplete aria-label="Portal 弹层" data={["Beijing"]} />);

    await user.type(screen.getByRole("combobox", { name: "Portal 弹层" }), "Bei");

    expect(screen.getByRole("listbox").parentElement).toBe(document.body);
    expect(container.querySelector("[role=listbox]")).not.toBeInTheDocument();
  });

  it("允许键盘焦点进入 Portal 内的重试按钮", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<AutoComplete aria-label="Portal 重试" defaultValue="Bei" error="查询失败" onRetry={onRetry} />);
    const input = screen.getByRole("combobox", { name: "Portal 重试" });

    await user.click(input);
    await user.tab();

    expect(screen.getByRole("button", { name: "重试" })).toHaveFocus();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("触发器靠近视口底部时将弹层翻转到上方", async () => {
    const user = userEvent.setup();
    const originalRect = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function getBoundingClientRect(this: HTMLElement) {
      if (this.classList.contains("qizhi-auto-complete")) return new DOMRect(100, 700, 154, 32);
      if (this.classList.contains("qizhi-auto-complete__popup")) return new DOMRect(0, 0, 154, 160);
      return originalRect.call(this);
    });
    render(<AutoComplete aria-label="底部翻转" data={["Beijing"]} />);

    await user.type(screen.getByRole("combobox", { name: "底部翻转" }), "Bei");

    await waitFor(() => expect(screen.getByRole("listbox")).toHaveAttribute("data-auto-complete-position", "topLeft"));
    expect(Number.parseFloat(screen.getByRole("listbox").style.top)).toBeLessThan(700);
    vi.restoreAllMocks();
  });

  it("弹层上下都放不下时选择可用空间更大的一侧并保持视口边界", async () => {
    const user = userEvent.setup();
    const originalRect = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function getBoundingClientRect(this: HTMLElement) {
      if (this.classList.contains("qizhi-auto-complete")) return new DOMRect(100, 460, 154, 32);
      if (this.classList.contains("qizhi-auto-complete__popup")) return new DOMRect(0, 0, 154, 600);
      return originalRect.call(this);
    });
    render(<AutoComplete aria-label="双向溢出" data={["Beijing"]} />);

    await user.type(screen.getByRole("combobox", { name: "双向溢出" }), "Bei");

    await waitFor(() => expect(screen.getByRole("listbox")).toHaveAttribute("data-auto-complete-position", "topLeft"));
    expect(Number.parseFloat(screen.getByRole("listbox").style.top)).toBeGreaterThanOrEqual(8);
    vi.restoreAllMocks();
  });

  it("Portal 弹层快照触发器所在局部主题的关键 CSS 变量", async () => {
    const user = userEvent.setup();
    render(
      <div style={{ "--color-bg-2": "rgb(1, 2, 3)", "--color-text-1": "rgb(4, 5, 6)", "--primary-6": "7, 8, 9" } as React.CSSProperties}>
        <AutoComplete aria-label="局部主题" data={["Beijing"]} />
      </div>,
    );

    await user.type(screen.getByRole("combobox", { name: "局部主题" }), "Bei");
    const popup = screen.getByRole("listbox");

    expect(popup.style.getPropertyValue("--color-bg-2")).toBe("rgb(1, 2, 3)");
    expect(popup.style.getPropertyValue("--color-text-1")).toBe("rgb(4, 5, 6)");
    expect(popup.style.getPropertyValue("--primary-6")).toBe("7, 8, 9");
  });

  it("支持关闭默认过滤和点击外部关闭", async () => {
    const user = userEvent.setup();
    render(<><AutoComplete aria-label="不过滤" data={["A", "B"]} filterOption={false} /><button type="button">外部</button></>);
    const input = screen.getByRole("combobox", { name: "不过滤" });

    await user.type(input, "x");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "外部" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("按 Tab 离开输入框后关闭候选弹层", async () => {
    const user = userEvent.setup();
    render(<><AutoComplete aria-label="键盘离开" data={["bei_0", "bei_1"]} /><button type="button">查看代码</button></>);
    const input = screen.getByRole("combobox", { name: "键盘离开" });

    await user.type(input, "bei");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.tab();

    expect(screen.getByRole("button", { name: "查看代码" })).toHaveFocus();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("转发输入框的聚焦与失焦事件", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<><AutoComplete aria-label="事件转发" data={["A"]} onFocus={onFocus} onBlur={onBlur} /><button type="button">外部</button></>);
    const input = screen.getByRole("combobox", { name: "事件转发" });

    await user.click(input);
    await user.click(screen.getByRole("button", { name: "外部" }));
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("展示加载、失败重试、空结果和成功候选四态", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onSelect = vi.fn();
    const { rerender } = render(
      <AutoComplete aria-label="区域" data={["华北旧候选"]} loading onRetry={onRetry} onSelect={onSelect} />,
    );
    const input = screen.getByRole("combobox", { name: "区域" });
    await user.type(input, "华");

    expect(screen.getByRole("status")).toHaveTextContent("正在加载");
    await user.keyboard("{Enter}");
    expect(onSelect).not.toHaveBeenCalled();

    rerender(<AutoComplete aria-label="区域" data={["华北旧候选"]} error="查询失败" onRetry={onRetry} onSelect={onSelect} />);
    expect(screen.getByText("查询失败")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "重试" }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(<AutoComplete aria-label="区域" data={[]} emptyContent="没有匹配区域" onSelect={onSelect} />);
    expect(screen.getByText("没有匹配区域")).toBeInTheDocument();

    rerender(<AutoComplete aria-label="区域" data={["华北"]} onSelect={onSelect} />);
    expect(screen.getByRole("option", { name: "华北" })).toBeInTheDocument();
  });

});
