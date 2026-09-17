import type {
  ComponentPropsWithoutRef,
  ReactNode,
  Ref,
} from "react";

export interface PageHeaderProps
  extends ComponentPropsWithoutRef<"header"> {
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
}
