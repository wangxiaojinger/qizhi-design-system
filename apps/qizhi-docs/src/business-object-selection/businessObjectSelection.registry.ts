import type { ComponentType } from "react";
import BasicChoiceCardsDemo from "./demos/BasicChoiceCardsDemo";
import basicSource from "./demos/BasicChoiceCardsDemo.tsx?raw";
import ChoiceCardSizesDemo from "./demos/ChoiceCardSizesDemo";
import sizesSource from "./demos/ChoiceCardSizesDemo.tsx?raw";
import IconChoiceCardsDemo from "./demos/IconChoiceCardsDemo";
import iconSource from "./demos/IconChoiceCardsDemo.tsx?raw";
import ObjectSelectorDemo from "./demos/ObjectSelectorDemo";
import selectorSource from "./demos/ObjectSelectorDemo.tsx?raw";

export interface BusinessObjectSelectionDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const businessObjectSelectionDemos: readonly BusinessObjectSelectionDemoDefinition[] = [
  {
    id: "对象选择-基础选项卡",
    title: "基础选项卡",
    description: "用于少量互斥业务方案的平铺选择；点击或使用方向键切换，禁用项不可选择。",
    component: BasicChoiceCardsDemo,
    source: basicSource,
  },
  {
    id: "对象选择-不同尺寸",
    title: "不同尺寸",
    description: "small 用于短说明，default 用于需要完整解释的业务方案。",
    component: ChoiceCardSizesDemo,
    source: sizesSource,
  },
  {
    id: "对象选择-带图标选项卡",
    title: "带图标选项卡",
    description: "图标帮助快速区分部署方式，选择行为与基础选项卡保持一致。",
    component: IconChoiceCardsDemo,
    source: iconSource,
  },
  {
    id: "对象选择-业务对象选择器",
    title: "业务对象选择器",
    description: "覆盖基础选择、搜索与筛选、关联属性选择和已选回显。示例使用模型数据，公共协议不绑定具体对象类型。",
    component: ObjectSelectorDemo,
    source: selectorSource,
  },
];
