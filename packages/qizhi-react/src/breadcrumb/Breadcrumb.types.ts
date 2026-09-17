import type {
  ComponentPropsWithoutRef,
  ReactNode,
  Ref,
} from "react";

export type BreadcrumbSize = "default" | "small";

export interface BreadcrumbProps
  extends ComponentPropsWithoutRef<"nav"> {
  size?: BreadcrumbSize;
  separator?: ReactNode;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
}

export interface BreadcrumbItemProps
  extends Omit<ComponentPropsWithoutRef<"li">, "children"> {
  href?: string;
  current?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  ref?: Ref<HTMLLIElement>;
}
