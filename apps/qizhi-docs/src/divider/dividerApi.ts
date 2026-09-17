export interface DividerApiItem {
  name: string;
  description: string;
  type: string;
  defaultValue: string;
}

export const dividerApi = [
  { name: "children", description: "水平分割线中的文字内容；type 为 vertical 时不渲染。", type: "ReactNode", defaultValue: "—" },
  { name: "type", description: "分割线方向，并同步决定 `aria-orientation`。", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"' },
  { name: "lineStyle", description: "分割线线型。", type: '"solid" | "dashed" | "dotted"', defaultValue: '"solid"' },
  { name: "orientation", description: "文字位置，仅在水平分割线存在 children 时生效。", type: '"left" | "center" | "right"', defaultValue: '"center"' },
  { name: "className", description: "根节点类名，可用于消费场景布局。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点原生行内样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly DividerApiItem[];
