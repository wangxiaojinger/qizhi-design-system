import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  Ref,
} from "react";

export type StatisticFormat = "YYYY/MM/DD HH:mm:ss";

export interface StatisticProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "children" | "prefix" | "title"
  > {
  value: number | string;
  title?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  extra?: ReactNode;
  precision?: number;
  format?: StatisticFormat;
  valueStyle?: CSSProperties;
  loading?: boolean;
  ref?: Ref<HTMLDivElement>;
}
