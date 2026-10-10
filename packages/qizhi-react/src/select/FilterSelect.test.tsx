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
  });
});
