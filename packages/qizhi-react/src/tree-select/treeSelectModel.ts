import type {
  TreeSelectOption,
  TreeSelectRawValue,
  TreeSelectValue,
} from "./TreeSelect.types";

export interface TreeSelectMatch {
  option: TreeSelectOption;
  path: readonly TreeSelectOption[];
}

export function treeSelectBranchValues(
  options: readonly TreeSelectOption[],
): readonly TreeSelectRawValue[] {
  return options.flatMap((option) => [
    ...(option.children?.length ? [option.value] : []),
    ...treeSelectBranchValues(option.children ?? []),
  ]);
}

export function rawTreeSelectValue(value: TreeSelectValue): TreeSelectRawValue {
  return typeof value === "object" ? value.value : value;
}

export function findTreeSelectOption(
  options: readonly TreeSelectOption[],
  value: TreeSelectRawValue,
  ancestors: readonly TreeSelectOption[] = [],
): TreeSelectMatch | undefined {
  for (const option of options) {
    const path = [...ancestors, option];
    if (option.value === value) return { option, path };
    const childMatch = findTreeSelectOption(option.children ?? [], value, path);
    if (childMatch) return childMatch;
  }
  return undefined;
}

export function filterTreeSelectOptions(
  options: readonly TreeSelectOption[],
  query: string,
  filterOption: (
    input: string,
    option: TreeSelectOption,
  ) => boolean = (input, option) =>
    String(option.label).toLowerCase().includes(input.toLowerCase()) ||
    String(option.value).toLowerCase().includes(input.toLowerCase()),
): readonly TreeSelectOption[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return options;

  return options.flatMap((option) => {
    const children = filterTreeSelectOptions(
      option.children ?? [],
      normalizedQuery,
      filterOption,
    );
    if (!filterOption(normalizedQuery, option) && children.length === 0) {
      return [];
    }
    return [
      option.children === undefined
        ? option
        : { ...option, children },
    ];
  });
}

export function replaceTreeSelectChildren(
  options: readonly TreeSelectOption[],
  value: TreeSelectRawValue,
  children: readonly TreeSelectOption[],
): readonly TreeSelectOption[] {
  let changed = false;
  const nextOptions = options.map((option) => {
    if (option.value === value) {
      changed = true;
      return { ...option, children };
    }
    if (!option.children?.length) return option;
    const nextChildren = replaceTreeSelectChildren(
      option.children,
      value,
      children,
    );
    if (nextChildren === option.children) return option;
    changed = true;
    return { ...option, children: nextChildren };
  });
  return changed ? nextOptions : options;
}
