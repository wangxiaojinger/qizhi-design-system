import type { EmptyProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type EmptyApiItem = ComponentApiItem<Extract<keyof EmptyProps, string>>;

export const emptyApi = [
  { name: "description", description: "空状态说明；传入 null 时不渲染说明节点。", type: "ReactNode", defaultValue: '"暂无数据"' },
  { name: "className", description: "Empty 根节点的附加类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "Empty 根节点的内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly EmptyApiItem[];
