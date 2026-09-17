import { describe, expect, test } from "vitest";
import {
  filterPaths,
  findPathByValue,
  flattenLeafPaths,
  normalizeOptions,
  normalizeSelection,
} from "./cascaderModel";

const customOptions = [
  {
    name: "上海",
    code: "sh",
    nodes: [{ name: "黄浦", code: "hp", leaf: true }],
  },
];

describe("cascaderModel", () => {
  test("normalizes custom fields without mutating source options", () => {
    const before = structuredClone(customOptions);
    const normalized = normalizeOptions(customOptions, {
      label: "name",
      value: "code",
      children: "nodes",
      isLeaf: "leaf",
    });

    expect(normalized[0].children?.[0].path).toEqual(["sh", "hp"]);
    expect(customOptions).toEqual(before);
  });

  test("flattens and filters complete leaf paths", () => {
    const normalized = normalizeOptions(customOptions, {
      label: "name",
      value: "code",
      children: "nodes",
      isLeaf: "leaf",
    });
    const paths = flattenLeafPaths(normalized);

    expect(paths.map((item) => item.valuePath)).toEqual([["sh", "hp"]]);
    expect(filterPaths(paths, "黄浦")).toHaveLength(1);
    expect(filterPaths(paths, "不存在")).toEqual([]);
  });

  test("finds an exact option path and rejects a partial mismatch", () => {
    const normalized = normalizeOptions(customOptions, {
      label: "name",
      value: "code",
      children: "nodes",
    });

    expect(findPathByValue(normalized, ["sh", "hp"])?.map((item) => item.value)).toEqual(["sh", "hp"]);
    expect(findPathByValue(normalized, ["sh", "missing"])).toBeUndefined();
  });

  test("deduplicates selections and applies parent display strategy", () => {
    const paths = [["sh"], ["sh", "hp"], ["sh", "hp"]];

    expect(normalizeSelection(paths, "all")).toEqual([["sh"], ["sh", "hp"]]);
    expect(normalizeSelection(paths, "parent")).toEqual([["sh"]]);
  });
});

