import {
  Children,
  Fragment,
  forwardRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import { Link } from "../link/Link";
import type {
  BreadcrumbItemProps,
  BreadcrumbProps,
} from "./Breadcrumb.types";
import "./breadcrumb.css";

const joinClassNames = (...names: Array<string | false | undefined>) =>
  names.filter(Boolean).join(" ");

const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem(
    {
      href,
      current = false,
      icon,
      children,
      className,
      ...itemProps
    },
    ref,
  ) {
    const content = (
      <>
        {icon !== undefined ? (
          <span className="qizhi-breadcrumb__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {children}
      </>
    );

    return (
      <li
        {...itemProps}
        ref={ref}
        className={joinClassNames(
          "qizhi-breadcrumb__item",
          current && "qizhi-breadcrumb__item--current",
          className,
        )}
        aria-current={current ? "page" : itemProps["aria-current"]}
      >
        {href ? (
          <Link className="qizhi-breadcrumb__link" href={href}>
            {content}
          </Link>
        ) : content}
      </li>
    );
  },
);

type BreadcrumbComponent = ForwardRefExoticComponent<
  BreadcrumbProps & RefAttributes<HTMLElement>
> & {
  Item: typeof BreadcrumbItem;
};

const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb(
    {
      size = "default",
      separator = "/",
      children,
      className,
      ...navProps
    },
    ref,
  ) {
    const items = Children.toArray(children);

    return (
      <nav
        {...navProps}
        ref={ref}
        className={joinClassNames(
          "qizhi-breadcrumb",
          size === "small" && "qizhi-breadcrumb--small",
          className,
        )}
      >
        <ol className="qizhi-breadcrumb__list">
          {items.map((item, index) => (
            <Fragment key={index}>
              {index > 0 ? (
                <li
                  className="qizhi-breadcrumb__separator"
                  aria-hidden="true"
                >
                  {separator}
                </li>
              ) : null}
              {item}
            </Fragment>
          ))}
        </ol>
      </nav>
    );
  },
);

export const Breadcrumb = BreadcrumbRoot as BreadcrumbComponent;
Breadcrumb.Item = BreadcrumbItem;
