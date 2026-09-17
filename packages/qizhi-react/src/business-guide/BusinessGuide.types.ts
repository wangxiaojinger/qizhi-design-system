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
  closedText?: ReactNode;
  onClose?: () => void;
  onRestore?: () => void;
}
