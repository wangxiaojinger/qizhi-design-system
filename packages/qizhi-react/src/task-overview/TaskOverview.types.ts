import type { HTMLAttributes, ReactNode } from "react";

export interface TaskOverviewMetric {
  key: string;
  title: ReactNode;
  total: number | string;
  label: ReactNode;
  value: number | string;
  info?: ReactNode;
  disabled?: boolean;
}

export interface TaskOverviewTask {
  key: string;
  type: string;
  name: ReactNode;
  space: ReactNode;
  spaceValue: string;
  resource: ReactNode;
  duration: ReactNode;
  status: ReactNode;
  icon?: ReactNode;
}

export interface TaskOverviewProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  metrics: readonly TaskOverviewMetric[];
  tasks: readonly TaskOverviewTask[];
  spaces: readonly string[];
  defaultType: string;
  defaultSpace?: string;
  initialVisibleCount?: number;
}
