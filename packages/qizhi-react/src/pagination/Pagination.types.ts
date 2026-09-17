import type { HTMLAttributes, ReactNode } from "react";

export type PaginationSize = "mini" | "small" | "default" | "large";
export type PaginationTotalRenderer = (total: number, range: [number, number]) => ReactNode;

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  total: number;
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  onChange?: (current: number, pageSize: number) => void;
  onPageSizeChange?: (pageSize: number, current: number) => void;
  size?: PaginationSize;
  simple?: boolean;
  showTotal?: boolean | PaginationTotalRenderer;
  showPageSize?: boolean;
  showJumper?: boolean;
  disabled?: boolean;
}
