import type { ReactNode } from "react";

export interface MarkdownViewerProps {
  value: string;
  loading?: boolean;
  emptyText?: ReactNode;
  openLinksInNewTab?: boolean;
  maxHeight?: number | string;
  showOutline?: boolean;
  className?: string;
  "aria-label"?: string;
}
