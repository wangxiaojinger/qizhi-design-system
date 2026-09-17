import type { TreeProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type TreeApiItem = ComponentApiItem<keyof TreeProps>;

export const treeApi = [
  {
    name: "treeData",
    description: "树节点数据。",
    type: "readonly TreeNodeData[]",
    defaultValue: "—",
  },
  {
    name: "fieldNames",
    description: "自定义数据字段名称。",
    type: "TreeFieldNames",
    defaultValue: "—",
  },
  {
    name: "selectedKeys",
    description: "受控选中节点。",
    type: "readonly TreeKey[]",
    defaultValue: "—",
  },
  {
    name: "defaultSelectedKeys",
    description: "非受控初始选中节点。",
    type: "readonly TreeKey[]",
    defaultValue: "[]",
  },
  {
    name: "multiple",
    description: "允许选择多个节点。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "blockNode",
    description: "节点占据整行宽度。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "onSelect",
    description: "节点选择变化回调。",
    type: "(keys, info) => void",
    defaultValue: "—",
  },
  {
    name: "expandedKeys",
    description: "受控展开节点。",
    type: "readonly TreeKey[]",
    defaultValue: "—",
  },
  {
    name: "defaultExpandedKeys",
    description: "非受控初始展开节点。",
    type: "readonly TreeKey[]",
    defaultValue: "[]",
  },
  {
    name: "onExpand",
    description: "节点展开变化回调。",
    type: "(keys, info) => void",
    defaultValue: "—",
  },
  {
    name: "checkable",
    description: "显示节点复选框。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "checkedKeys",
    description: "受控勾选节点。",
    type: "readonly TreeKey[]",
    defaultValue: "—",
  },
  {
    name: "defaultCheckedKeys",
    description: "非受控初始勾选节点。",
    type: "readonly TreeKey[]",
    defaultValue: "[]",
  },
  {
    name: "checkStrictly",
    description: "取消父子节点勾选联动。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "checkedStrategy",
    description: "勾选结果回填方式。",
    type: '"all" | "parent" | "child"',
    defaultValue: '"all"',
  },
  {
    name: "onCheck",
    description: "节点勾选变化回调。",
    type: "(keys, info) => void",
    defaultValue: "—",
  },
  {
    name: "loadData",
    description: "异步加载子节点。",
    type: "(node) => Promise<TreeNodeData[] | void>",
    defaultValue: "—",
  },
  {
    name: "draggable",
    description: "允许拖拽节点。",
    type: "boolean",
    defaultValue: "false",
  },
  {
    name: "onDrop",
    description: "拖拽完成回调。",
    type: "(info) => void",
    defaultValue: "—",
  },
  {
    name: "size",
    description: "节点尺寸。",
    type: '"mini" | "small" | "default" | "large"',
    defaultValue: '"default"',
  },
  {
    name: "renderTitle",
    description: "自定义节点标题。",
    type: "(node) => ReactNode",
    defaultValue: "—",
  },
  {
    name: "className",
    description: "根节点类名。",
    type: "string",
    defaultValue: "—",
  },
  {
    name: "style",
    description: "根节点内联样式。",
    type: "CSSProperties",
    defaultValue: "—",
  },
] as const satisfies readonly TreeApiItem[];
