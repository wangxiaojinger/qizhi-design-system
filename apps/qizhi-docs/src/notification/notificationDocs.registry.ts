import type { ComponentType } from "react";
import ActionDemo from "./demos/ActionDemo";
import actionSource from "./demos/ActionDemo.tsx?raw";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import DurationDemo from "./demos/DurationDemo";
import durationSource from "./demos/DurationDemo.tsx?raw";
import HookDemo from "./demos/HookDemo";
import hookSource from "./demos/HookDemo.tsx?raw";
import IconDemo from "./demos/IconDemo";
import iconSource from "./demos/IconDemo.tsx?raw";
import TypesDemo from "./demos/TypesDemo";
import typesSource from "./demos/TypesDemo.tsx?raw";
import UpdateDemo from "./demos/UpdateDemo";
import updateSource from "./demos/UpdateDemo.tsx?raw";

export interface NotificationDemoDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType;
  tsxSource: string;
}

export const notificationDemos: readonly NotificationDemoDefinition[] = [
  { id: "通知提醒框-基础用法", title: "基础用法", description: "最简单的例子。",
    component: BasicDemo, tsxSource: basicSource },
  { id: "通知提醒框-不同类型", title: "不同类型的通知",
    description: "通知提醒框有 5 种不同的类型，分别为：info、success、warning、error、normal。",
    component: TypesDemo, tsxSource: typesSource },
  { id: "通知提醒框-更新通知内容", title: "更新通知内容",
    description: "通过指定参数 id，可以更新已经存在的通知提醒框。",
    component: UpdateDemo, tsxSource: updateSource },
  { id: "通知提醒框-更新延迟", title: "更新延迟",
    description: "更新通知时可以重新设置自动关闭时间。",
    component: DurationDemo, tsxSource: durationSource },
  { id: "通知提醒框-自定义操作按钮", title: "自定义操作按钮",
    description: "通过指定 btn 字段，可以添加多个操作按钮。",
    component: ActionDemo, tsxSource: actionSource },
  { id: "通知提醒框-自定义图标", title: "自定义图标",
    description: "设置 icon 来自定义图标。", component: IconDemo, tsxSource: iconSource },
  { id: "通知提醒框-hooks-用法", title: "Hooks 用法",
    description: "可以通过 useNotification（2.40.0） 创建可以读取 context 的通知提醒框。",
    component: HookDemo, tsxSource: hookSource },
];
