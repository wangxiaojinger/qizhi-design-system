export const layoutApi = [
  { name: "children", description: "布局内容。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "根节点附加类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点样式。", type: "CSSProperties", defaultValue: "—" },
] as const;
