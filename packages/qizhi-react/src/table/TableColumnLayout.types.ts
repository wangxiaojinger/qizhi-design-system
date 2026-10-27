import type { ReactElement, ReactNode } from "react";

export interface TableColumnLayoutState {
  schemaVersion: 1;
  /** 包含隐藏列；只包含当前有权限的有效列。 */
  columnOrder: string[];
  /** 仅用户显式调宽后的 CSS px；缺失时使用默认自适应预算。 */
  columnWidths: Record<string, number>;
  columnVisibility: Record<string, boolean>;
}
export interface TableColumnLayoutMeta {
  reason: "order" | "width" | "visibility" | "reset";
  columnKey?: string;
}
export interface TableColumnCustomizationLocale {
  settings: string;
  reset: string;
  selectAll: string;
  moveBefore: string;
  moveAfter: string;
  resize: string;
  required: string;
  minimumVisible: string;
}
export interface TableColumnCustomization {
  reorder?: boolean;
  resize?: boolean;
  visibility?: boolean;
  settings?: boolean;
  /** 接收完整设置入口，可通过 Portal 放到业务已有工具栏。 */
  renderSettings?: (trigger: ReactElement) => ReactNode;
  locale?: Partial<TableColumnCustomizationLocale>;
}
export interface TableColumnLayoutOptions {
  movable?: boolean;
  resizable?: boolean;
  hideable?: boolean;
  defaultVisible?: boolean;
  settingsLabel?: string;
  /** action 不计入至少保留一列业务数据的约束；默认 data。 */
  layoutRole?: "data" | "action";
}
