import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const options = [
  { label: "北京", value: "beijing" },
  { label: "上海", value: "shanghai" },
  { label: "广州", value: "guangzhou", disabled: true },
];

describe("Select", () => {
  it("用 combobox/listbox 语义打开并选择单选项", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} aria-label="选择城市" />);
    const trigger = screen.getByRole("combobox", { name: "选择城市" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox");
    await user.click(within(listbox).getByRole("option", { name: "上海" }));
    expect(onChange).toHaveBeenCalledWith("shanghai", options[1]);
    expect(trigger).toHaveValue("上海");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("多选保持弹层打开并可删除标签", async () => {
    const user = userEvent.setup();
    render(<Select mode="multiple" options={options} defaultValue={["beijing"]} aria-label="选择城市" />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "上海" }));
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "删除 北京" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "删除 北京" }));
    expect(screen.queryByRole("button", { name: "删除 北京" })).not.toBeInTheDocument();
  });

  it("复用 Dropdown 菜单类名并保留 listbox 语义", async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toHaveClass("qizhi-dropdown__menu");
    expect(screen.getByRole("option", { name: "北京" })).toHaveClass("qizhi-dropdown__item");
    expect(screen.getByRole("option", { name: "北京" }).querySelector(".qizhi-select-popup__check")).toBeNull();
  });

  it("多选项、已选标签和清空入口复用 QIZHI 公共视觉组件", async () => {
    const user = userEvent.setup();
    render(<Select mode="multiple" options={options} defaultValue={["beijing"]} allowClear aria-label="选择城市" />);

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "北京" }).querySelector(".qizhi-checkbox-mask")).toBeInTheDocument();
    expect(screen.getByText("北京", { selector: ".qizhi-tag-content" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除 北京" }).querySelector("svg")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "清除选择" }).querySelector("svg")).toBeInTheDocument();
  });

  it("禁用选项不发出变更", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "广州" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("支持搜索、创建和分词", async () => {
    const user = userEvent.setup();
    render(<Select mode="multiple" options={options} showSearch allowCreate tokenSeparators={[",", "|"]} aria-label="选择城市" />);
    const input = screen.getByRole("combobox");
    await user.type(input, "北京,上海|");
    expect(screen.getByRole("button", { name: "删除 北京" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除 上海" })).toBeInTheDocument();
    await user.type(input, "成都");
    await user.click(screen.getByRole("option", { name: "输入创建：成都" }));
    expect(screen.getByRole("button", { name: "删除 成都" })).toBeInTheDocument();
  });

  it("允许创建时回显不在 options 中的初始值", () => {
    const { unmount } = render(<Select options={options} allowCreate defaultValue="自定义项目" />);
    expect(screen.getByRole("combobox")).toHaveValue("自定义项目");
    unmount();
    render(<Select mode="multiple" options={options} allowCreate defaultValue={["项目10"]} />);
    expect(screen.getByRole("button", { name: "删除 项目10" })).toBeInTheDocument();
  });

  it("通过 Escape 关闭并恢复触发器焦点", async () => {
    const user = userEvent.setup();
    render(<Select options={options} />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("只在键盘操作后保留关闭态焦点提示", async () => {
    const user = userEvent.setup();
    const { container } = render(<Select options={options} />);
    const trigger = screen.getByRole("combobox");

    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "北京" }));
    expect(container.querySelector(".qizhi-select")).not.toHaveClass("is-keyboard-focused");

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(container.querySelector(".qizhi-select")).toHaveClass("is-keyboard-focused");
  });

  it("忽略系统快捷键组合，不显示键盘聚焦态", () => {
    const { container } = render(<Select options={options} />);
    const trigger = screen.getByRole("combobox");

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "A", metaKey: true, shiftKey: true });

    expect(container.querySelector(".qizhi-select")).not.toHaveClass("is-keyboard-focused");
  });

  it("向自定义触发器提供实时选中文本", async () => {
    const user = userEvent.setup();
    render(<Select options={options} trigger={({ valueText, ...triggerProps }) => <button {...triggerProps} type="button">{valueText || "无"}</button>} />);
    const trigger = screen.getByRole("combobox");
    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "北京" }));
    expect(trigger).toHaveTextContent("北京");
  });
});
