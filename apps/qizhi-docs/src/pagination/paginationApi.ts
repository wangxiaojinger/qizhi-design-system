import type { PaginationProps } from "@wangxiaojinger/qizhi-react";
import type { ComponentApiItem } from "../api/ApiTable";

type PaginationApiItem = ComponentApiItem<Extract<keyof PaginationProps, string>>;
export const paginationApi = [
  { name: "total", description: "数据总数。", type: "number", defaultValue: "—" },
  { name: "current", description: "受控的当前页码。", type: "number", defaultValue: "—" },
  { name: "defaultCurrent", description: "非受控模式的初始页码。", type: "number", defaultValue: "1" },
  { name: "pageSize", description: "受控的每页条数。", type: "number", defaultValue: "—" },
  { name: "defaultPageSize", description: "非受控模式的初始每页条数。", type: "number", defaultValue: "10" },
  { name: "pageSizeOptions", description: "每页条数选项。", type: "number[]", defaultValue: "[10, 20, 50]" },
  { name: "onChange", description: "页码变化请求时触发。", type: "(current: number, pageSize: number) => void", defaultValue: "—" },
  { name: "onPageSizeChange", description: "每页条数变化请求时触发，新页码为 1。", type: "(pageSize: number, current: number) => void", defaultValue: "—" },
  { name: "size", description: "分页器尺寸。", type: '"mini" | "small" | "default" | "large"', defaultValue: '"default"' },
  { name: "simple", description: "是否使用简洁模式。", type: "boolean", defaultValue: "false" },
  { name: "showTotal", description: "展示总数或使用函数自定义区间文案。", type: "boolean | ((total: number, range: [number, number]) => ReactNode)", defaultValue: "false" },
  { name: "showPageSize", description: "是否展示每页条数选择器。", type: "boolean", defaultValue: "false" },
  { name: "showJumper", description: "是否展示快速跳转输入框。", type: "boolean", defaultValue: "false" },
  { name: "disabled", description: "是否禁用全部交互。", type: "boolean", defaultValue: "false" },
] as const satisfies readonly PaginationApiItem[];
