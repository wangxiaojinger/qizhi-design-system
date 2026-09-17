import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import LabelInValueDemo from "./demos/LabelInValueDemo";
import labelInValueSource from "./demos/LabelInValueDemo.tsx?raw";
import RenderFormatDemo from "./demos/RenderFormatDemo";
import renderFormatSource from "./demos/RenderFormatDemo.tsx?raw";
import AddBeforeDemo from "./demos/AddBeforeDemo";
import addBeforeSource from "./demos/AddBeforeDemo.tsx?raw";
import TreeDataDemo from "./demos/TreeDataDemo";
import treeDataSource from "./demos/TreeDataDemo.tsx?raw";
import ControlledDemo from "./demos/ControlledDemo";
import controlledSource from "./demos/ControlledDemo.tsx?raw";
import LazyLoadDemo from "./demos/LazyLoadDemo";
import lazyLoadSource from "./demos/LazyLoadDemo.tsx?raw";
import SearchDemo from "./demos/SearchDemo";
import searchSource from "./demos/SearchDemo.tsx?raw";
import RemoteSearchDemo from "./demos/RemoteSearchDemo";
import remoteSearchSource from "./demos/RemoteSearchDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";

export interface TreeSelectDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const treeSelectDemos: readonly TreeSelectDemoDefinition[] = [
  {
    id: "树选择-基础用法",
    title: "基础用法",
    description: "最简单的用法。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "树选择-设置-value-格式",
    title: "设置 value 格式",
    description:
      "labelInValue 为 true 时，value 格式为：" +
      "{ label: string, value: string }。",
    component: LabelInValueDemo,
    source: labelInValueSource,
  },
  {
    id: "树选择-自定义渲染",
    title: "自定义渲染",
    description: "单选下通过 renderFormat 可自定义渲染展示。",
    component: RenderFormatDemo,
    source: renderFormatSource,
  },
  {
    id: "树选择-前置标签",
    title: "前置标签",
    description: "通过 addBefore 设置前置标签（2.41.0）。",
    component: AddBeforeDemo,
    source: addBeforeSource,
  },
  {
    id: "树选择-通过数据生成树结构",
    title: "通过数据生成树结构",
    description: "通过传入 treeData 数据生成树结构。",
    component: TreeDataDemo,
    source: treeDataSource,
  },
  {
    id: "树选择-受控模式",
    title: "受控模式",
    description: "受控模式。",
    component: ControlledDemo,
    source: controlledSource,
  },
  {
    id: "树选择-动态加载",
    title: "动态加载",
    description:
      "可以通过 loadMore 进行动态加载。" +
      "此时可设置 isLeaf 来标示叶子节点。",
    component: LazyLoadDemo,
    source: lazyLoadSource,
  },
  {
    id: "树选择-搜索",
    title: "搜索",
    description:
      "设置 showSearch=true 启用搜索功能。" +
      "动态加载时候只能在已加载数据中进行搜索。" +
      "默认的关键字搜索是从 value 字段匹配。" +
      "也可以传入 filterTreeNode 自定义过滤方式。",
    component: SearchDemo,
    source: searchSource,
  },
  {
    id: "树选择-远程搜索",
    title: "远程搜索",
    description:
      "当传入 onSearch 为函数时，启用自定义搜索，" +
      "可以从远程加载数据。",
    component: RemoteSearchDemo,
    source: remoteSearchSource,
  },
  {
    id: "树选择-不同尺寸",
    title: "不同尺寸",
    description:
      "设置 size 可以使用三种尺寸的选择器。" +
      "高度分别对应 32px、36px、40px。",
    component: SizeDemo,
    source: sizeSource,
  },
];
