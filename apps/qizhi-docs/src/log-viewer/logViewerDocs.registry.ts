import type { ComponentType } from "react";
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
import LiveDemo from "./demos/LiveDemo";
import liveSource from "./demos/LiveDemo.tsx?raw";
import RefreshDemo from "./demos/RefreshDemo";
import refreshSource from "./demos/RefreshDemo.tsx?raw";
import FilterDemo from "./demos/FilterDemo";
import filterSource from "./demos/FilterDemo.tsx?raw";
import StatesDemo from "./demos/StatesDemo";
import statesSource from "./demos/StatesDemo.tsx?raw";

export interface LogViewerDemoDefinition { id: string; title: string; description: string; component: ComponentType; source: string; }

export const logViewerDemos: readonly LogViewerDemoDefinition[] = [
  { id: "log-viewer-basic", title: "基础日志", description: "展示日志时间、等级、内容和行号。", component: BasicDemo, source: basicSource },
  { id: "log-viewer-live", title: "实时日志", description: "使用本地 Mock 定时追加日志，并支持暂停和继续跟随。", component: LiveDemo, source: liveSource },
  { id: "log-viewer-refresh", title: "手动刷新", description: "使用本地 Mock 模拟 800ms 刷新过程，展示加载、禁用和文字提示。", component: RefreshDemo, source: refreshSource },
  { id: "log-viewer-filter", title: "搜索与等级筛选", description: "在已传入的日志中按关键词和日志等级筛选。", component: FilterDemo, source: filterSource },
  { id: "log-viewer-states", title: "空状态与错误状态", description: "展示暂无日志和运行失败时的反馈。", component: StatesDemo, source: statesSource },
];
