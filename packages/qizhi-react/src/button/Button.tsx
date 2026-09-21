import { forwardRef, useEffect } from "react";
import { LoadingIcon } from "../icon";
import type { ButtonClassName, ButtonHandle, ButtonProps } from "./Button.types";
import "./button.css";

const joinClassName = (className?: ButtonClassName) =>
  Array.isArray(className) ? className.filter(Boolean).join(" ") : className;

const withSafeBlankRel = (target?: string, rel?: string) => {
  if (target !== "_blank") return rel;
  const tokens = new Set(rel?.split(/\s+/).filter(Boolean));
  tokens.add("noopener");
  tokens.add("noreferrer");
  return [...tokens].join(" ");
};

const ButtonBase = forwardRef<ButtonHandle, ButtonProps>(function Button(
  {
    type = "default",
    size = "default",
    status = "default",
    icon,
    iconPosition = "before",
    iconOnly,
    loading = false,
    loadingFixedWidth = false,
    long = false,
    htmlType = "button",
    href,
    target,
    anchorProps,
    className,
    children,
    disabled,
    onClick,
    ...rest
  },
  ref,
) {
  const visualType = type === "default" ? "secondary" : type;
  const isIconOnly = iconOnly || (!children && children !== 0 && (icon || loading));
  const accessibleName =
    rest["aria-label"] || rest["aria-labelledby"] || rest.title || anchorProps?.["aria-label"] || anchorProps?.title;

  useEffect(() => {
    if (import.meta.env.DEV && isIconOnly && !accessibleName) {
      console.warn("[QIZHI Button] 纯图标按钮必须提供可访问名称，例如 aria-label。");
    }
  }, [accessibleName, isIconOnly]);

  const classes = [
    "qizhi-btn",
    `qizhi-btn-${visualType}`,
    `qizhi-btn-size-${size}`,
    status !== "default" && `qizhi-btn-status-${status}`,
    icon && "qizhi-btn-has-icon",
    isIconOnly && "qizhi-btn-icon-only",
    loadingFixedWidth && "qizhi-btn-loading-fixed-width",
    loading && "is-loading",
    disabled && "is-disabled",
    long && "qizhi-btn-long",
    joinClassName(className),
  ]
    .filter(Boolean)
    .join(" ");

  const iconNode = loading ? (
    <span
      className="qizhi-btn__icon qizhi-btn__loading-icon"
      aria-hidden="true"
    >
      <LoadingIcon />
    </span>
  ) : icon ? (
    <span className="qizhi-btn__icon" aria-hidden="true">{icon}</span>
  ) : null;
  const labelNode = children ? (
    <span className="qizhi-btn__label">{children}</span>
  ) : null;
  const content = iconPosition === "after" && !loading ? (
    <>{labelNode}{iconNode}</>
  ) : (
    <>{iconNode}{labelNode}</>
  );

  if (href) {
    const mergedTarget = target ?? anchorProps?.target;
    const mergedRel = withSafeBlankRel(mergedTarget, rest.rel ?? anchorProps?.rel);
    const handleLinkClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
      if (disabled || loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    return (
      <a
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        {...anchorProps}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={disabled ? undefined : href}
        target={mergedTarget}
        rel={mergedRel}
        className={classes}
        aria-disabled={disabled || undefined}
        aria-busy={loading || undefined}
        tabIndex={disabled ? -1 : (anchorProps?.tabIndex ?? rest.tabIndex)}
        onClick={handleLinkClick}
      >
        {content}
      </a>
    );
  }

  const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (loading || disabled) {
      event.preventDefault();
      return;
    }
    (onClick as React.MouseEventHandler<HTMLButtonElement> | undefined)?.(event);
  };

  return (
    <button
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      ref={ref as React.Ref<HTMLButtonElement>}
      type={htmlType}
      className={classes}
      disabled={disabled}
      aria-busy={loading || undefined}
      onClick={handleButtonClick}
    >
      {content}
    </button>
  );
});

export const Button = ButtonBase;
