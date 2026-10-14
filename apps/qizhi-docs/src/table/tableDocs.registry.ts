import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo"; import basicSource from "./demos/BasicDemo.tsx?raw";
import ContentDemo from "./demos/ContentDemo"; import contentSource from "./demos/ContentDemo.tsx?raw";
import SortDemo from "./demos/SortDemo"; import sortSource from "./demos/SortDemo.tsx?raw";
import FixedDemo from "./demos/FixedDemo"; import fixedSource from "./demos/FixedDemo.tsx?raw";
import SelectionDemo from "./demos/SelectionDemo"; import selectionSource from "./demos/SelectionDemo.tsx?raw";
import ExpandDemo from "./demos/ExpandDemo"; import expandSource from "./demos/ExpandDemo.tsx?raw";
import NestedDemo from "./demos/NestedDemo"; import nestedSource from "./demos/NestedDemo.tsx?raw";
import TreeDemo from "./demos/TreeDemo"; import treeSource from "./demos/TreeDemo.tsx?raw";
import PropsDemo from "./demos/PropsDemo"; import propsSource from "./demos/PropsDemo.tsx?raw";
import MergeDemo from "./demos/MergeDemo"; import mergeSource from "./demos/MergeDemo.tsx?raw";
import DragDemo from "./demos/DragDemo"; import dragSource from "./demos/DragDemo.tsx?raw";
import LayoutDemo from "./demos/LayoutDemo"; import layoutSource from "./demos/LayoutDemo.tsx?raw";

export interface TableDemoDefinition { id: string; title: string; description: string; component: ComponentType; source: string }
export const tableDemos: readonly TableDemoDefinition[] = [
  { id: "table-basic", title: "基础用法", description: "使用完整的 TypeScript 数据和列定义，在单元格中组合链接、标签与操作。", component: BasicDemo, source: basicSource },
  { id: "table-content", title: "多行与省略", description: "单元格默认允许文本自然换行，行高随内容撑开。列设置 ellipsis 后保持单行省略，并可以通过 showTitle 控制原生提示。", component: ContentDemo, source: contentSource },
  { id: "table-sort", title: "排序", description: "通过 sorter、sortDirections 与 defaultSortOrder 配置排序，并可控制排序提示作用于完整表头或仅排序图标。", component: SortDemo, source: sortSource },
  { id: "table-fixed", title: "固定列", description: "当表格横向内容较多时，可以固定关键列，保持主要识别信息和操作入口可见。", component: FixedDemo, source: fixedSource },
  { id: "table-selection", title: "开启选择", description: "表格开启选择，可以设置 rowSelection.type 来使用复选框和单选框。checkbox 为复选框，radio 为单选框。", component: SelectionDemo, source: selectionSource },
  { id: "table-expand", title: "展开行", description: "当内容过长，可以通过 expandedRowRender 设置展开行。如果返回值是 null，不会渲染展开按钮。", component: ExpandDemo, source: expandSource },
  { id: "table-nested", title: "嵌套子表格", description: "嵌套子表格的例子，点击展开按钮可以在展开区域展示子表格。", component: NestedDemo, source: nestedSource },
  { id: "table-tree", title: "树形数据展示", description: "树形数据展示的例子，data 里有 children 字段，或者通过 childrenColumnName 设置成自定义字段。", component: TreeDemo, source: treeSource },
  { id: "table-props", title: "表格属性", description: "在这里，可以统一查看表格常用属性。表格尺寸通过上下内边距控制：默认 16px、中等 12px、小 8px。", component: PropsDemo, source: propsSource },
  { id: "table-merge", title: "单元格合并", description: "用于单元格合并，表头可以进行列合并，内容区域可以通过 rowSpan 与 colSpan 合并单元格。", component: MergeDemo, source: mergeSource },
  { id: "table-drag", title: "拖拽排序", description: "拖动表格行可以调整数据顺序，适合手动编排优先级或展示顺序。", component: DragDemo, source: dragSource },
  { id: "table-layout", title: "列宽与自适应", description: "通过列级最小/最大宽度、grow、对齐和布局模式控制剩余空间；支持紧凑布局、原生自动布局、隐藏表头和同侧多个固定列。", component: LayoutDemo, source: layoutSource },
];
