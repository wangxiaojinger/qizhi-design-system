import type { TabsProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type TabsApiItem = ComponentApiItem<keyof TabsProps>;

export const tabsApi = [
  { name: "items", description: "页签数据。", type: "readonly TabsItem[]", defaultValue: "—" },
  { name: "activeKey", description: "受控激活项。", type: "TabsKey", defaultValue: "—" },
  { name: "defaultActiveKey", description: "非受控初始项。", type: "TabsKey", defaultValue: "首个可用项" },
  { name: "onChange", description: "激活项变化回调。", type: "(key: TabsKey) => void", defaultValue: "—" },
  { name: "type", description: "页签视觉类型。", type: "TabsType", defaultValue: '"line"' },
  { name: "position", description: "页签栏位置。", type: "TabsPosition", defaultValue: '"top"' },
  { name: "size", description: "页签尺寸。", type: "TabsSize", defaultValue: '"default"' },
  { name: "scrollPosition", description: "激活项滚动对齐位置。", type: "TabsScrollPosition", defaultValue: '"auto"' },
  { name: "renderContent", description: "是否由 Tabs 渲染内容面板。", type: "boolean", defaultValue: "true" },
  { name: "showDivider", description: "是否显示页签导航底部分割线；不影响 line 类型的选中下划线。", type: "boolean", defaultValue: "true" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点内联样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly TabsApiItem[];
