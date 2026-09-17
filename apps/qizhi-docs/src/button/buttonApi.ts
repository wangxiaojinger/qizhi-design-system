export interface ComponentApiItem {
  name: string;
  description: string;
  type: string;
  defaultValue: string;
}

export const buttonApi = [
  { name: "disabled", description: "是否禁用", type: "boolean", defaultValue: "false" },
  { name: "iconOnly", description: "只有图标，按钮宽高相等。如果指定 `icon` 且没有 children，`iconOnly` 默认为 true。", type: "boolean", defaultValue: "自动判断" },
  { name: "iconPosition", description: "图标相对文字的位置。", type: '"before" | "after"', defaultValue: '"before"' },
  { name: "loading", description: "按钮是否是加载状态", type: "boolean", defaultValue: "false" },
  { name: "loadingFixedWidth", description: "当 loading 的时候，不改变按钮的宽度。", type: "boolean", defaultValue: "false" },
  { name: "long", description: "按钮宽度随容器自适应。", type: "boolean", defaultValue: "false" },
  { name: "href", description: "添加跳转链接，设置此属性，button 表现跟 a 标签一致。", type: "string", defaultValue: "—" },
  { name: "target", description: "a 链接的 target 属性，href 存在时生效。", type: "string", defaultValue: "—" },
  { name: "htmlType", description: "按钮原生的 html type 类型，仅在 href 不存在时生效。", type: '"button" | "submit" | "reset"', defaultValue: '"button"' },
  { name: "size", description: "按钮的尺寸", type: '"mini" | "small" | "default" | "large"', defaultValue: '"default"' },
  { name: "status", description: "按钮状态", type: '"warning" | "danger" | "success" | "default"', defaultValue: '"default"' },
  { name: "type", description: "按钮支持五种类型值：primary 为主要按钮；secondary 和 `default` 均为中性线框次要按钮；dashed 为中性虚线按钮；text 为文本按钮。", type: '"default" | "primary" | "secondary" | "dashed" | "text"', defaultValue: '"default"' },
  { name: "icon", description: "设置按钮的图标", type: "ReactNode", defaultValue: "—" },
  { name: "anchorProps", description: "a 链接的原生属性，href 存在时生效。", type: "HTMLProps<HTMLAnchorElement>", defaultValue: "—" },
  { name: "className", description: "节点类名", type: "string | string[]", defaultValue: "—" },
  { name: "style", description: "节点样式", type: "CSSProperties", defaultValue: "—" },
  { name: "onClick", description: "点击按钮的回调；disabled 或 loading 时不会触发。回调事件类型与实际渲染元素一致。", type: "MouseEventHandler<HTMLButtonElement> | MouseEventHandler<HTMLAnchorElement>", defaultValue: "—" },
] as const satisfies readonly ComponentApiItem[];
