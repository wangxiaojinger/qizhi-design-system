import { forwardRef } from "react";
import type { DividerProps } from "./Divider.types";
import "./divider.css";

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  {
    children,
    type = "horizontal",
    lineStyle = "solid",
    orientation = "center",
    className,
    ...rest
  },
  ref,
) {
  const hasText = type === "horizontal" && children != null;
  const classes = [
    "qizhi-divider",
    `qizhi-divider--${type}`,
    `qizhi-divider--${lineStyle}`,
    hasText && "qizhi-divider--with-text",
    hasText && `qizhi-divider--orientation-${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...rest}
      ref={ref}
      className={classes}
      role="separator"
      aria-orientation={type}
    >
      {hasText ? <span className="qizhi-divider__text">{children}</span> : null}
    </div>
  );
});
