import type { SideNavigationProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type SideNavigationApiItem = ComponentApiItem<keyof SideNavigationProps>;

export const sideNavigationApi = [
  { name: "variant", description: "平台业务域变体。", type: "SideNavigationVariant", defaultValue: '"custom-model"' },
  { name: "groups", description: "自定义导航分组和项目。", type: "readonly SideNavigationGroup[]", defaultValue: "当前变体的默认分组" },
  { name: "selectedKey", description: "受控选中的导航键值。", type: "string", defaultValue: "—" },
  { name: "defaultSelectedKey", description: "非受控初始导航键值。", type: "string", defaultValue: "当前变体默认项" },
  { name: "onSelect", description: "选择可用导航项时触发。", type: "(key: string) => void", defaultValue: "—" },
  { name: "workspaces", description: "可切换的空间名称。", type: "readonly string[]", defaultValue: "平台默认空间" },
  { name: "workspace", description: "受控的当前空间。", type: "string", defaultValue: "—" },
  { name: "defaultWorkspace", description: "非受控初始空间。", type: "string", defaultValue: "当前变体默认空间" },
  { name: "showWorkspaceSwitcher", description: "是否显示空间切换器。", type: "boolean", defaultValue: "true" },
  { name: "onWorkspaceChange", description: "空间变化时触发。", type: "(workspace: string) => void", defaultValue: "—" },
  { name: "onWorkspacePopupScroll", description: "空间菜单滚动时触发，可用于分页加载。", type: "UIEventHandler<HTMLDivElement>", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
  { name: "aria-label", description: "侧边导航无障碍名称。", type: "string", defaultValue: '"空间导航"' },
] as const satisfies readonly SideNavigationApiItem[];
