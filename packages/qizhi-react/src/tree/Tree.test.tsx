import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tree } from "./Tree";
import type { TreeNodeData } from "./Tree.types";

const treeData: TreeNodeData[] = [
  {
    key: "root",
    title: "主干",
    children: [
      { key: "leaf-1", title: "叶子一" },
      {
        key: "branch",
        title: "分支",
        children: [{ key: "leaf-2", title: "叶子二" }],
      },
    ],
  },
  { key: "disabled", title: "禁用节点", disabled: true },
];

describe("Tree", () => {
  it("keeps an unselectable branch expandable without firing selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Tree
        treeData={[
          {
            key: "branch",
            title: "不可选分支",
            selectable: false,
            children: [{ key: "leaf", title: "叶子" }],
          },
        ]}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole("button", { name: "选择不可选分支" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "展开不可选分支" }));
    expect(screen.getByText("叶子")).toBeVisible();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("exposes the public blockNode layout state", () => {
    render(<Tree treeData={treeData} blockNode />);
    expect(screen.getByRole("tree")).toHaveClass("qizhi-tree-block-node");
  });

  it("hides every ancestor guide line after its final sibling", () => {
    render(
      <Tree
        treeData={[
          {
            key: "first-root",
            title: "主干一",
            children: [
              {
                key: "last-branch",
                title: "末尾分支",
                children: [{ key: "nested-leaf", title: "嵌套叶子" }],
              },
            ],
          },
          {
            key: "last-root",
            title: "主干二",
            children: [{ key: "last-root-leaf", title: "末尾主干叶子" }],
          },
        ]}
        defaultExpandedKeys={["first-root", "last-branch", "last-root"]}
      />,
    );

    const nestedIndentBlocks = screen
      .getByRole("treeitem", { name: "嵌套叶子" })
      .querySelectorAll(".qizhi-tree__indent-block");
    expect(nestedIndentBlocks).toHaveLength(2);
    expect(nestedIndentBlocks[0]).not.toHaveClass(
      "qizhi-tree__indent-block--lineless",
    );
    expect(nestedIndentBlocks[1]).toHaveClass(
      "qizhi-tree__indent-block--lineless",
    );

    const finalRootIndent = screen
      .getByRole("treeitem", { name: "末尾主干叶子" })
      .querySelector(".qizhi-tree__indent-block");
    expect(finalRootIndent).toHaveClass(
      "qizhi-tree__indent-block--lineless",
    );
  });

  it("renders treeData with QIZHI tree semantics and expands branches", async () => {
    const user = userEvent.setup();
    render(
      <Tree
        treeData={treeData}
        defaultExpandedKeys={["root"]}
        aria-label="目录树"
      />,
    );

    const tree = screen.getByRole("tree", { name: "目录树" });
    expect(tree).toHaveClass("qizhi-tree", "qizhi-tree-size-default");
    expect(screen.getByText("叶子一")).toBeVisible();
    expect(screen.getByRole("treeitem", { name: "禁用节点" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    const expandedSwitcher = screen.getByRole("button", { name: "收起主干" });
    expect(expandedSwitcher.querySelector("svg")).toHaveClass(
      "qizhi-tree__switcher-icon--expanded",
    );
    expect(expandedSwitcher.querySelector("path")).toHaveAttribute(
      "d",
      "M8 10.6667L4 6.66666H12L8 10.6667Z",
    );

    await user.click(expandedSwitcher);
    expect(screen.queryByText("叶子一")).not.toBeInTheDocument();
    const collapsedSwitcher = screen.getByRole("button", { name: "展开主干" });
    expect(collapsedSwitcher.querySelector("svg")).toHaveClass(
      "qizhi-tree__switcher-icon--collapsed",
    );
    expect(collapsedSwitcher.querySelector("path")).toHaveAttribute(
      "d",
      "M10.6667 8L6.66666 12V4L10.6667 8Z",
    );
    await user.click(collapsedSwitcher);
    expect(screen.getByText("叶子一")).toBeVisible();
  });

  it("supports uncontrolled multiple selection and reports next keys", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Tree
        treeData={treeData}
        defaultExpandedKeys={["root"]}
        multiple
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "选择叶子一" }));
    await user.click(screen.getByRole("button", { name: "选择分支" }));
    expect(onSelect).toHaveBeenLastCalledWith(
      ["leaf-1", "branch"],
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByRole("treeitem", { name: "叶子一" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("keeps controlled selectedKeys unchanged until the parent updates", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Tree
        treeData={treeData}
        selectedKeys={["leaf-1"]}
        defaultExpandedKeys={["root"]}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "选择分支" }));
    expect(onSelect).toHaveBeenCalledWith(
      ["branch"],
      expect.objectContaining({
        node: expect.objectContaining({ key: "branch" }),
      }),
    );
    expect(screen.getByRole("treeitem", { name: "叶子一" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("treeitem", { name: "分支" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("links parent and child checks and supports checkedStrategy", async () => {
    const user = userEvent.setup();
    const onCheck = vi.fn();
    render(
      <Tree
        treeData={treeData}
        defaultExpandedKeys={["root", "branch"]}
        checkable
        checkedStrategy="child"
        onCheck={onCheck}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "勾选主干" }));
    expect(screen.getByRole("checkbox", { name: "勾选叶子一" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "勾选叶子二" })).toBeChecked();
    expect(onCheck).toHaveBeenLastCalledWith(
      ["leaf-1", "leaf-2"],
      expect.objectContaining({ checked: true }),
    );
  });

  it("keeps checks independent in checkStrictly mode", async () => {
    const user = userEvent.setup();
    render(
      <Tree
        treeData={treeData}
        defaultExpandedKeys={["root"]}
        checkable
        checkStrictly
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "勾选主干" }));
    expect(screen.getByRole("checkbox", { name: "勾选主干" })).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "勾选叶子一" }),
    ).not.toBeChecked();
  });

  it("loads children once when an unloaded branch expands", async () => {
    const user = userEvent.setup();
    let resolveLoad: ((children: TreeNodeData[]) => void) | undefined;
    const loadData = vi.fn(
      () =>
        new Promise<TreeNodeData[]>((resolve) => {
          resolveLoad = resolve;
        }),
    );
    render(
      <Tree
        treeData={[{ key: "remote", title: "异步主干", isLeaf: false }]}
        loadData={loadData}
      />,
    );

    await user.click(screen.getByRole("button", { name: "展开异步主干" }));
    expect(screen.getByRole("treeitem", { name: "异步主干" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    resolveLoad?.([{ key: "remote-leaf", title: "异步叶子", isLeaf: true }]);
    await waitFor(() => expect(screen.getByText("异步叶子")).toBeVisible());
    expect(loadData).toHaveBeenCalledTimes(1);
  });

  it("supports the tree keyboard navigation contract", async () => {
    const user = userEvent.setup();
    render(<Tree treeData={treeData} defaultExpandedKeys={["root"]} />);

    const root = screen.getByRole("treeitem", { name: "主干" });
    const firstLeaf = screen.getByRole("treeitem", { name: "叶子一" });
    root.focus();
    await user.keyboard("{ArrowDown}");
    expect(firstLeaf).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(firstLeaf).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Home}");
    expect(root).toHaveFocus();
  });

  it("emits an immutable root reorder after a valid drop", () => {
    const onDrop = vi.fn();
    render(<Tree treeData={treeData} draggable onDrop={onDrop} />);
    const source = screen.getByRole("treeitem", { name: "禁用节点" });
    const target = screen.getByRole("treeitem", { name: "主干" });
    const transfer = { setData: vi.fn(), getData: vi.fn() };

    fireEvent.dragStart(source, { dataTransfer: transfer });
    fireEvent.dragOver(target, { dataTransfer: transfer });
    fireEvent.drop(target, { dataTransfer: transfer });

    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({
        dragKey: "disabled",
        dropKey: "root",
        treeData: [
          expect.objectContaining({ key: "disabled" }),
          expect.objectContaining({ key: "root" }),
        ],
      }),
    );
  });
});
