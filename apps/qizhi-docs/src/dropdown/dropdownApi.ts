export interface DropdownApiItem { name: string; description: string; type: string; defaultValue: string }
export const dropdownApi = [
  { name: "droplist", description: "下拉菜单内容，使用 Dropdown.Menu 组织。", type: "ReactNode", defaultValue: "—" },
  { name: "position", description: "浮层相对触发器的位置。", type: '"top" | "tl" | "tr" | "bottom" | "bl" | "br"', defaultValue: '"bl"' },
  { name: "trigger", description: "菜单的触发方式。", type: '"hover" | "click"', defaultValue: '"hover"' },
  { name: "popupVisible", description: "受控展开状态。", type: "boolean", defaultValue: "—" },
  { name: "defaultPopupVisible", description: "非受控初始展开状态。", type: "boolean", defaultValue: "false" },
  { name: "onVisibleChange", description: "展开状态变化回调。", type: "(visible: boolean) => void", defaultValue: "—" },
  { name: "Menu.onClickMenuItem", description: "点击普通菜单项时返回稳定 itemKey。", type: "(key: string, event: MouseEvent) => void", defaultValue: "—" },
  { name: "Item.itemKey", description: "菜单项稳定标识。", type: "string", defaultValue: "—" },
  { name: "Item.icon", description: "菜单项前置 QIZHI 图标。", type: "ReactNode", defaultValue: "—" },
] as const satisfies readonly DropdownApiItem[];
