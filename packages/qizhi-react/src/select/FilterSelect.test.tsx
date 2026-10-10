import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterSelect } from "../index";
import type {
  FilterSelectMultipleProps,
  FilterSelectOption,
  FilterSelectProps,
  FilterSelectSingleProps,
  FilterSelectValue,
} from "../index";

const ownerOptions: FilterSelectOption[] = [
  { label: "企业管理员", value: "enterprise" },
  { label: "研究团队管理员", value: "research" },
];

const typeContract = (
  _value: FilterSelectValue,
  _props: FilterSelectProps,
  _single: FilterSelectSingleProps,
  _multiple: FilterSelectMultipleProps,
) => undefined;
void typeContract;

describe("FilterSelect single", () => {
  it("shows the filter name with the default empty text", () => {
    render(<FilterSelect label="所有者" options={ownerOptions} aria-label="所有者筛选" />);
    expect(screen.getByText("所有者：全部")).toBeInTheDocument();
  });

  it("opens when the visible summary is clicked", async () => {
    const user = userEvent.setup();
    render(<FilterSelect
      label="所有者"
      options={ownerOptions}
      aria-label="所有者筛选"
    />);

    await user.click(screen.getByText("所有者：全部"));
    const input = screen.getByRole("combobox", { name: "所有者筛选" });
    expect(input)
      .toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByText("所有者：全部"));
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("does not open a disabled filter when its summary is clicked", async () => {
    const user = userEvent.setup();
    render(<FilterSelect
      label="所有者"
      options={ownerOptions}
      disabled
      aria-label="所有者筛选"
    />);

    await user.click(screen.getByText("所有者：全部"));
    expect(screen.getByRole("combobox", { name: "所有者筛选" }))
      .toHaveAttribute("aria-expanded", "false");
  });

  it("changes immediately while popup options keep plain labels", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSelect
      label="所有者"
      options={ownerOptions}
      allOption={{ label: "全部", value: "all" }}
      onChange={onChange}
      aria-label="所有者筛选"
    />);

    await user.click(screen.getByRole("combobox", { name: "所有者筛选" }));
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "全部",
      "企业管理员",
      "研究团队管理员",
    ]);
    expect(within(listbox).queryByText(/所有者：/)).not.toBeInTheDocument();
    await user.click(within(listbox).getByRole("option", { name: "企业管理员" }));

    expect(onChange).toHaveBeenCalledWith("enterprise", ownerOptions[0]);
    expect(screen.getByText("所有者：企业管理员")).toBeInTheDocument();
  });

  it("deduplicates a colliding all option and warns in development", async () => {
    const user = userEvent.setup();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<FilterSelect
      label="所有者"
      allOption={{ label: "全部", value: "enterprise" }}
      options={ownerOptions}
      aria-label="所有者筛选"
    />);

    await user.click(screen.getByRole("combobox", { name: "所有者筛选" }));
    expect(screen.getAllByRole("option", { name: "全部" })).toHaveLength(1);
    expect(screen.queryByRole("option", { name: "企业管理员" })).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("allOption.value"));
    warn.mockRestore();
  });

  it("keeps the last resolved label when remote options are replaced", () => {
    const { rerender } = render(<FilterSelect
      label="所有者"
      value="enterprise"
      options={ownerOptions}
      aria-label="所有者筛选"
    />);
    expect(screen.getByText("所有者：企业管理员")).toBeInTheDocument();

    rerender(<FilterSelect
      label="所有者"
      value="enterprise"
      options={[{ label: "其他结果", value: "other" }]}
      aria-label="所有者筛选"
    />);
    expect(screen.getByText("所有者：企业管理员")).toBeInTheDocument();
  });

  it("keeps clear available when a selected remote option is absent", () => {
    render(<FilterSelect
      label="所有者"
      value="enterprise"
      options={[{ label: "其他结果", value: "other" }]}
      allowClear
      aria-label="所有者筛选"
    />);

    expect(screen.getByRole("button", { name: "清除选择" }))
      .toBeInTheDocument();
  });

  it("shows an unknown controlled value without synthesizing an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSelect
      label="所有者"
      value={404}
      options={ownerOptions}
      onChange={onChange}
      aria-label="所有者筛选"
    />);

    expect(screen.getByText("所有者：404")).toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "所有者筛选" }));
    expect(screen.queryByRole("option", { name: "404" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "研究团队管理员" }));
    expect(onChange).toHaveBeenCalledWith("research", ownerOptions[1]);
  });

  it("clears to custom empty text and emits undefined", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSelect
      label="所有者"
      defaultValue="enterprise"
      options={ownerOptions}
      emptyText="不限"
      allowClear
      onChange={onChange}
      aria-label="所有者筛选"
    />);

    await user.click(screen.getByRole("button", { name: "清除选择" }));
    expect(onChange).toHaveBeenCalledWith(undefined, undefined);
    expect(screen.getByText("所有者：不限")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "清除选择" }))
      .not.toBeInTheDocument();
    await user.click(screen.getByText("所有者：不限"));
    expect(screen.getByRole("option", { name: "企业管理员" }))
      .toHaveAttribute("aria-selected", "false");
  });

  it("stays empty after selecting and clearing an initially empty filter", async () => {
    const user = userEvent.setup();
    render(<FilterSelect
      label="所有者"
      options={ownerOptions}
      allowClear
      aria-label="所有者筛选"
    />);

    await user.click(screen.getByText("所有者：全部"));
    await user.click(screen.getByRole("option", { name: "企业管理员" }));
    await user.click(screen.getByRole("button", { name: "清除选择" }));
    expect(screen.getByText("所有者：全部")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "清除选择" }))
      .not.toBeInTheDocument();
    await user.click(screen.getByText("所有者：全部"));
    expect(screen.getByRole("option", { name: "企业管理员" }))
      .toHaveAttribute("aria-selected", "false");
  });
});

describe("FilterSelect multiple and search", () => {
  const tagOptions: FilterSelectOption[] = [
    { label: "research", value: "research" },
    { label: "标签A", value: "a" },
    { label: "标签B", value: "b" },
    { label: "标签C", value: "c" },
    { label: "标签D", value: "d" },
    { label: "标签E", value: "e" },
  ];

  it.each([
    [[], "标签：全部标签"],
    [["research"], "标签：research"],
    [["a", "b"], "标签：标签A、标签B"],
    [["a", "b", "c", "d", "e"], "标签：标签A、标签B +3个更多"],
  ])("formats selected values %j as %s", (defaultValue, expected) => {
    const { container } = render(<FilterSelect mode="multiple" label="标签" options={tagOptions} defaultValue={defaultValue} aria-label="标签筛选" />);
    expect(container.querySelector(".qizhi-filter-select__summary")).toHaveTextContent(expected);
    expect(screen.queryByRole("button", { name: /删除/ })).not.toBeInTheDocument();
  });

  it.each([
    [-1, "标签： +3个更多"],
    [0, "标签： +3个更多"],
    [8, "标签：标签A、标签B、标签C"],
  ])("normalizes maxDisplayCount=%s", (maxDisplayCount, expected) => {
    const { container } = render(<FilterSelect mode="multiple" label="标签" options={tagOptions} defaultValue={["a", "b", "c"]} maxDisplayCount={maxDisplayCount} aria-label="标签筛选" />);
    expect(container.querySelector(".qizhi-filter-select__summary")).toHaveTextContent(expected);
  });

  it("supports custom separators and more summaries", () => {
    render(<FilterSelect
      mode="multiple"
      label="标签"
      options={tagOptions}
      defaultValue={["a", "b", "c"]}
      maxDisplayCount={1}
      separator=" / "
      renderMore={(count) => <strong>plus {count}</strong>}
      aria-label="标签筛选"
    />);
    expect(screen.getByText("标签：标签A")).toBeInTheDocument();
    expect(screen.getByText("plus 2")).toBeInTheDocument();
  });

  it("keeps clear available when remote results omit selected values", () => {
    render(<FilterSelect
      mode="multiple"
      label="标签"
      value={["a", "b"]}
      options={[tagOptions[3]]}
      allowClear
      aria-label="标签筛选"
    />);

    expect(screen.getByRole("button", { name: "清除选择" }))
      .toBeInTheDocument();
  });

  it("toggles multiple options immediately and keeps the QIZHI check indicator", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSelect mode="multiple" label="标签" options={tagOptions} onChange={onChange} aria-label="标签筛选" />);
    await user.click(screen.getByRole("combobox", { name: "标签筛选" }));
    const option = screen.getByRole("option", { name: "research" });
    expect(option.querySelector(".qizhi-select-popup__check .qizhi-checkbox-mask")).not.toBeNull();
    await user.click(option);
    expect(onChange).toHaveBeenLastCalledWith(["research"], [tagOptions[0]]);
    expect(screen.getByText("标签：research")).toBeInTheDocument();
  });

  it("reuses Select keyboard navigation, selected ARIA, and focus restoration", async () => {
    const user = userEvent.setup();
    render(<FilterSelect mode="multiple" label="标签" options={tagOptions} defaultValue={["research"]} aria-label="标签筛选" />);
    const input = screen.getByRole("combobox", { name: "标签筛选" });
    await user.click(input);
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getByRole("option", { name: "research" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}{Enter}{Escape}");
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the selected summary while loading", () => {
    render(<FilterSelect searchable loading label="所有者" defaultValue="enterprise" options={ownerOptions} aria-label="所有者筛选" />);
    expect(screen.getByText("所有者：企业管理员")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "所有者筛选" })).toHaveAccessibleDescription("所有者：企业管理员");
  });

  it("does not render a search placeholder beside the retained summary", async () => {
    const user = userEvent.setup();
    render(<FilterSelect searchable label="所有者" options={ownerOptions} placeholder="搜索所有者" aria-label="所有者筛选" />);
    const input = screen.getByRole("combobox", { name: "所有者筛选" });

    expect(screen.getByText("所有者：全部")).toBeInTheDocument();
    expect(input).not.toHaveAttribute("placeholder");

    await user.click(input);
    expect(screen.getByText("所有者：全部")).toBeInTheDocument();
    expect(input).not.toHaveAttribute("placeholder");
  });

  it("filters locally and supports a custom filter predicate", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<FilterSelect searchable label="所有者" options={ownerOptions} aria-label="所有者筛选" />);
    const input = screen.getByRole("combobox", { name: "所有者筛选" });
    await user.click(input);
    await user.type(input, "enterprise");
    expect(screen.getByRole("option", { name: "企业管理员" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "研究团队管理员" })).not.toBeInTheDocument();

    rerender(<FilterSelect searchable label="所有者" options={ownerOptions} filterOption={(_, option) => option.value === "research"} aria-label="所有者筛选" />);
    expect(screen.queryByRole("option", { name: "企业管理员" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "研究团队管理员" })).toBeInTheDocument();
  });

  it("keeps all remote options and retains the selected summary while searching", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<FilterSelect
      searchable
      label="所有者"
      defaultValue="enterprise"
      options={ownerOptions}
      filterOption={false}
      onSearch={onSearch}
      aria-label="所有者筛选"
    />);
    const input = screen.getByRole("combobox", { name: "所有者筛选" });
    await user.click(input);
    await user.type(input, "xyz");
    expect(onSearch).toHaveBeenLastCalledWith("xyz");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByText("所有者：企业管理员")).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription("所有者：企业管理员");
  });

  it("allows search text to replace the summary only when retention is disabled", async () => {
    const user = userEvent.setup();
    render(<FilterSelect searchable retainDisplayValueWhenOpen={false} label="所有者" defaultValue="enterprise" options={ownerOptions} aria-label="所有者筛选" />);
    const input = screen.getByRole("combobox", { name: "所有者筛选" });
    await user.click(input);
    await user.type(input, "研究");
    expect(screen.queryByText("所有者：企业管理员")).not.toBeInTheDocument();
    expect(input).toHaveValue("研究");
  });

  it("warns for a non-text label without an explicit accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rerender } = render(<FilterSelect label={<span>所有者</span>} options={ownerOptions} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("aria-label"));

    warn.mockClear();
    rerender(<FilterSelect label={<span>所有者</span>} options={ownerOptions} aria-label="所有者筛选" />);
    expect(screen.getByRole("combobox", { name: "所有者筛选" })).toBeInTheDocument();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
