import { describe, expect, it } from "vitest";
import {
  filterTreeSelectOptions,
  findTreeSelectOption,
  replaceTreeSelectChildren,
} from "./treeSelectModel";
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

describe("TreeSelect model", () => {
  it("keeps matching ancestors when local search finds a descendant", () => {
    expect(filterTreeSelectOptions(treeData, "叶子二")).toEqual([
      {
        label: "主干",
        value: "trunk",
        children: [{ label: "叶子二", value: "leaf-2" }],
      },
    ]);
  });

  it("returns the selected option and its full path", () => {
    expect(findTreeSelectOption(treeData, "leaf-1")).toEqual({
      option: { label: "叶子一", value: "leaf-1" },
      path: [treeData[0], treeData[0].children?.[0]],
    });
  });

  it("replaces lazy children without mutating the caller tree", () => {
    const next = replaceTreeSelectChildren(treeData, "remote", [
      { label: "已加载", value: "loaded" },
    ]);

    expect(next[1].children).toEqual([{ label: "已加载", value: "loaded" }]);
    expect(treeData[1].children).toBeUndefined();
    expect(next[0]).toBe(treeData[0]);
  });
});
