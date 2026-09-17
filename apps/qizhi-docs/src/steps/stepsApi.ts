import type { StepsProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type StepsApiItem = ComponentApiItem<keyof StepsProps>;

export const stepsApi = [
  {
    name: "items",
    description: "步骤标题和可选描述。",
    type: "readonly StepsItem[]",
    defaultValue: "—",
  },
  {
    name: "current",
    description: "当前步骤，从 1 开始计数。",
    type: "number",
    defaultValue: "1",
  },
  {
    name: "size",
    description: "步骤条尺寸。",
    type: '"default" | "small"',
    defaultValue: '"default"',
  },
  {
    name: "status",
    description: "当前步骤状态。",
    type: '"process" | "error"',
    defaultValue: '"process"',
  },
  {
    name: "className",
    description: "根列表元素的类名。",
    type: "string",
    defaultValue: "—",
  },
  {
    name: "style",
    description: "根列表元素的内联样式。",
    type: "CSSProperties",
    defaultValue: "—",
  },
  {
    name: "ref",
    description: "指向根 HTMLOListElement。",
    type: "Ref<HTMLOListElement>",
    defaultValue: "—",
  },
] as const satisfies readonly StepsApiItem[];
