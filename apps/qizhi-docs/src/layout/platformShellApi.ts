import type { PlatformShellProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type PlatformShellApiItem = ComponentApiItem<keyof PlatformShellProps>;

export const platformShellApi = [
  { name: "selectedKey", description: "受控的当前平台导航键值。", type: "string", defaultValue: "—" },
  { name: "defaultSelectedKey", description: "非受控初始平台导航键值。", type: "string", defaultValue: '"workbench"' },
  { name: "onSelect", description: "选择顶部导航项时触发。", type: "(key: string) => void", defaultValue: "—" },
  { name: "topNavigationProps", description: "传给 TopNavigation 的公开属性；导航选中状态由 PlatformShell 管理。", type: 'Omit<TopNavigationProps, "selectedKey" | "defaultSelectedKey" | "onSelect">', defaultValue: "—" },
  { name: "sideNavigationProps", description: "传给 SideNavigation 的公开属性；业务变体由 PlatformShell 管理。", type: 'Omit<SideNavigationProps, "variant">', defaultValue: "—" },
  { name: "stickyHeader", description: "是否让顶部导航吸顶，并启用半透明磨砂背景。", type: "boolean", defaultValue: "false" },
  { name: "greeting", description: "问候区域内容；传入 null 时不渲染。", type: "ReactNode", defaultValue: '"Good day，欢迎使用 启智 开启新的一天 😃"' },
  { name: "children", description: "平台主内容。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根元素附加类名。", type: "string", defaultValue: "—" },
  { name: "aria-label", description: "平台框架无障碍名称。", type: "string", defaultValue: '"启智平台框架"' },
] as const satisfies readonly PlatformShellApiItem[];
