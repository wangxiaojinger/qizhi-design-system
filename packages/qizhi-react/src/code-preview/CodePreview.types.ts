import type { ReactNode } from "react";

export type CodePreviewLanguage =
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "json"
  | "yaml"
  | "markdown"
  | "shell"
  | "python"
  | "text";

export interface CodePreviewProps {
  value: string;
  language?: CodePreviewLanguage;
  showLineNumbers?: boolean;
  wrap?: boolean;
  copyable?: boolean;
  downloadable?: boolean;
  fileName?: string;
  maxHeight?: number | string;
  loading?: boolean;
  emptyText?: ReactNode;
  className?: string;
  "aria-label"?: string;
}
