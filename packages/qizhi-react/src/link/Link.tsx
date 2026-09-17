import { forwardRef } from "react";
import { LinkIcon } from "../icon";
import type { LinkClassName, LinkHandle, LinkProps } from "./Link.types";

const joinClassName = (className?: LinkClassName) =>
  Array.isArray(className) ? className.filter(Boolean).join(" ") : className;

const LinkBase = forwardRef<LinkHandle, LinkProps>(function Link(
  {
    status = "default",
    disabled = false,
    hoverable = true,
    icon = false,
    htmlType = "button",
    href,
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const classes = [
    "qizhi-link",
    status !== "default" && `qizhi-link--${status}`,
    icon && "qizhi-link--with-icon",
    !hoverable && "qizhi-link--hoverless",
    disabled && "qizhi-link--disabled",
    joinClassName(className),
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon ? (
        <span className="qizhi-link__icon" aria-hidden="true">
          {icon === true ? <LinkIcon /> : icon}
        </span>
      ) : null}
      {children}
    </>
  );

  if (href) {
    const handleAnchorClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      (onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined)?.(event);
    };

    return (
      <a
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        className={classes}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : rest.tabIndex}
        onClick={handleAnchorClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      ref={ref as React.Ref<HTMLButtonElement>}
      type={htmlType}
      className={classes}
      disabled={disabled}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
    >
      {content}
    </button>
  );
});

export const Link = LinkBase;
