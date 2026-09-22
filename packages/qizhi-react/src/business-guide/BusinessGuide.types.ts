import type { HTMLAttributes, ReactNode } from "react";

export interface BusinessGuideAction {
  content: ReactNode;
  href?: string;
  disabled?: boolean;
}

export interface BusinessGuideStep {
  step: ReactNode;
  title: ReactNode;
  image: string;
  actions: readonly BusinessGuideAction[];
}

export interface BusinessGuideProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  highlight: ReactNode;
  subtitle: ReactNode;
  steps: readonly BusinessGuideStep[];
  /** 替换默认关闭操作；undefined 时保留关闭与恢复流程。 */
  headerAction?: ReactNode;
  closedText?: ReactNode;
  onClose?: () => void;
  onRestore?: () => void;
}
