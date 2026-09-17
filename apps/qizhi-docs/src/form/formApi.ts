import type { FormItemProps, FormProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type FormApiItem = ComponentApiItem<keyof FormProps>;
type FormItemApiItem = ComponentApiItem<keyof FormItemProps>;

export const formApi = [
  { name: "layout", description: "设置表单项采用垂直排列或标签左置的水平排列；窄屏下水平布局回退为单列。", type: '"vertical" | "horizontal"', defaultValue: "vertical" },
  { name: "children", description: "表单内容，通常由 Form.Item 和操作控件组成。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "原生 form 根节点的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "原生 form 根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly FormApiItem[];

export const formItemApi = [
  { name: "label", description: "字段标签内容；未传入时不渲染标签节点。", type: "ReactNode", defaultValue: "—" },
  { name: "required", description: "显示必填标记并向字段组暴露必填语义，不执行校验。", type: "boolean", defaultValue: "false" },
  { name: "extra", description: "显示在主控件下方的辅助说明。", type: "ReactNode", defaultValue: "—" },
  { name: "children", description: "字段的主控件或控件组合。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "字段根节点的类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "字段根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly FormItemApiItem[];

