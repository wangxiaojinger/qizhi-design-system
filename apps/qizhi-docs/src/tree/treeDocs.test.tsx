import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TreeDocsIsland } from "./TreeDocsIsland";
import { treeApi } from "./treeApi";
import { treeDemos } from "./treeDocs.registry";

describe("Tree docs", () => {
  it("keeps the confirmed 13 legacy demos in order", () => {
    expect(treeDemos.map((demo) => demo.title)).toEqual([
      "基础用法",
      "节点占一行",
      "由 treeData 直接生成",
      "多选",
      "带复选框的树",
      "受控模式",
      "动态加载",
      "拖拽",
      "设置回填方式",
      "不同尺寸",
      "定制节点图标",
      "搜索树",
      "自定义 TreeData 的字段名称",
    ]);
  });

  it("preserves the exact legacy descriptions without inventing missing copy", () => {
    expect(treeDemos.map((demo) => demo.description)).toEqual([
      "为每个 TreeNode 节点赋予全局唯一的 key（必填项），title 为该节点显示的内容。",
      "节点占据一整行。",
      "",
      "Tree 设置 multiple 属性为 true，可以启用多选。",
      "为 Tree 添加 checkable 属性即可使树具有复选框功能，可以用 defaultCheckedKeys 指定复选框默认选中的节点。",
      "可以指定树的 selectedKeys 或 checkedKeys 或 expandedKeys 属性使树变为受控模式，在对应的 onSelect / onCheck / onExpand 回调中对返回值进行操作。",
      "动态加载节点。",
      "可拖拽的树节点。",
      "为 Tree 添加 checkedStrategy 可以设置选中时的回填方式。",
      "",
      "只需为 TreeNode 指定 icon 属性的值即可为任意节点指定任意图标。",
      "",
      "通过 fieldNames 字段可以自定义 TreeData 的字段名。",
    ]);
  });

  it("uses each raw TSX source as display and copy source", () => {
    treeDemos.forEach((demo) => {
      expect(demo.source).toContain("export default function");
      expect(demo.source).not.toContain("Demo.tsx");
      expect(demo.source).not.toContain("@arco-design");
    });
  });

  it("documents only the implemented Tree contract", () => {
    expect(treeApi.map((item) => item.name)).toEqual([
      "treeData",
      "fieldNames",
      "selectedKeys",
      "defaultSelectedKeys",
      "multiple",
      "blockNode",
      "onSelect",
      "expandedKeys",
      "defaultExpandedKeys",
      "onExpand",
      "checkable",
      "checkedKeys",
      "defaultCheckedKeys",
      "checkStrictly",
      "checkedStrategy",
      "onCheck",
      "loadData",
      "draggable",
      "onDrop",
      "size",
      "renderTitle",
      "className",
      "style",
    ]);
  });

  it("renders all demos and the API table", () => {
    const { container } = render(<TreeDocsIsland />);
    expect(screen.getAllByRole("article")).toHaveLength(13);
    expect(screen.getByRole("table", { name: "Tree API" })).toBeInTheDocument();

    const basic = container.querySelector("#树-基础用法");
    expect(
      [...(basic?.querySelectorAll('[role="treeitem"]') ?? [])].map((node) =>
        node.getAttribute("aria-label"),
      ),
    ).toEqual([
      "Trunk",
      "Branch 0-0-0",
      "Leaf",
      "Leaf",
      "Branch 0-0-1",
    ]);

    const treeData = container.querySelector("#树-由treeData直接生成");
    expect(
      [...(treeData?.querySelectorAll('[role="treeitem"]') ?? [])].map(
        (node) => node.getAttribute("aria-label"),
      ),
    ).toEqual([
      "Trunk 0-0",
      "Branch 0-0-2",
      "Leaf",
      "Leafsss 0-0-2",
      "Leaf",
      "Trunk 0-1",
      "Branch 0-1-1",
      "Leaf",
    ]);
  });
});
