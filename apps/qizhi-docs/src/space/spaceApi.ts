export interface SpaceApiItem {
  name: string;
  description: string;
  type: string;
  defaultValue: string;
}

export const spaceApi = [
  { name: "wrap", description: "是否允许水平内容自动换行。", type: "boolean", defaultValue: "false" },
  { name: "align", description: "子元素在交叉轴上的对齐方式；未设置时根据排列方向决定。", type: '"start" | "center" | "end" | "baseline"', defaultValue: "—" },
  { name: "direction", description: "子元素的排列方向。", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"' },
  { name: "split", description: "插入相邻子元素之间的分隔内容。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根节点类名，可用于消费场景布局。", type: "string", defaultValue: "—" },
  { name: "size", description: "间距尺寸；二元组依次表示水平、垂直间距。", type: "SpaceSize | readonly [number, number]", defaultValue: '"small"' },
  { name: "style", description: "根节点原生行内样式。", type: "CSSProperties", defaultValue: "—" },
] as const satisfies readonly SpaceApiItem[];
