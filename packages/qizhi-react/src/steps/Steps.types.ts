import type {
  ComponentPropsWithoutRef,
  ReactNode,
  Ref,
} from "react";

export type StepsSize = "default" | "small";
export type StepsStatus = "process" | "error";

export interface StepsItem {
  title: ReactNode;
  description?: ReactNode;
}

export interface StepsProps
  extends Omit<ComponentPropsWithoutRef<"ol">, "children"> {
  items: readonly StepsItem[];
  current?: number;
  size?: StepsSize;
  status?: StepsStatus;
  ref?: Ref<HTMLOListElement>;
}
