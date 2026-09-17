import type {
  HTMLAttributes,
  ReactNode,
  Ref,
} from "react";

export type SpinSize = 20 | 30 | 40;

export interface SpinProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  loading?: boolean;
  size?: SpinSize;
  tip?: ReactNode;
  icon?: ReactNode;
  block?: boolean;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}
