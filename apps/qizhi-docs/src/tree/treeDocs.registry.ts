import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import BlockDemo from "./demos/BlockDemo";
import blockSource from "./demos/BlockDemo.tsx?raw";
import TreeDataDemo from "./demos/TreeDataDemo";
import treeDataSource from "./demos/TreeDataDemo.tsx?raw";
import MultipleDemo from "./demos/MultipleDemo";
import multipleSource from "./demos/MultipleDemo.tsx?raw";
import CheckableDemo from "./demos/CheckableDemo";
import checkableSource from "./demos/CheckableDemo.tsx?raw";
import ControlledDemo from "./demos/ControlledDemo";
import controlledSource from "./demos/ControlledDemo.tsx?raw";
import LazyDemo from "./demos/LazyDemo";
import lazySource from "./demos/LazyDemo.tsx?raw";
import DragDemo from "./demos/DragDemo";
import dragSource from "./demos/DragDemo.tsx?raw";
import StrategyDemo from "./demos/StrategyDemo";
import strategySource from "./demos/StrategyDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import IconDemo from "./demos/IconDemo";
import iconSource from "./demos/IconDemo.tsx?raw";
import SearchDemo from "./demos/SearchDemo";
import searchSource from "./demos/SearchDemo.tsx?raw";
import FieldNamesDemo from "./demos/FieldNamesDemo";
import fieldNamesSource from "./demos/FieldNamesDemo.tsx?raw";

export interface TreeDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const treeDemos: readonly TreeDemoDefinition[] = [
  {
    id: "树-基础用法",
    title: "基础用法",
    description:
      "为每个 TreeNode 节点赋予全局唯一的 key（必填项），title 为该节点显示的内容。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "树-节点占一行",
    title: "节点占一行",
    description: "节点占据一整行。",
    component: BlockDemo,
    source: blockSource,
  },
  {
    id: "树-由treeData直接生成",
    title: "由 treeData 直接生成",
    description: "",
    component: TreeDataDemo,
    source: treeDataSource,
  },
  {
    id: "树-多选",
    title: "多选",
    description: "Tree 设置 multiple 属性为 true，可以启用多选。",
    component: MultipleDemo,
    source: multipleSource,
  },
  {
    id: "树-带复选框的树",
    title: "带复选框的树",
    description:
      "为 Tree 添加 checkable 属性即可使树具有复选框功能，可以用 defaultCheckedKeys 指定复选框默认选中的节点。",
    component: CheckableDemo,
    source: checkableSource,
  },
  {
    id: "树-受控模式",
    title: "受控模式",
    description:
      "可以指定树的 selectedKeys 或 checkedKeys 或 expandedKeys 属性使树变为受控模式，在对应的 onSelect / onCheck / onExpand 回调中对返回值进行操作。",
    component: ControlledDemo,
    source: controlledSource,
  },
  {
    id: "动态加载",
    title: "动态加载",
    description: "动态加载节点。",
    component: LazyDemo,
    source: lazySource,
  },
  {
    id: "拖拽",
    title: "拖拽",
    description: "可拖拽的树节点。",
    component: DragDemo,
    source: dragSource,
  },
  {
    id: "设置回填方式",
    title: "设置回填方式",
    description: "为 Tree 添加 checkedStrategy 可以设置选中时的回填方式。",
    component: StrategyDemo,
    source: strategySource,
  },
  {
    id: "不同尺寸",
    title: "不同尺寸",
    description: "",
    component: SizeDemo,
    source: sizeSource,
  },
  {
    id: "定制节点图标",
    title: "定制节点图标",
    description: "只需为 TreeNode 指定 icon 属性的值即可为任意节点指定任意图标。",
    component: IconDemo,
    source: iconSource,
  },
  {
    id: "搜索树",
    title: "搜索树",
    description: "",
    component: SearchDemo,
    source: searchSource,
  },
  {
    id: "自定义-TreeData-的字段名称",
    title: "自定义 TreeData 的字段名称",
    description: "通过 fieldNames 字段可以自定义 TreeData 的字段名。",
    component: FieldNamesDemo,
    source: fieldNamesSource,
  },
];
