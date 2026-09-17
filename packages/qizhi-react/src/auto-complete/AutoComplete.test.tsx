import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
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

  it("支持关闭默认过滤和点击外部关闭", async () => {
    const user = userEvent.setup();
    render(<><AutoComplete aria-label="不过滤" data={["A", "B"]} filterOption={false} /><button type="button">外部</button></>);
    const input = screen.getByRole("combobox", { name: "不过滤" });

    await user.type(input, "x");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "外部" }));
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

});
