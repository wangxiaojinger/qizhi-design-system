import type { ReactNode } from "react";

export type LogLevel = "debug" | "info" | "warning" | "error";
export type LogViewerStatus = "idle" | "running" | "paused" | "success" | "error";

export interface LogEntry {
  id: string;
  timestamp?: string;
  level?: LogLevel;
  message: string;
}

export interface LogViewerProps {
  logs: LogEntry[];
  status?: LogViewerStatus;
  loading?: boolean;
  refreshing?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
  autoFollow?: boolean;
  onAutoFollowChange?: (autoFollow: boolean) => void;
  searchable?: boolean;
  levelFilter?: LogLevel[];
  showLineNumbers?: boolean;
  maxHeight?: number | string;
  emptyText?: ReactNode;
  className?: string;
  "aria-label"?: string;
}
