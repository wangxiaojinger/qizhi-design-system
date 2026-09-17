import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo"; import basicSource from "./demos/BasicDemo.tsx?raw";
import ClearDemo from "./demos/ClearDemo"; import clearSource from "./demos/ClearDemo.tsx?raw";
import MultipleDemo from "./demos/MultipleDemo"; import multipleSource from "./demos/MultipleDemo.tsx?raw";
import AddBeforeDemo from "./demos/AddBeforeDemo"; import addBeforeSource from "./demos/AddBeforeDemo.tsx?raw";
import CreateDemo from "./demos/CreateDemo"; import createSource from "./demos/CreateDemo.tsx?raw";
import SearchDemo from "./demos/SearchDemo"; import searchSource from "./demos/SearchDemo.tsx?raw";
import RemoteDemo from "./demos/RemoteDemo"; import remoteSource from "./demos/RemoteDemo.tsx?raw";
import PopupWidthDemo from "./demos/PopupWidthDemo"; import popupWidthSource from "./demos/PopupWidthDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo"; import sizeSource from "./demos/SizeDemo.tsx?raw";
import OptionsDemo from "./demos/OptionsDemo"; import optionsSource from "./demos/OptionsDemo.tsx?raw";
import TokenDemo from "./demos/TokenDemo"; import tokenSource from "./demos/TokenDemo.tsx?raw";
import TriggerDemo from "./demos/TriggerDemo"; import triggerSource from "./demos/TriggerDemo.tsx?raw";
import DropdownRenderDemo from "./demos/DropdownRenderDemo"; import dropdownRenderSource from "./demos/DropdownRenderDemo.tsx?raw";
import CardNameFieldsDemo from "./demos/CardNameFieldsDemo"; import cardNameFieldsSource from "./demos/CardNameFieldsDemo.tsx?raw";
import CardIconFieldsDemo from "./demos/CardIconFieldsDemo"; import cardIconFieldsSource from "./demos/CardIconFieldsDemo.tsx?raw";
import CardDescriptionDemo from "./demos/CardDescriptionDemo"; import cardDescriptionSource from "./demos/CardDescriptionDemo.tsx?raw";
import CardSelectionDemo from "./demos/CardSelectionDemo"; import cardSelectionSource from "./demos/CardSelectionDemo.tsx?raw";
import CascadeDemo from "./demos/CascadeDemo"; import cascadeSource from "./demos/CascadeDemo.tsx?raw";
import HideSelectedDemo from "./demos/HideSelectedDemo"; import hideSelectedSource from "./demos/HideSelectedDemo.tsx?raw";
import DragDemo from "./demos/DragDemo"; import dragSource from "./demos/DragDemo.tsx?raw";
import AutoWidthDemo from "./demos/AutoWidthDemo"; import autoWidthSource from "./demos/AutoWidthDemo.tsx?raw";
import MaxTagsDemo from "./demos/MaxTagsDemo"; import maxTagsSource from "./demos/MaxTagsDemo.tsx?raw";

export interface SelectDemoDefinition { id: string; title: string; description: string; component: ComponentType; source: string; sectionBefore?: { title: string; description: string } }
export const selectDemos: readonly SelectDemoDefinition[] = [
  { id: "选择器-基础用法", title: "基础用法", description: "基础选择器。", component: BasicDemo, source: basicSource },
  { id: "选择器-允许清除", title: "允许清除", description: "支持清除按钮。", component: ClearDemo, source: clearSource },
  { id: "选择器-多选模式", title: "多选模式", description: "指定 mode=multiple，即可使用多选。通过 maxTagCount 设置最多显示的标签个数，通过 renderTag 属性自定义标签的渲染方式，实现更复杂的定制。", component: MultipleDemo, source: multipleSource },
  { id: "选择器-带有前置标签", title: "带有前置标签", description: "通过 addBefore 设置前置标签。", component: AddBeforeDemo, source: addBeforeSource },
  { id: "选择器-允许创建", title: "允许创建", description: "指定 allowCreate 为 true，即可创建选项中不存在的条目。通过 allowCreate.formatter 格式化用户创建的选项。", component: CreateDemo, source: createSource },
  { id: "选择器-搜索", title: "搜索", description: "指定 showSearch=true，可以对展开的选项进行搜索，配合 filterOption 可以自定义搜索。通过 showSearch={ retainInputValue: true } 保留内容。", component: SearchDemo, source: searchSource },
  { id: "选择器-远程搜索", title: "远程搜索", description: "指定 showSearch，并且结合 filterOption 和 onSearch，可以使用远程搜索功能。", component: RemoteDemo, source: remoteSource },
  { id: "选择器-自定义弹出框宽度", title: "自定义弹出框宽度", description: "弹出框可以根据内容自动调节宽度，最小宽度为输入框的宽度。", component: PopupWidthDemo, source: popupWidthSource },
  { id: "选择器-不同尺寸", title: "不同尺寸", description: "通过 size 选择 Select 的尺寸（mini、small、default、large），高度分别对应 24px、28px、32px、36px。", component: SizeDemo, source: sizeSource },
  { id: "选择器-指定可选项", title: "指定可选项", description: "通过传入 options 指定可选项。", component: OptionsDemo, source: optionsSource },
  { id: "选择器-自动分词", title: "自动分词", description: "设置 tokenSeparators 可以使用自动分词功能。试试复制 北京,上海,深圳|南京/西安|杭州 到输入框里。只在 multiple 模式下可用。", component: TokenDemo, source: tokenSource },
  { id: "选择器-自定义触发节点", title: "自定义触发节点", description: "设置 trigger 可以自定义触发下拉框的节点，并保留完整键盘和 ARIA 协议。", component: TriggerDemo, source: triggerSource },
  { id: "选择器-扩展菜单", title: "扩展菜单", description: "使用 dropdownRender 对下拉菜单进行自由扩展。", component: DropdownRenderDemo, source: dropdownRenderSource },
  { id: "选择器-名称与字段信息", title: "名称与字段信息", description: "通过 SelectOptionCard 在选项中展示项目名称、优先级和预算。", component: CardNameFieldsDemo, source: cardNameFieldsSource, sectionBefore: { title: "信息卡片选项", description: "使用 SelectOptionCard 组合选项名称和字段信息，仍由 Select 统一管理选择、焦点和补充说明。" } },
  { id: "选择器-图标与属性", title: "图标与属性", description: "在信息卡片字段中使用 QIZHI 图标展示 CPU-Public 与 H800-Public 的资源属性。", component: CardIconFieldsDemo, source: cardIconFieldsSource },
  { id: "选择器-悬停补充信息", title: "悬停补充信息", description: "通过 renderOptionDescription 由 Select 在悬停和键盘活动项显示镜像状态及描述。", component: CardDescriptionDemo, source: cardDescriptionSource },
  { id: "选择器-选择后关联信息", title: "选择后关联信息", description: "选择镜像后回填支持的算力厂商和 CPU 架构；通过清除按钮移除该信息。", component: CardSelectionDemo, source: cardSelectionSource },
  { id: "选择器-联动", title: "联动", description: "省市联动示例。", component: CascadeDemo, source: cascadeSource },
  { id: "选择器-隐藏已选择项", title: "隐藏已选择项", description: "在下拉列表中隐藏已选择的项。", component: HideSelectedDemo, source: hideSelectedSource },
  { id: "选择器-拖拽排序", title: "拖拽排序", description: "多选时，指定 dragToSort 属性以允许对已输入的值进行拖拽排序。", component: DragDemo, source: dragSource },
  { id: "选择器-宽度自适应", title: "宽度自适应", description: "通过 autoWidth 属性可以设置 Select 的宽度自适应。", component: AutoWidthDemo, source: autoWidthSource },
  { id: "选择器-最大标签数", title: "最大标签数", description: "通过 maxTagCount 属性可以设置 Select 的最大标签数。maxTagCount=responsive 时会根据容器尺寸动态显示标签数。", component: MaxTagsDemo, source: maxTagsSource },
];
