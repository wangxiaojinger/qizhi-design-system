import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TreeSelect } from "./TreeSelect";
import type { TreeSelectOption } from "./TreeSelect.types";

const treeData: TreeSelectOption[] = [
  {
    label: "主干",
    value: "trunk",
    children: [
      { label: "叶子一", value: "leaf-1" },
      { label: "叶子二", value: "leaf-2" },
    ],
  },
  { label: "远程节点", value: "remote", isLeaf: false },
];

describe("TreeSelect", () => {
  it("opens a tree popup, selects one node, and clears it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TreeSelect
        treeData={treeData}
        allowClear
        onChange={onChange}
        aria-label="选择节点"
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "选择节点" });
    await user.click(trigger);
    const tree = screen.getByRole("tree");
    expect(tree).toHaveClass(
      "qizhi-dropdown__menu",
      "qizhi-tree",
      "qizhi-tree-select__tree",
      "qizhi-tree-size-default",
    );
    expect(tree).not.toHaveClass("tree-demo__tree");
    expect(screen.getByRole("treeitem", { name: "主干" }))
      .toHaveClass("qizhi-tree-node", "qizhi-tree-node-expanded");
    expect(screen.getByRole("button", { name: "收起主干" }))
      .toHaveClass(
        "qizhi-tree-node-switcher",
        "qizhi-tree-node-switcher-expanded",
      );
    expect(screen.getByRole("button", { name: "选择主干" }))
      .toHaveClass("qizhi-tree-node-title");

    await user.click(screen.getByRole("treeitem", { name: "叶子一" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("叶子一")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith("leaf-1", treeData[0].children?.[0]);

    await user.click(screen.getByRole("button", { name: "清空选择" }));
    expect(onChange).toHaveBeenLastCalledWith(undefined, undefined);
    expect(screen.getByText("请选择")).toBeInTheDocument();
  });

  it("keeps the popup open and renders QIZHI tags in multiple mode", async () => {
    const user = userEvent.setup();
    render(
      <TreeSelect
        multiple
        treeData={treeData}
        aria-label="选择多个节点"
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "选择多个节点" }));
    await user.click(screen.getByRole("treeitem", { name: "叶子一" }));

    expect(screen.getByRole("tree")).toBeInTheDocument();
    expect(
      screen.getByText("叶子一", { selector: ".qizhi-tag-content" })
        .closest(".qizhi-tag"),
    ).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "选择 叶子一" })).toBeChecked();
  });

  it("keeps the selected single node title visually neutral like legacy", async () => {
    const user = userEvent.setup();
    render(
      <TreeSelect
        treeData={treeData}
        defaultValue="trunk"
        aria-label="已有选择"
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "已有选择" }));
    const selected = screen.getByRole("treeitem", { name: "主干" });
    expect(selected).toHaveAttribute("aria-selected", "true");
    expect(selected).not.toHaveClass("qizhi-tree-node-selected");
  });

  it("filters locally and reports every search term", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <TreeSelect
        treeData={treeData}
        showSearch
        onSearch={onSearch}
        aria-label="搜索节点"
      />,
    );

    const input = screen.getByRole("combobox", { name: "搜索节点" });
    await user.type(input, "叶子二");

    expect(input.closest(".qizhi-tree-select")
      ?.querySelector(".qizhi-tree-select__suffix"))
      .toHaveClass("qizhi-tree-select__suffix--search");
    expect(onSearch).toHaveBeenLastCalledWith("叶子二");
    expect(screen.getByRole("treeitem", { name: "叶子二" })).toBeInTheDocument();
    expect(screen.queryByRole("treeitem", { name: "叶子一" })).not.toBeInTheDocument();
  });

  it("switches from arrow to search only while search is active", async () => {
    const user = userEvent.setup();
    render(
      <TreeSelect
        treeData={treeData}
        showSearch
        aria-label="切换搜索图标"
      />,
    );

    const input = screen.getByRole("combobox", { name: "切换搜索图标" });
    const root = input.closest(".qizhi-tree-select");
    expect(root?.querySelector(".qizhi-tree-select__suffix"))
      .toHaveClass("qizhi-tree-select__suffix--arrow");
    expect(root?.querySelector(".qizhi-tree-select__suffix svg"))
      .toHaveAttribute("viewBox", "1.6 1.6 12.8 12.8");

    await user.click(input);
    expect(root?.querySelector(".qizhi-tree-select__suffix"))
      .toHaveClass("qizhi-tree-select__suffix--search");

    await user.keyboard("{Escape}");
    expect(root?.querySelector(".qizhi-tree-select__suffix"))
      .toHaveClass("qizhi-tree-select__suffix--arrow");
  });

  it("loads lazy children once and exposes a loading state", async () => {
    const user = userEvent.setup();
    let resolveChildren: ((value: readonly TreeSelectOption[]) => void) | undefined;
    const loadMore = vi.fn(
      () => new Promise<readonly TreeSelectOption[]>((resolve) => {
        resolveChildren = resolve;
      }),
    );
    render(
      <TreeSelect
        treeData={treeData}
        loadMore={loadMore}
        aria-label="异步节点"
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "异步节点" }));
    await user.click(screen.getByRole("button", { name: "展开远程节点" }));

    expect(screen.getByText("正在加载")).toBeInTheDocument();
    expect(loadMore).toHaveBeenCalledWith(treeData[1]);

    await act(async () => {
      resolveChildren?.([{ label: "加载完成", value: "loaded" }]);
    });
    await waitFor(() => {
      expect(screen.getByRole("treeitem", { name: "加载完成" }))
        .toBeInTheDocument();
    });
    await user.keyboard("{Escape}");
    expect(screen.getByRole("combobox", { name: "异步节点" }))
      .toHaveAttribute("aria-expanded", "false");
  });

  it("supports keyboard open and escape close", async () => {
    const user = userEvent.setup();
    render(<TreeSelect treeData={treeData} aria-label="键盘选择" />);

    const trigger = screen.getByRole("combobox", { name: "键盘选择" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes with Escape while focus is inside the popup", async () => {
    const user = userEvent.setup();
    render(<TreeSelect treeData={treeData} aria-label="浮层键盘选择" />);

    const trigger = screen.getByRole("combobox", {
      name: "浮层键盘选择",
    });
    await user.click(trigger);
    screen.getByRole("button", { name: "收起主干" }).focus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
