import type { TopNavigationProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type TopNavigationApiItem = ComponentApiItem<keyof TopNavigationProps>;

export const topNavigationApi = [
  { name: "logo", description: "品牌标志。", type: "ReactNode", defaultValue: "QIZHI Logo" },
  { name: "productName", description: "产品名称。", type: "ReactNode", defaultValue: '"启智"' },
  { name: "tenantName", description: "租户或平台名称。", type: "ReactNode", defaultValue: '"租户名称XX"' },
  { name: "items", description: "主导航和次导航项目；仅在当前可用空间无法完整容纳时自动出现“更多”。", type: "readonly TopNavigationItem[]", defaultValue: "平台默认导航" },
  { name: "selectedKey", description: "受控选中的导航键值。", type: "string", defaultValue: "—" },
  { name: "defaultSelectedKey", description: "非受控初始导航键值。", type: "string", defaultValue: '"model-service"' },
  { name: "onSelect", description: "选择可用导航项时触发。", type: "(key: string) => void", defaultValue: "—" },
  { name: "regions", description: "区域选项。", type: "readonly TopNavigationOption[]", defaultValue: "平台默认区域" },
  { name: "region", description: "受控区域键值。", type: "string", defaultValue: "—" },
  { name: "defaultRegion", description: "非受控初始区域键值。", type: "string", defaultValue: '"qibao"' },
  { name: "onRegionChange", description: "区域变化时触发。", type: "(key: string) => void", defaultValue: "—" },
  { name: "languages", description: "语言选项。", type: "readonly TopNavigationOption[]", defaultValue: "中文与 English" },
  { name: "language", description: "受控语言键值。", type: "string", defaultValue: "—" },
  { name: "defaultLanguage", description: "非受控初始语言键值。", type: "string", defaultValue: '"zh-CN"' },
  { name: "onLanguageChange", description: "语言变化时触发。", type: "(key: string) => void", defaultValue: "—" },
  { name: "helpLabel", description: "帮助入口文案。", type: "ReactNode", defaultValue: '"资源/帮助"' },
  { name: "onHelp", description: "点击帮助入口时触发。", type: "() => void", defaultValue: "—" },
  { name: "onUserMenu", description: "点击用户入口时触发。", type: "() => void", defaultValue: "—" },
  { name: "className", description: "根元素类名。", type: "string", defaultValue: "—" },
  { name: "aria-label", description: "顶部导航无障碍名称。", type: "string", defaultValue: '"启智顶部导航"' },
] as const satisfies readonly TopNavigationApiItem[];
