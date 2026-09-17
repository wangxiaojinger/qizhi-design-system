export interface TypographyApiItem { name: string; description: string; type: string; defaultValue: string; }
export interface TypographyApiGroup { title: string; items: readonly TypographyApiItem[]; }

const common: readonly TypographyApiItem[] = [
  { name: "type", description: "文本语义类型", type: "'primary' | 'secondary' | 'success' | 'error' | 'warning'", defaultValue: "-" },
  { name: "bold", description: "粗体样式", type: "boolean", defaultValue: "false" },
  { name: "disabled", description: "置灰文本视觉，不产生控件禁用行为", type: "boolean", defaultValue: "false" },
  { name: "mark", description: "标记样式", type: "boolean", defaultValue: "false" },
  { name: "underline", description: "下划线样式", type: "boolean", defaultValue: "false" },
  { name: "delete", description: "删除线样式", type: "boolean", defaultValue: "false" },
  { name: "code", description: "行内代码样式", type: "boolean", defaultValue: "false" },
  { name: "className", description: "节点类名", type: "string | string[]", defaultValue: "-" },
  { name: "style", description: "节点样式", type: "CSSProperties", defaultValue: "-" },
];

export const typographyApi: readonly TypographyApiGroup[] = [
  { title: "Typography", items: [
    { name: "className", description: "根节点类名", type: "string | string[]", defaultValue: "-" },
    { name: "style", description: "根节点样式", type: "CSSProperties", defaultValue: "-" },
  ] },
  { title: "Typography.Title", items: [{ name: "heading", description: "标题级别，对应 h1 至 h6", type: "1 | 2 | 3 | 4 | 5 | 6", defaultValue: "1" }, ...common] },
  { title: "Typography.Text", items: common },
  { title: "Typography.Paragraph", items: [
    { name: "spacing", description: "段落行高密度", type: "'default' | 'close'", defaultValue: "'default'" },
    { name: "blockquote", description: "使用 blockquote 长引用语义和样式", type: "boolean", defaultValue: "false" },
    ...common,
  ] },
  { title: "Typography.Ellipsis", items: [
    { name: "rows", description: "折叠时最大显示行数，运行时归一化为大于 0 的整数", type: "number", defaultValue: "1" },
    { name: "disabled", description: "关闭省略并显示完整文本，同时隐藏展开/收起按钮", type: "boolean", defaultValue: "false" },
    { name: "expandable", description: "确实发生溢出时显示展开/收起按钮", type: "boolean", defaultValue: "true" },
    { name: "defaultExpanded", description: "非受控模式下默认展开", type: "boolean", defaultValue: "false" },
    { name: "expanded", description: "受控展开状态", type: "boolean", defaultValue: "-" },
    { name: "className", description: "根节点类名", type: "string | string[]", defaultValue: "-" },
    { name: "style", description: "根节点样式", type: "CSSProperties", defaultValue: "-" },
    { name: "onEllipsis", description: "首次检测及溢出状态变化时触发", type: "(ellipsis: boolean) => void", defaultValue: "-" },
    { name: "onExpand", description: "点击展开或收起时触发", type: "(expanded: boolean, event: MouseEvent<HTMLButtonElement>) => void", defaultValue: "-" },
  ] },
];
