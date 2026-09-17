import { Children, isValidElement } from "react";
import type { ReactElement } from "react";
import type {
  LayoutComponent,
  LayoutContentProps,
  LayoutFooterProps,
  LayoutHeaderProps,
  LayoutProps,
  LayoutSiderProps,
} from "./Layout.types";

const classes = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(" ");

function LayoutHeader({ className, ...props }: LayoutHeaderProps) {
  return <header {...props} className={classes("qizhi-layout__header", className)} />;
}

function LayoutContent({ className, ...props }: LayoutContentProps) {
  return <main {...props} className={classes("qizhi-layout__content", className)} />;
}

function LayoutSider({ className, ...props }: LayoutSiderProps) {
  return <aside {...props} className={classes("qizhi-layout__sider", className)} />;
}

function LayoutFooter({ className, ...props }: LayoutFooterProps) {
  return <footer {...props} className={classes("qizhi-layout__footer", className)} />;
}

function LayoutRoot({ className, children, ...props }: LayoutProps) {
  const hasSider = Children.toArray(children).some((child) => (
    isValidElement(child) && child.type === LayoutSider
  ));
  return (
    <div
      {...props}
      className={classes("qizhi-layout", hasSider && "qizhi-layout--has-sider", className)}
    >
      {children}
    </div>
  );
}

export const Layout = Object.assign(LayoutRoot, {
  Header: LayoutHeader,
  Content: LayoutContent,
  Sider: LayoutSider,
  Footer: LayoutFooter,
}) as LayoutComponent;
