import type { HTMLAttributes, ReactNode } from "react";

export type ChoiceCardValue = string | number;
export type ChoiceCardSize = "small" | "default";

export interface ChoiceCardProps {
  value: ChoiceCardValue;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface ChoiceCardGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  children?: ReactNode;
  value?: ChoiceCardValue;
  defaultValue?: ChoiceCardValue;
  size?: ChoiceCardSize;
  columns?: 2 | 3;
  onChange?: (value: ChoiceCardValue) => void;
}
