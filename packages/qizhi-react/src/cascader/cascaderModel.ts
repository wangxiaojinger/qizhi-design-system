import type { ReactNode } from "react";
import type {
  CascaderCheckedStrategy,
  CascaderFieldNames,
  CascaderOption,
  CascaderPathValue,
  CascaderRawValue,
} from "./Cascader.types";

export interface NormalizedCascaderOption {
  id: string;
  label: ReactNode;
  value: CascaderRawValue;
  path: CascaderPathValue;
  source: CascaderOption;
  sourcePath: CascaderOption[];
  disabled: boolean;
  isLeaf: boolean;
  children?: NormalizedCascaderOption[];
}

export interface CascaderFlatPath {
  valuePath: CascaderPathValue;
  optionPath: CascaderOption[];
  labels: ReactNode[];
  searchText: string;
}

const defaults = {
  label: "label",
  value: "value",
  children: "children",
  disabled: "disabled",
  isLeaf: "isLeaf",
} as const;

const pathKey = (path: CascaderPathValue) => JSON.stringify(path);

const readText = (value: ReactNode) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

export function normalizeOptions(
  options: CascaderOption[],
  fieldNames: CascaderFieldNames = {},
  parentPath: CascaderPathValue = [],
  parentSources: CascaderOption[] = [],
): NormalizedCascaderOption[] {
  const fields = { ...defaults, ...fieldNames };
  const siblingValues = new Set<CascaderRawValue>();

  return options.flatMap((source, index) => {
    const value = source[fields.value];
    if (typeof value !== "string" && typeof value !== "number") {
      if (import.meta.env?.DEV) console.warn(`QIZHI Cascader: option ${index} is missing a string or number value.`);
      return [];
    }
    if (siblingValues.has(value) && import.meta.env?.DEV) {
      console.warn(`QIZHI Cascader: duplicate sibling value ${String(value)}.`);
    }
    siblingValues.add(value);

    const path = [...parentPath, value];
    const sourcePath = [...parentSources, source];
    const rawChildren = source[fields.children];
    const children = Array.isArray(rawChildren)
      ? normalizeOptions(rawChildren as CascaderOption[], fieldNames, path, sourcePath)
      : undefined;
    return [{
      id: `qizhi-cascader-option-${path.map(String).join("-")}`,
      label: source[fields.label] as ReactNode,
      value,
      path,
      source,
      sourcePath,
      disabled: Boolean(source[fields.disabled]),
      isLeaf: source[fields.isLeaf] === false ? false : Boolean(source[fields.isLeaf]) || !children?.length,
      children,
    }];
  });
}

export function flattenLeafPaths(
  options: NormalizedCascaderOption[],
  parentLabels: ReactNode[] = [],
): CascaderFlatPath[] {
  return options.flatMap((option) => {
    const labels = [...parentLabels, option.label];
    return option.children?.length
    ? flattenLeafPaths(option.children, labels)
    : [{
        valuePath: option.path,
        optionPath: option.sourcePath,
        labels,
        searchText: labels.map(readText).join(" / ").toLowerCase(),
      }];
  });
}

export function filterPaths(
  paths: CascaderFlatPath[],
  input: string,
  filterOption?: (input: string, optionPath: CascaderOption[]) => boolean,
) {
  const query = input.trim().toLowerCase();
  if (!query) return paths;
  return paths.filter((path) => filterOption
    ? filterOption(input, path.optionPath)
    : path.searchText.includes(query));
}

export function findPathByValue(
  options: NormalizedCascaderOption[],
  valuePath: CascaderPathValue,
): NormalizedCascaderOption[] | undefined {
  const found: NormalizedCascaderOption[] = [];
  let level = options;
  for (const value of valuePath) {
    const option = level.find((candidate) => candidate.value === value);
    if (!option) return undefined;
    found.push(option);
    level = option.children ?? [];
  }
  return found;
}

export function normalizeSelection(
  paths: CascaderPathValue[],
  strategy: CascaderCheckedStrategy = "all",
) {
  const unique = paths.filter((path, index) => paths.findIndex((candidate) => pathKey(candidate) === pathKey(path)) === index);
  if (strategy === "all") return unique;
  return unique.filter((path) => !unique.some((candidate) =>
    candidate.length < path.length && candidate.every((value, index) => value === path[index])));
}
