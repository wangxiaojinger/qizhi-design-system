import type { ComponentType } from "react";
import BannerDemo from "./demos/BannerDemo";
import bannerSource from "./demos/BannerDemo.tsx?raw";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import ClosableDemo from "./demos/ClosableDemo";
import closableSource from "./demos/ClosableDemo.tsx?raw";
import CustomCloseDemo from "./demos/CustomCloseDemo";
import customCloseSource from "./demos/CustomCloseDemo.tsx?raw";
import InlineDemo from "./demos/InlineDemo";
import inlineSource from "./demos/InlineDemo.tsx?raw";
import NoIconDemo from "./demos/NoIconDemo";
import noIconSource from "./demos/NoIconDemo.tsx?raw";
import SizeDemo from "./demos/SizeDemo";
import sizeSource from "./demos/SizeDemo.tsx?raw";
import TitleDemo from "./demos/TitleDemo";
import titleSource from "./demos/TitleDemo.tsx?raw";
import TypesDemo from "./demos/TypesDemo";
import typesSource from "./demos/TypesDemo.tsx?raw";

export interface AlertDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  tsxSource: string;
}

export const alertDemos: readonly AlertDemoDefinition[] = [
  { id: "警告提示-基本用法", title: "基本用法",
    description: "警告提示，展现需要关注的信息，适用于简短的警告提示。",
    component: BasicDemo, tsxSource: basicSource },
  { id: "警告提示-不同尺寸", title: "不同尺寸",
    description: "使用 size 设置警告提示尺寸，支持 small（28px）、default（32px）和 large（40px）。",
    component: SizeDemo, tsxSource: sizeSource },
  { id: "警告提示-不同类型", title: "不同类型",
    description: "警告提示的类型有 info、success、warning、error 四种。",
    component: TypesDemo, tsxSource: typesSource },
  { id: "警告提示-紧凑型", title: "紧凑型 Inline Alert（行内警告提示）",
    description: "用于在卡片或内容区域内展示轻量级风险提醒，并根据指标阈值区分风险等级：低风险使用 neutral（中性），中风险使用 warning（警告），高风险使用 error（错误）；指标处于正常范围时不展示。颜色仅表示风险程度，不代表信息类型。",
    component: InlineDemo, tsxSource: inlineSource },
  { id: "警告提示-可关闭", title: "可关闭",
    description: "指定 closable = true，可开启关闭按钮。",
    component: ClosableDemo, tsxSource: closableSource },
  { id: "警告提示-自定义关闭元素", title: "自定义关闭元素",
    description: "指定 closeElement，自定义关闭元素。closeElement 可以接收 onClick，并且自带 close 参数，调用 close() 可以关闭。",
    component: CustomCloseDemo, tsxSource: customCloseSource },
  { id: "警告提示-含有标题", title: "含有标题",
    description: "通过设置 title 可以给添加标题，将 content 变为辅助性介绍文字。",
    component: TitleDemo, tsxSource: titleSource },
  { id: "警告提示-不含图标", title: "不含图标",
    description: "通过指定 showIcon=false 来不显示图标。",
    component: NoIconDemo, tsxSource: noIconSource },
  { id: "警告提示-顶部公告", title: "顶部公告",
    description: "设置 banner = true，可以当作顶部公告使用。",
    component: BannerDemo, tsxSource: bannerSource },
];
