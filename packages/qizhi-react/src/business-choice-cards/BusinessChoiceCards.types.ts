import type { HTMLAttributes, ReactNode } from "react";
import type { ChoiceCardValue } from "../choice-card/ChoiceCard.types";

export interface BusinessChoiceCardItem {
  value: ChoiceCardValue;
  title: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface BusinessChoiceCardsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  items: readonly BusinessChoiceCardItem[];
  value?: ChoiceCardValue;
  defaultValue?: ChoiceCardValue;
  onChange?: (value: ChoiceCardValue) => void;
}

export type BasicChoiceCardsProps = BusinessChoiceCardsProps;
export type IconChoiceCardsProps = BusinessChoiceCardsProps;
