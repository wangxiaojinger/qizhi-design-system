import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Cascader } from "./Cascader";
import type { CascaderOption } from "./Cascader.types";

const cityOptions: CascaderOption[] = [
  {
    label: "上海",
    value: "sh",
    children: [
      { label: "黄浦", value: "hp", isLeaf: true },
      { label: "徐汇", value: "xh", disabled: true, isLeaf: true },
    ],
  },
  {
    label: "北京",
    value: "bj",
    children: [{ label: "朝阳", value: "cy", isLeaf: true }],
  },
];

describe("Cascader", () => {
  test("uses the shared Chinese placeholder without decorative ellipsis", () => {
    render(<Cascader options={cityOptions} />);

    expect(screen.getByRole("combobox")).toHaveAttribute("placeholder", "请选择");
  });

  test("supports the legacy mini size", () => {
    render(<Cascader options={cityOptions} size="mini" />);

    expect(screen.getByRole("combobox").closest(".qizhi-cascader")).toHaveClass("qizhi-cascader--mini");
  });

  test("opens a portal and selects a complete single path", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Cascader options={cityOptions} aria-label="请选择城市" onChange={onChange} />);
    const input = screen.getByRole("combobox", { name: "请选择城市" });

    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.click(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBe(document.body.querySelector('[role="listbox"]'));
    expect(screen.getByRole("listbox")).toHaveClass("qizhi-dropdown__menu");
    expect(screen.getByRole("option", { name: "上海" })).toHaveClass("qizhi-dropdown__item");
    await user.click(screen.getByRole("option", { name: "上海" }));
    await user.click(screen.getByRole("option", { name: "黄浦" }));

    expect(onChange).toHaveBeenCalledWith(["sh", "hp"], [cityOptions[0], cityOptions[0].children?.[0]]);
    expect(input).toHaveValue("上海 / 黄浦");
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  test("hover expansion waits for a click before selecting the leaf option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Cascader
        options={cityOptions}
        expandTrigger="hover"
        aria-label="悬停展开城市"
        onChange={onChange}
      />,
    );
    const input = screen.getByRole("combobox", { name: "悬停展开城市" });

    await user.hover(input);
    await user.hover(screen.getByRole("option", { name: "上海" }));
    const leaf = screen.getByRole("option", { name: "黄浦" });
    await user.hover(leaf);

    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveAttribute("aria-expanded", "true");

    await user.click(leaf);
    expect(onChange).toHaveBeenCalledWith(["sh", "hp"], [cityOptions[0], cityOptions[0].children?.[0]]);
    expect(input).toHaveValue("上海 / 黄浦");
  });

  test("supports keyboard opening, navigation and Escape focus restoration", async () => {
    const user = userEvent.setup();
    render(<Cascader options={cityOptions} aria-label="键盘级联选择" />);
    const input = screen.getByRole("combobox", { name: "键盘级联选择" });

    await user.click(input);
    await user.keyboard("{ArrowDown}{ArrowRight}{Escape}");

    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveFocus();
  });

  test("formats and clears an uncontrolled value without losing focus", async () => {
    const user = userEvent.setup();
    render(
      <Cascader
        options={cityOptions}
        defaultValue={["sh", "hp"]}
        allowClear
        addBefore="选择城市"
        renderFormat={(labels) => labels.join(" > ")}
      />,
    );

    expect(screen.getByDisplayValue("上海 > 黄浦")).toBeInTheDocument();
    expect(screen.getByText("选择城市")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "清除" }));
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  test("renders a custom trigger with the complete combobox contract", async () => {
    const user = userEvent.setup();
    render(<Cascader options={cityOptions} aria-label="选择区域" trigger={(props) => <button {...props}>选择区域</button>} />);
    const trigger = screen.getByRole("combobox", { name: "选择区域" });

    expect(trigger.closest(".qizhi-cascader")).toHaveClass("qizhi-cascader--custom-trigger");
    expect(trigger).toHaveAttribute("aria-controls");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("renders multiple values as tags and keeps the popup open after selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Cascader
        mode="multiple"
        options={cityOptions}
        defaultValue={[["sh", "hp"]]}
        allowClear
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("listitem", { name: "上海 / 黄浦" })).toBeInTheDocument();
    expect(screen.getByRole("combobox").closest(".qizhi-cascader")).toHaveClass("qizhi-cascader--has-tags");
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "北京" }));
    await user.click(screen.getByRole("option", { name: "朝阳" }));

    expect(onChange).toHaveBeenLastCalledWith(
      [["sh", "hp"], ["bj", "cy"]],
      expect.any(Array),
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
  });

  test("searches complete paths and applies a custom filter", async () => {
    const user = userEvent.setup();
    render(
      <Cascader
        options={cityOptions}
        showSearch
        filterOption={(input, path) => path.some((option) => option.value === input)}
      />,
    );
    const input = screen.getByRole("combobox");

    await user.type(input, "hp");
    expect(screen.getByRole("option", { name: "上海 / 黄浦" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "北京 / 朝阳" })).not.toBeInTheDocument();
  });

  test("deduplicates lazy requests and permits retry after rejection", async () => {
    const user = userEvent.setup();
    const loadMore = vi.fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(undefined);
    const lazyOptions: CascaderOption[] = [{ label: "浙江", value: "zj", isLeaf: false }];
    render(<Cascader options={lazyOptions} loadMore={loadMore} />);

    await user.click(screen.getByRole("combobox"));
    const option = screen.getByRole("option", { name: "浙江" });
    await user.click(option);
    await waitFor(() => expect(option).not.toHaveAttribute("aria-busy", "true"));
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
    await user.click(option);

    expect(loadMore).toHaveBeenCalledTimes(2);
  });
});
