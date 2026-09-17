import type { HTMLAttributes, ReactNode } from "react";

export interface MetricCardProps {
  title: ReactNode;
  info?: ReactNode;
  total: number | string;
  label: ReactNode;
  value: number | string;
  unit?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface ResourceUsageCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  value: ReactNode;
  percent?: number;
}

export interface MetricItemProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  info?: ReactNode;
}

export interface ObjectMetricsProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  summaryLabel: ReactNode;
  summaryValue: ReactNode;
}
