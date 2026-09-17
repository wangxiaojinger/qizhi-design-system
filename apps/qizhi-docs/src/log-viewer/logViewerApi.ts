import type { LogViewerProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";
type Item = ComponentApiItem<Extract<keyof LogViewerProps, string>>;
export const logViewerApi = [
  { name: "logs", description: "由业务页面传入的日志数据。", type: "LogEntry[]", defaultValue: "—" },
  { name: "status", description: "当前运行状态，不触发网络请求。", type: "LogViewerStatus", defaultValue: '"idle"' },
  { name: "loading", description: "是否展示首次加载状态。", type: "boolean", defaultValue: "false" },
  { name: "refreshing", description: "是否正在刷新；开启时刷新按钮禁用。", type: "boolean", defaultValue: "false" },
  { name: "refreshable", description: "是否展示手动刷新操作。", type: "boolean", defaultValue: "false" },
  { name: "onRefresh", description: "点击刷新时通知业务层。", type: "() => void", defaultValue: "—" },
  { name: "autoFollow", description: "是否自动跟随最新日志；传入时为受控状态。", type: "boolean", defaultValue: "true" },
  { name: "onAutoFollowChange", description: "自动跟随状态改变时回调。", type: "(autoFollow: boolean) => void", defaultValue: "—" },
  { name: "searchable", description: "是否展示本地日志搜索。", type: "boolean", defaultValue: "false" },
  { name: "levelFilter", description: "允许筛选的日志等级；空数组隐藏筛选器。", type: "LogLevel[]", defaultValue: "全部等级" },
  { name: "showLineNumbers", description: "是否展示日志行号。", type: "boolean", defaultValue: "false" },
  { name: "maxHeight", description: "日志视口最大高度。", type: "number | string", defaultValue: "360" },
  { name: "emptyText", description: "无匹配日志时的提示。", type: "ReactNode", defaultValue: '"暂无日志"' },
  { name: "className", description: "根节点附加类名。", type: "string", defaultValue: "—" },
  { name: "aria-label", description: "日志查看区域的可访问名称。", type: "string", defaultValue: '"日志查看器"' },
] as const satisfies readonly Item[];
