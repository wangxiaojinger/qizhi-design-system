import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import ClearDemo from "./demos/ClearDemo";
import clearSource from "./demos/ClearDemo.tsx?raw";
import AddBeforeDemo from "./demos/AddBeforeDemo";
import addBeforeSource from "./demos/AddBeforeDemo.tsx?raw";
import RenderFormatDemo from "./demos/RenderFormatDemo";
import renderFormatSource from "./demos/RenderFormatDemo.tsx?raw";
import CustomTriggerDemo from "./demos/CustomTriggerDemo";
import customTriggerSource from "./demos/CustomTriggerDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import FieldNamesDemo from "./demos/FieldNamesDemo";
import fieldNamesSource from "./demos/FieldNamesDemo.tsx?raw";
import DragSortDemo from "./demos/DragSortDemo";
import dragSortSource from "./demos/DragSortDemo.tsx?raw";
import ChangeOnSelectDemo from "./demos/ChangeOnSelectDemo";
import changeOnSelectSource from "./demos/ChangeOnSelectDemo.tsx?raw";
import MultipleDemo from "./demos/MultipleDemo";
import multipleSource from "./demos/MultipleDemo.tsx?raw";
import SearchDemo from "./demos/SearchDemo";
import searchSource from "./demos/SearchDemo.tsx?raw";
import CustomSearchDemo from "./demos/CustomSearchDemo";
import customSearchSource from "./demos/CustomSearchDemo.tsx?raw";
import LazyDemo from "./demos/LazyDemo";
import lazySource from "./demos/LazyDemo.tsx?raw";
import DisabledOptionDemo from "./demos/DisabledOptionDemo";
import disabledOptionSource from "./demos/DisabledOptionDemo.tsx?raw";
import ControlledDemo from "./demos/ControlledDemo";
import controlledSource from "./demos/ControlledDemo.tsx?raw";

export interface CascaderDemoDefinition { id: string; title: string; description: string; component: ComponentType; source: string; }

export const cascaderDemos: readonly CascaderDemoDefinition[] = [
  { id: "级联选择-基础用法", title: "基础用法", description: "默认点击展开下一级，也可以通过 expandTrigger 使用悬停展开；同时展示错误和警告状态。", component: BasicDemo, source: basicSource },
  { id: "级联选择-允许清除", title: "允许清除", description: "通过 allowClear 为有值的级联选择提供明确的清除入口。", component: ClearDemo, source: clearSource },
  { id: "级联选择-前置标签", title: "前置标签", description: "通过 addBefore 补充稳定的字段语义，单选和多选使用同一输入结构。", component: AddBeforeDemo, source: addBeforeSource },
  { id: "级联选择-格式化展示选中值", title: "格式化展示选中值", description: "通过 renderFormat 自定义路径的显示方式，不改变真实 value。", component: RenderFormatDemo, source: renderFormatSource },
  { id: "级联选择-自定义选择框", title: "自定义选择框", description: "trigger render prop 提供完整的 ref、键盘和 ARIA 协议。", component: CustomTriggerDemo, source: customTriggerSource },
  { id: "级联选择-不同尺寸", title: "不同尺寸", description: "mini、small、default、large 的高度分别为 24px、28px、32px、36px。", component: SizeDemo, source: sizeSource },
  { id: "级联选择-自定义字段名", title: "自定义字段名", description: "fieldNames 可映射 label、value、children、disabled 和 isLeaf。", component: FieldNamesDemo, source: fieldNamesSource },
  { id: "级联选择-拖拽排序", title: "拖拽排序", description: "多选时使用 dragToSort 调整已选路径顺序。", component: DragSortDemo, source: dragSortSource },
  { id: "级联选择-选择即改变", title: "选择即改变", description: "changeOnSelect 允许选择非叶子节点，多选时路径彼此独立。", component: ChangeOnSelectDemo, source: changeOnSelectSource },
  { id: "级联选择-支持多选", title: "支持多选", description: "mode=multiple 选择多条路径，checkedStrategy 控制父级回显。", component: MultipleDemo, source: multipleSource },
  { id: "级联选择-允许搜索", title: "允许搜索", description: "showSearch 在完整路径中进行本地过滤。", component: SearchDemo, source: searchSource },
  { id: "级联选择-自定义搜索", title: "自定义搜索", description: "filterOption 根据业务字段覆盖默认 label 匹配。", component: CustomSearchDemo, source: customSearchSource },
  { id: "级联选择-动态加载", title: "动态加载", description: "loadMore 异步请求子节点，调用方更新 options，失败后可重试。", component: LazyDemo, source: lazySource },
  { id: "级联选择-选项禁用", title: "选项禁用", description: "disabled 选项可被识别但不能选择或触发加载。", component: DisabledOptionDemo, source: disabledOptionSource },
  { id: "级联选择-受控模式", title: "受控模式", description: "value 与 onChange 完全控制单选或多选结果。", component: ControlledDemo, source: controlledSource },
];
