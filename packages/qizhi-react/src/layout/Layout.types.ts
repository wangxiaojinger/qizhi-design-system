import type { HTMLAttributes, ReactElement } from "react";

export type LayoutProps = HTMLAttributes<HTMLDivElement>;
export type LayoutHeaderProps = HTMLAttributes<HTMLElement>;
export type LayoutContentProps = HTMLAttributes<HTMLElement>;
export type LayoutSiderProps = HTMLAttributes<HTMLElement>;
export type LayoutFooterProps = HTMLAttributes<HTMLElement>;

export interface LayoutComponent {
  (props: LayoutProps): ReactElement;
  Header: (props: LayoutHeaderProps) => ReactElement;
  Content: (props: LayoutContentProps) => ReactElement;
  Sider: (props: LayoutSiderProps) => ReactElement;
  Footer: (props: LayoutFooterProps) => ReactElement;
}
