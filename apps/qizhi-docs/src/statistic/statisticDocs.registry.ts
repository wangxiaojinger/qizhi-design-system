import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import CustomStyleDemo from "./demos/CustomStyleDemo";
import customStyleSource from "./demos/CustomStyleDemo.tsx?raw";
import LoadingDemo from "./demos/LoadingDemo";
import loadingSource from "./demos/LoadingDemo.tsx?raw";
import TimeFormatDemo from "./demos/TimeFormatDemo";
import timeFormatSource from "./demos/TimeFormatDemo.tsx?raw";

export interface StatisticDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const statisticDemos: readonly StatisticDemoDefinition[] = [
  {
    id: "数值显示-基础用法",
    title: "基础用法",
    description: "当需要突出某个或某组数字，或展示带描述的统计类数据时使用。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "数值显示-前缀后缀-自定义样式",
    title: "前缀后缀/自定义样式",
    description: "添加前缀或后缀，并自定义数值显示的颜色和强调方式。",
    component: CustomStyleDemo,
    source: customStyleSource,
  },
  {
    id: "数值显示-时间格式",
    title: "时间格式",
    description: "将时间戳按指定格式展示为可读的日期和时间。",
    component: TimeFormatDemo,
    source: timeFormatSource,
  },
  {
    id: "数值显示-加载中",
    title: "加载中",
    description: "通过 loading 控制是否显示加载中状态。",
    component: LoadingDemo,
    source: loadingSource,
  },
];
