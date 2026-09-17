import type { HTMLAttributes, MouseEvent, ReactNode } from "react";

export type TypographyClassName = string | string[];
export type TypographyTextType = "primary" | "secondary" | "success" | "error" | "warning";

export interface TypographyProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  children?: ReactNode;
  className?: TypographyClassName;
}

export interface TypographyCommonProps extends Omit<HTMLAttributes<HTMLElement>, "className"> {
  children?: ReactNode;
  className?: TypographyClassName;
  type?: TypographyTextType;
  bold?: boolean;
  disabled?: boolean;
  mark?: boolean;
  underline?: boolean;
  delete?: boolean;
  code?: boolean;
}

export interface TypographyTitleProps extends TypographyCommonProps {
  heading?: 1 | 2 | 3 | 4 | 5 | 6;
}

export type TypographyTextProps = TypographyCommonProps;

export interface TypographyParagraphProps extends TypographyCommonProps {
  spacing?: "default" | "close";
  blockquote?: boolean;
  cite?: string;
}

export interface TypographyEllipsisProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className"> {
  children: string;
  className?: TypographyClassName;
  rows?: number;
  disabled?: boolean;
  expandable?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onEllipsis?: (ellipsis: boolean) => void;
  onExpand?: (expanded: boolean, event: MouseEvent<HTMLButtonElement>) => void;
}
