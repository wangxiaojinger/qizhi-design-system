import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import DisabledTimeDemo from "./demos/DisabledTimeDemo";
import disabledTimeSource from "./demos/DisabledTimeDemo.tsx?raw";
import MonthDemo from "./demos/MonthDemo";
import monthSource from "./demos/MonthDemo.tsx?raw";
import PrefixDemo from "./demos/PrefixDemo";
import prefixSource from "./demos/PrefixDemo.tsx?raw";
import QuarterDemo from "./demos/QuarterDemo";
import quarterSource from "./demos/QuarterDemo.tsx?raw";
import RangeDemo from "./demos/RangeDemo";
import rangeSource from "./demos/RangeDemo.tsx?raw";
import ShowTimeDemo from "./demos/ShowTimeDemo";
import showTimeSource from "./demos/ShowTimeDemo.tsx?raw";
import StatusDemo from "./demos/StatusDemo";
import statusSource from "./demos/StatusDemo.tsx?raw";
import WeekDemo from "./demos/WeekDemo";
import weekSource from "./demos/WeekDemo.tsx?raw";
import YearDemo from "./demos/YearDemo";
import yearSource from "./demos/YearDemo.tsx?raw";

export interface DatePickerDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  source: string;
}

export const datePickerDemos: readonly DatePickerDemoDefinition[] = [
  {
    id: "日期选择器-基础用法",
    title: "基础用法",
    description: "日期输入器的基础使用。",
    component: BasicDemo,
    source: basicSource,
  },
  {
    id: "日期选择器-不同状态",
    title: "不同状态",
    description: "不同状态的日期输入器。",
    component: StatusDemo,
    source: statusSource,
  },
  {
    id: "日期选择器-带有前缀",
    title: "带有前缀",
    description: "通过 prefix 属性设置前缀。",
    component: PrefixDemo,
    source: prefixSource,
  },
  {
    id: "日期选择器-月份选择器",
    title: "月份选择器",
    description: "月份输入器的基础使用。",
    component: MonthDemo,
    source: monthSource,
  },
  {
    id: "日期选择器-年份选择器",
    title: "年份选择器",
    description: "年份输入器的基础使用。",
    component: YearDemo,
    source: yearSource,
  },
  {
    id: "日期选择器-周选择器",
    title: "周选择器",
    description: "周输入器的基础使用。",
    component: WeekDemo,
    source: weekSource,
  },
  {
    id: "日期选择器-季度选择器",
    title: "季度选择器",
    description: "季度选择器的使用。",
    component: QuarterDemo,
    source: quarterSource,
  },
  {
    id: "日期选择器-带时间的日期选择",
    title: "带时间的日期选择",
    description: "使用 showTime 可以使用带时间的日期选择。",
    component: ShowTimeDemo,
    source: showTimeSource,
  },
  {
    id: "日期选择器-不可选取的时间",
    title: "不可选取的时间",
    description:
      "可禁用指定日期或时、分、秒选项，" +
      "带时间的范围选择器会根据开始和结束字段分别应用限制。",
    component: DisabledTimeDemo,
    source: disabledTimeSource,
  },
  {
    id: "日期选择器-范围选择器",
    title: "范围选择器",
    description: "范围输入器支持日期、周、月、年、季度及日期时间范围。",
    component: RangeDemo,
    source: rangeSource,
  },
];
