import type { MenuProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

export type MenuApiItem = ComponentApiItem<keyof MenuProps>;

export const menuApi = [
  { name: "mode", description: "菜单方向。", type: '"horizontal" | "vertical"', defaultValue: '"vertical"' },
  { name: "selectedKey", description: "受控选中项键值。", type: "string", defaultValue: "—" },
  { name: "defaultSelectedKey", description: "非受控初始选中项键值。", type: "string", defaultValue: "—" },
  { name: "onSelect", description: "选择可用菜单项时触发。", type: "(key: string) => void", defaultValue: "—" },
  { name: "children", description: "菜单项或菜单分组。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根元素内联样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "ref", description: "指向根 `HTMLDivElement`。", type: "Ref<HTMLDivElement>", defaultValue: "—" },
] as const satisfies readonly MenuApiItem[];
