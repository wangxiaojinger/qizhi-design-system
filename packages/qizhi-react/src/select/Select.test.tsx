import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Select } from "./Select";

const options = [
  { label: "北京", value: "beijing" },
  { label: "上海", value: "shanghai" },
  { label: "广州", value: "guangzhou", disabled: true },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  it("多选项将复选框放在选项内容之后", async () => {
    const user = userEvent.setup();
    render(<Select mode="multiple" options={options} defaultValue={["beijing"]} aria-label="选择城市" />);

    await user.click(screen.getByRole("combobox"));
    const option = screen.getByRole("option", { name: "北京" });
    const content = option.querySelector(".qizhi-select-popup__option-content");
    const checkbox = option.querySelector(".qizhi-select-popup__check");

    expect(content).not.toBeNull();
    expect(checkbox).not.toBeNull();
    expect(content!.compareDocumentPosition(checkbox!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("禁用选项不发出变更", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "广州" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("forwards popup scroll events", async () => {
    const onPopupScroll = vi.fn();
    render(<Select defaultOpen options={options} onPopupScroll={onPopupScroll} />);

    const listbox = await screen.findByRole("listbox");
    fireEvent.scroll(listbox.parentElement!);

    expect(onPopupScroll).toHaveBeenCalledTimes(1);
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

  it("删除 allowCreate 合成的多选值时触发 onDeselect", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onDeselect = vi.fn();
    render(<Select
      mode="multiple"
      options={options}
      allowCreate
      defaultValue={["项目10"]}
      onChange={onChange}
      onDeselect={onDeselect}
    />);

    await user.click(screen.getByRole("button", { name: "删除 项目10" }));

    expect(onChange).toHaveBeenCalledWith([], []);
    expect(onDeselect).toHaveBeenCalledWith("项目10", {
      label: "项目10",
      value: "项目10",
    });
  });

  it("删除 allowCreate 合成值后为剩余未知值保留 onChange 选项映射", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select
      mode="multiple"
      options={options}
      allowCreate
      defaultValue={["项目10", "项目11"]}
      onChange={onChange}
    />);

    await user.click(screen.getByRole("button", { name: "删除 项目10" }));

    expect(onChange).toHaveBeenCalledWith(["项目11"], [{
      label: "项目11",
      value: "项目11",
    }]);
  });

  it("区分数字值与同文本的字符串值", () => {
    render(<Select mode="multiple" options={[
      { label: "数字1", value: 1 },
      { label: "字符串1", value: "1" },
    ]} defaultValue={[1]} defaultOpen />);

    expect(screen.getByRole("option", { name: "数字1" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "字符串1" })).toHaveAttribute("aria-selected", "false");
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

  it("跳过禁用项时 aria-activedescendant 指向实际活动项", async () => {
    render(<Select options={[
      { label: "禁用城市", value: "disabled", disabled: true },
      { label: "北京", value: "beijing" },
    ]} aria-label="选择城市" />);
    const trigger = screen.getByRole("combobox");

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    const activeId = trigger.getAttribute("aria-activedescendant");
    expect(activeId).not.toBeNull();
    expect(document.getElementById(activeId!)).toHaveTextContent("北京");
  });

  it("首次按 ArrowUp 激活最后一个可用选项", () => {
    render(<Select options={options} aria-label="选择城市" />);
    const trigger = screen.getByRole("combobox");

    fireEvent.keyDown(trigger, { key: "ArrowUp" });

    const activeId = trigger.getAttribute("aria-activedescendant");
    expect(activeId).not.toBeNull();
    expect(document.getElementById(activeId!)).toHaveTextContent("上海");
  });

  it("为键盘活动项提供可视状态", () => {
    render(<Select options={options} aria-label="选择城市" />);
    const trigger = screen.getByRole("combobox");

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    expect(screen.getByRole("option", { name: "北京" })).toHaveClass("is-active");
    expect(screen.getByRole("option", { name: "上海" })).not.toHaveClass("is-active");
  });

  it("搜索模式允许输入空格", async () => {
    const user = userEvent.setup();
    render(<Select options={options} showSearch aria-label="搜索城市" />);
    const trigger = screen.getByRole("combobox");

    await user.click(trigger);
    await user.keyboard("{ArrowDown}");
    await user.type(trigger, "北京 烤鸭");

    expect(trigger).toHaveValue("北京 烤鸭");
  });

  it("焦点离开选择器和弹层后关闭下拉菜单", async () => {
    const user = userEvent.setup();
    render(<><Select options={options} aria-label="选择城市" /><button type="button">后续操作</button></>);
    const trigger = screen.getByRole("combobox");

    await user.click(trigger);
    await user.tab();

    expect(screen.getByRole("button", { name: "后续操作" })).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("键盘可聚焦并清除 allowClear 入口", async () => {
    const user = userEvent.setup();
    render(<Select options={options} defaultValue="beijing" allowClear aria-label="选择城市" />);
    const trigger = screen.getByRole("combobox");

    await user.click(trigger);
    await user.tab();
    const clearButton = screen.getByRole("button", { name: "清除选择" });
    expect(clearButton).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(trigger).toHaveValue("");
  });

  it("焦点在选择器内部移动时不触发 onBlur", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(<><Select options={options} defaultValue="beijing" allowClear onBlur={onBlur} aria-label="选择城市" /><button type="button">后续操作</button></>);
    const trigger = screen.getByRole("combobox");

    await user.click(trigger);
    await user.tab();

    expect(screen.getByRole("button", { name: "清除选择" })).toHaveFocus();
    expect(onBlur).not.toHaveBeenCalled();

    await user.tab();

    expect(screen.getByRole("button", { name: "后续操作" })).toHaveFocus();
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
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

  it("向自定义触发器提供键盘活动选项关联", () => {
    render(<Select
      options={options}
      trigger={({ valueText, ...triggerProps }) => <button {...triggerProps} type="button">{valueText || "无"}</button>}
    />);
    const trigger = screen.getByRole("combobox");

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    const activeId = trigger.getAttribute("aria-activedescendant");
    expect(activeId).not.toBeNull();
    expect(document.getElementById(activeId!)).toHaveTextContent("北京");
  });

  it("支持受控 searchValue 并只通过 onSearch 请求更新", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<Select options={options} showSearch searchValue="北" onSearch={onSearch} aria-label="搜索城市" />);
    const input = screen.getByRole("combobox", { name: "搜索城市" });

    await user.click(input);
    expect(input).toHaveValue("北");
    await user.type(input, "京");
    expect(onSearch).toHaveBeenLastCalledWith("北京");
    expect(input).toHaveValue("北");

    rerender(<Select options={options} showSearch searchValue="北京" onSearch={onSearch} aria-label="搜索城市" />);
    expect(input).toHaveValue("北京");
  });

  it("加载时提供忙碌状态并阻止选择和创建", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select options={options} showSearch allowCreate loading defaultOpen onChange={onChange} aria-label="加载城市" />);

    const popup = screen.getByRole("listbox").parentElement!;
    expect(popup).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("正在加载");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();

    await user.type(screen.getByRole("combobox"), "成都");
    expect(screen.queryByRole("option", { name: /成都/ })).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("支持自定义空状态内容", () => {
    const { rerender } = render(<Select options={[]} defaultOpen notFoundContent="没有匹配城市" />);
    expect(screen.getByRole("status")).toHaveTextContent("没有匹配城市");

    rerender(<Select options={[]} defaultOpen notFoundContent={null} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("达到 maxCount 后只禁用未选项，仍允许取消选择", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select mode="multiple" options={options} defaultValue={["beijing"]} maxCount={1} onChange={onChange} aria-label="限制城市" />);
    await user.click(screen.getByRole("combobox"));

    const selected = screen.getByRole("option", { name: "北京" });
    const blocked = screen.getByRole("option", { name: "上海" });
    expect(selected).not.toHaveAttribute("aria-disabled", "true");
    expect(blocked).toHaveAttribute("aria-disabled", "true");
    await user.click(blocked);
    expect(onChange).not.toHaveBeenCalled();
    await user.click(selected);
    expect(onChange).toHaveBeenLastCalledWith([], []);
  });

  it("使用 ResizeObserver 响应容器和弹层尺寸变化", async () => {
    const resizeCallbacks: ResizeObserverCallback[] = [];
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: ResizeObserverCallback) { resizeCallbacks.push(callback); }
      observe = observe;
      disconnect = disconnect;
    });

    const { container, unmount } = render(<Select mode="multiple" options={options} defaultValue={["beijing", "shanghai"]} maxTagCount="responsive" defaultOpen />);
    const control = container.querySelector(".qizhi-select__control") as HTMLElement;
    expect(observe).toHaveBeenCalledWith(control);
    expect(observe).toHaveBeenCalledWith(screen.getByRole("listbox").parentElement);

    Object.defineProperty(control, "clientWidth", { configurable: true, value: 170 });
    container.querySelectorAll<HTMLElement>(".qizhi-select__measure > .qizhi-tag:not(.qizhi-select__tag--more)")
      .forEach((tag) => vi.spyOn(tag, "getBoundingClientRect")
        .mockReturnValue({ width: 60 } as DOMRect));
    container.querySelectorAll<HTMLElement>(".qizhi-select__measure > .qizhi-select__tag--more")
      .forEach((tag) => vi.spyOn(tag, "getBoundingClientRect")
        .mockReturnValue({ width: 40 } as DOMRect));

    act(() => resizeCallbacks.forEach((resize) => resize([], {} as ResizeObserver)));
    expect(screen.getByRole("button", { name: "删除 北京" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "删除 上海" })).not.toBeInTheDocument();
    expect(within(container.querySelector(".qizhi-select__tags")!)
      .getByText("+1 个更多")).toBeInTheDocument();
    unmount();
    expect(disconnect).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("渲染分组选项并在搜索时隐藏空分组", async () => {
    const user = userEvent.setup();
    render(<Select showSearch options={[
      { label: "华北", options: [{ label: "北京", value: "beijing" }] },
      { label: "华东", options: [{ label: "上海", value: "shanghai" }] },
    ]} aria-label="分组城市" />);
    const input = screen.getByRole("combobox", { name: "分组城市" });

    await user.click(input);
    expect(screen.getByRole("group", { name: "华北" }))
      .toContainElement(screen.getByRole("option", { name: "北京" }));
    expect(screen.getByRole("group", { name: "华东" }))
      .toContainElement(screen.getByRole("option", { name: "上海" }));

    await user.type(input, "上海");
    expect(screen.queryByRole("group", { name: "华北" })).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "华东" })).toBeInTheDocument();
  });

  it("键盘导航跳过分组标题并选择实际选项", () => {
    const onSelect = vi.fn();
    render(<Select options={[
      { label: "华北", options: [{ label: "北京", value: "beijing" }] },
      { label: "华东", options: [{ label: "上海", value: "shanghai" }] },
    ]} onSelect={onSelect} aria-label="分组城市" />);
    const input = screen.getByRole("combobox", { name: "分组城市" });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith("beijing", {
      label: "北京",
      value: "beijing",
    });
    expect(input).toHaveValue("北京");
  });

  it("大数据扁平列表只挂载可视窗口并随滚动更新", () => {
    const manyOptions = Array.from({ length: 200 }, (_, index) => ({
      label: `选项 ${index + 1}`,
      value: index + 1,
    }));
    render(<Select options={manyOptions} defaultOpen listHeight={160} />);

    const popup = screen.getByRole("listbox").parentElement!;
    expect(screen.getAllByRole("option").length).toBeLessThan(20);
    expect(screen.getByRole("option", { name: "选项 1" }))
      .toHaveAttribute("aria-setsize", "200");

    Object.defineProperty(popup, "scrollTop", {
      configurable: true,
      writable: true,
      value: 1600,
    });
    fireEvent.scroll(popup);

    expect(screen.getByRole("option", { name: "选项 51" }))
      .toHaveAttribute("aria-posinset", "51");
    expect(screen.queryByRole("option", { name: "选项 1" }))
      .not.toBeInTheDocument();
  });

  it("虚拟列表的 listHeight 不超过当前视口可用高度", () => {
    vi.stubGlobal("innerHeight", 200);
    const manyOptions = Array.from({ length: 100 }, (_, index) => ({
      label: `选项 ${index + 1}`,
      value: index + 1,
    }));

    render(<Select options={manyOptions} defaultOpen listHeight={600} />);

    expect(screen.getByRole("listbox").parentElement).toHaveStyle({ maxHeight: "192px" });
  });

  it("允许关闭大数据列表虚拟滚动", () => {
    const manyOptions = Array.from({ length: 100 }, (_, index) => ({
      label: `选项 ${index + 1}`,
      value: index + 1,
    }));
    render(<Select options={manyOptions} defaultOpen virtual={false} />);

    expect(screen.getAllByRole("option")).toHaveLength(100);
  });

  it("键盘跳到虚拟列表末项时使用弹层实际可视高度", () => {
    const manyOptions = Array.from({ length: 100 }, (_, index) => ({
      label: `选项 ${index + 1}`,
      value: index + 1,
    }));
    render(<Select options={manyOptions} defaultOpen listHeight={160} aria-label="大数据" />);
    const popup = screen.getByRole("listbox").parentElement!;
    Object.defineProperty(popup, "clientHeight", { configurable: true, value: 150 });
    Object.defineProperty(popup, "scrollTop", { configurable: true, writable: true, value: 0 });

    fireEvent.keyDown(screen.getByRole("combobox", { name: "大数据" }), { key: "ArrowUp" });

    expect(popup.scrollTop).toBe(3050);
  });

  it("使用 renderMore 的真实 ReactNode 测量响应式摘要", () => {
    const { container } = render(
      <Select
        mode="multiple"
        options={options}
        defaultValue={["beijing", "shanghai"]}
        maxTagCount="responsive"
        renderMore={(count) => <strong data-testid="more-summary">{count} 项</strong>}
      />,
    );

    expect(screen.getAllByTestId("more-summary")).toHaveLength(2);
    screen.getAllByTestId("more-summary").forEach((summary) => {
      expect(container.querySelector(".qizhi-select__measure")).toContainElement(summary);
      expect(summary.closest(".qizhi-tag")).not.toBeNull();
    });
  });

  it("分别触发选择、取消、清空和复合焦点事件", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onDeselect = vi.fn();
    const onClear = vi.fn();
    const onFocus = vi.fn();
    render(<><Select
      mode="multiple"
      options={options}
      defaultValue={["beijing"]}
      allowClear
      onSelect={onSelect}
      onDeselect={onDeselect}
      onClear={onClear}
      onFocus={onFocus}
      aria-label="事件城市"
    /><button type="button">外部操作</button></>);
    const input = screen.getByRole("combobox", { name: "事件城市" });

    await user.click(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("option", { name: "上海" }));
    expect(onSelect).toHaveBeenCalledWith("shanghai", options[1]);
    await user.click(screen.getByRole("option", { name: "上海" }));
    expect(onDeselect).toHaveBeenCalledWith("shanghai", options[1]);

    await user.tab();
    expect(screen.getByRole("button", { name: "清除选择" })).toHaveFocus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "清除选择" }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onDeselect).toHaveBeenCalledTimes(1);
  });

  it("keeps the existing input rendering when valueRender is absent", () => {
    const { unmount } = render(<Select options={options} defaultValue="beijing" aria-label="单选城市" />);
    expect(screen.getByRole("combobox", { name: "单选城市" })).toHaveValue("北京");
    expect(document.querySelector(".qizhi-select__value-display")).toBeNull();

    unmount();
    render(<Select mode="multiple" options={options} defaultValue={["beijing"]} aria-label="多选城市" />);
    expect(screen.getByRole("button", { name: "删除 北京" })).toBeInTheDocument();
    expect(document.querySelector(".qizhi-select__value-display")).toBeNull();
  });

  it("keeps undefined multiple value on the legacy uncontrolled path", () => {
    render(<Select
      mode="multiple"
      value={undefined}
      options={options}
      aria-label="多选城市"
    />);

    expect(screen.getByRole("combobox", { name: "多选城市" }))
      .toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /删除/ }))
      .not.toBeInTheDocument();
  });

  it("renders an opt-in value display while retaining the real combobox input", async () => {
    const user = userEvent.setup();
    const contexts: Array<{ open: boolean; searching: boolean; query: string; valueText: string }> = [];
    render(<Select
      options={options}
      defaultValue="beijing"
      showSearch
      aria-label="搜索城市"
      valueRender={(context) => {
        contexts.push({ open: context.open, searching: context.searching, query: context.query, valueText: context.valueText });
        return <span>当前：{context.valueText}</span>;
      }}
    />);

    const input = screen.getByRole("combobox", { name: "搜索城市" });
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input).toHaveValue("");
    expect(screen.getByText("当前：北京")).toBeInTheDocument();
    await user.click(input);
    await user.type(input, "上");

    expect(screen.getByText("当前：北京")).toBeInTheDocument();
    expect(contexts.at(-1)).toEqual({ open: true, searching: true, query: "上", valueText: "北京" });
  });
});
