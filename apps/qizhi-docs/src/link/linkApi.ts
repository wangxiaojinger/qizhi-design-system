export interface LinkApiItem {
  name: string;
  description: string;
  type: string;
  defaultValue: string;
}

export const linkApi = [
  { name: "children", description: "链接或操作内容，并提供可访问名称。", type: "ReactNode", defaultValue: "—" },
  { name: "status", description: "链接的语义状态。", type: '"default" | "error" | "success" | "warning"', defaultValue: '"default"' },
  { name: "disabled", description: "是否禁用；禁用链接不可聚焦且不会跳转，禁用按钮使用原生 disabled。", type: "boolean", defaultValue: "false" },
  { name: "hoverable", description: "悬浮及按下时是否显示填充背景。", type: "boolean", defaultValue: "true" },
  { name: "icon", description: "设置为 `true` 时显示默认链接图标，也可以传入自定义图标。", type: "boolean | ReactNode", defaultValue: "false" },
  { name: "href", description: "链接地址；存在时渲染 `a`，省略时渲染 `button`。", type: "string", defaultValue: "—" },
  { name: "target", description: "原生链接 target 属性，仅在 href 存在时生效。", type: "string", defaultValue: "—" },
  { name: "rel", description: "原生链接 rel 属性；新窗口链接应显式传入 `noopener noreferrer`。", type: "string", defaultValue: "—" },
  { name: "download", description: "原生链接 download 属性，仅在 href 存在时生效。", type: "string | boolean", defaultValue: "—" },
  { name: "htmlType", description: "按钮分支的原生 type 属性，仅在 href 不存在时生效。", type: '"button" | "submit" | "reset"', defaultValue: '"button"' },
  { name: "className", description: "根节点类名。", type: "string | string[]", defaultValue: "—" },
  { name: "style", description: "根节点样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "onClick", description: "点击回调；事件类型与实际渲染元素一致，disabled 时不执行。", type: "MouseEventHandler<HTMLButtonElement> | MouseEventHandler<HTMLAnchorElement>", defaultValue: "—" },
] as const satisfies readonly LinkApiItem[];
