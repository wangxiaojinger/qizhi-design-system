import type { DrawerProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type DrawerApiItem = ComponentApiItem<keyof DrawerProps>;

export const drawerApi = [
  { name: "open", description: "是否显示抽屉。", type: "boolean", defaultValue: "—" },
  { name: "title", description: "抽屉标题。", type: "ReactNode", defaultValue: "—" },
  { name: "children", description: "抽屉正文内容。", type: "ReactNode", defaultValue: "—" },
  { name: "footer", description: "抽屉底部操作区。", type: "ReactNode", defaultValue: "—" },
  { name: "width", description: "抽屉宽度。", type: "number | string", defaultValue: "760" },
  { name: "closable", description: "是否显示关闭按钮。", type: "boolean", defaultValue: "true" },
  { name: "maskClosable", description: "点击遮罩是否关闭。", type: "boolean", defaultValue: "true" },
  { name: "escToClose", description: "按 Escape 是否关闭。", type: "boolean", defaultValue: "true" },
  { name: "onClose", description: "请求关闭抽屉时触发。", type: "() => void", defaultValue: "—" },
  { name: "className", description: "抽屉面板类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "抽屉面板样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly DrawerApiItem[];
