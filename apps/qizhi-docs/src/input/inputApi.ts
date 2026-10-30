export interface InputApiItem {
  name: string;
  description: string;
  type: string;
  defaultValue: string;
}

export interface InputApiSection {
  title: string;
  ariaLabel: string;
  description: string;
  items: readonly InputApiItem[];
}

export const inputApi = [
  { name: "value", description: "受控输入值。", type: "string", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始值。", type: "string", defaultValue: "—" },
  { name: "placeholder", description: "输入框提示文字。", type: "string", defaultValue: "—" },
  { name: "disabled", description: "是否禁用输入框。", type: "boolean", defaultValue: "false" },
  { name: "readOnly", description: "是否只读；保持可聚焦和可复制。", type: "boolean", defaultValue: "false" },
  { name: "size", description: "输入框尺寸。", type: '"mini" | "small" | "default" | "large"', defaultValue: '"default"' },
  { name: "status", description: "输入框状态；错误状态同步 aria-invalid。", type: '"default" | "error" | "warning"', defaultValue: '"default"' },
  { name: "allowClear", description: "有值时是否显示清空按钮；禁用和只读时隐藏。", type: "boolean", defaultValue: "true" },
  { name: "prefix", description: "输入框内部前缀。", type: "ReactNode", defaultValue: "—" },
  { name: "suffix", description: "输入框内部后缀。", type: "ReactNode", defaultValue: "—" },
  { name: "addBefore", description: "输入框外部前置内容。", type: "ReactNode", defaultValue: "—" },
  { name: "addAfter", description: "输入框外部后置内容。", type: "ReactNode", defaultValue: "—" },
  { name: "maxLength", description: "限制输入长度；`errorOnly` 为 true 时仅报告超限。", type: "number | { length: number; errorOnly?: boolean }", defaultValue: "—" },
  { name: "showWordLimit", description: "配合 `maxLength` 显示字数统计。", type: "boolean", defaultValue: "false" },
  { name: "normalize", description: "在指定时机转换输入值。", type: "(value: string) => string", defaultValue: "—" },
  { name: "normalizeTrigger", description: "指定 `normalize` 的触发时机。", type: '"blur" | "enter"', defaultValue: '"blur"' },
  { name: "autoWidth", description: "根据内容调整宽度，可限制最小和最大宽度。", type: "boolean | { minWidth?: number; maxWidth?: number }", defaultValue: "false" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "onChange", description: "输入值变化时触发；清空和格式化也会触发。", type: "ChangeEventHandler<HTMLInputElement>", defaultValue: "—" },
  { name: "onClear", description: "点击清空按钮时触发。", type: "() => void", defaultValue: "—" },
] as const satisfies readonly InputApiItem[];

export const inputTextAreaApi = [
  { name: "value", description: "受控输入值。", type: "string", defaultValue: "—" },
  { name: "defaultValue", description: "非受控初始值。", type: "string", defaultValue: "—" },
  { name: "placeholder", description: "文本域提示文字。", type: "string", defaultValue: "—" },
  { name: "disabled", description: "是否禁用文本域。", type: "boolean", defaultValue: "false" },
  { name: "readOnly", description: "是否只读。", type: "boolean", defaultValue: "false" },
  { name: "status", description: "文本域状态；错误状态同步 aria-invalid。", type: '"default" | "error" | "warning"', defaultValue: '"default"' },
  { name: "maxLength", description: "限制输入长度；`errorOnly` 为 true 时仅报告超限。", type: "number | { length: number; errorOnly?: boolean }", defaultValue: "—" },
  { name: "showWordLimit", description: "配合 `maxLength` 显示字数统计。", type: "boolean", defaultValue: "false" },
  { name: "wordLimitPlacement", description: "字数统计显示在文本域内部或外部。", type: '"inside" | "outside"', defaultValue: '"inside"' },
  { name: "autoSize", description: "是否根据内容自动调整高度，可限制最小和最大行数。", type: "boolean | { minRows?: number; maxRows?: number }", defaultValue: "false" },
  { name: "rows", description: "文本域可见行数。", type: "number", defaultValue: "—" },
  { name: "className", description: "根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "根节点样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "onChange", description: "输入值变化时触发。", type: "ChangeEventHandler<HTMLTextAreaElement>", defaultValue: "—" },
] as const satisfies readonly InputApiItem[];

export const inputGroupApi = [
  { name: "children", description: "组合中的输入控件。", type: "ReactNode", defaultValue: "—" },
  { name: "className", description: "组合根节点类名。", type: "string", defaultValue: "—" },
  { name: "style", description: "组合根节点样式。", type: "CSSProperties", defaultValue: "—" },
  { name: "role", description: "组合根节点的无障碍角色。", type: "AriaRole", defaultValue: '"group"' },
] as const satisfies readonly InputApiItem[];

export const inputSearchApi = [
  { name: "loading", description: "搜索时是否显示加载状态；加载中阻止重复搜索。", type: "boolean", defaultValue: "false" },
  { name: "searchButton", description: "是否显示搜索按钮，也可传入自定义按钮内容。", type: "boolean | ReactNode", defaultValue: "false" },
  { name: "onSearch", description: "点击搜索图标、按钮或按回车触发；禁用、加载和输入法组合确认时不触发。", type: "(value: string) => void", defaultValue: "—" },
] as const satisfies readonly InputApiItem[];

export const inputPasswordApi = [
  { name: "defaultVisibility", description: "非受控模式下的初始可见状态。", type: "boolean", defaultValue: "false" },
  { name: "visibility", description: "受控的密码可见状态。", type: "boolean", defaultValue: "—" },
  { name: "onVisibilityChange", description: "密码可见状态变化时触发。", type: "(visible: boolean) => void", defaultValue: "—" },
] as const satisfies readonly InputApiItem[];

export const inputRefApi = [
  { name: "focus", description: "使原生输入元素获得焦点。", type: "() => void", defaultValue: "—" },
  { name: "blur", description: "使原生输入元素失去焦点。", type: "() => void", defaultValue: "—" },
] as const satisfies readonly InputApiItem[];

export const inputApiSections = [
  { title: "Input", ariaLabel: "Input API", description: "继承原生 input 属性；下表列出 QIZHI 扩展能力及常用属性。", items: inputApi },
  { title: "Input.TextArea", ariaLabel: "Input.TextArea API", description: "继承原生 textarea 属性；当前不提供一键清空能力。", items: inputTextAreaApi },
  { title: "Input.Group", ariaLabel: "Input.Group API", description: "继承原生 div 属性，默认使用紧凑组合布局。", items: inputGroupApi },
  { title: "Input.Search", ariaLabel: "Input.Search API", description: "继承 Input 除 allowClear 和 onClear 外的全部属性。", items: inputSearchApi },
  { title: "Input.Password", ariaLabel: "Input.Password API", description: "继承 Input 属性，但不开放 type 和 suffix。", items: inputPasswordApi },
  { title: "Ref 方法", ariaLabel: "Input Ref 方法", description: "Input、Input.Search、Input.Password 和 Input.TextArea 均转发原生元素 ref。", items: inputRefApi },
] as const satisfies readonly InputApiSection[];
