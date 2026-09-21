import { Children, Fragment, forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import "./space.css";

export type SpaceSize = "mini" | "small" | "medium" | "large" | number;
export type SpaceSizeValue = SpaceSize | readonly [number, number];
export type SpaceDirection = "horizontal" | "vertical";
export type SpaceAlign = "start" | "center" | "end" | "baseline";

export interface SpaceProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  size?: SpaceSizeValue;
  direction?: SpaceDirection;
  align?: SpaceAlign;
  wrap?: boolean;
  split?: ReactNode;
}

export const Space = forwardRef<HTMLDivElement, SpaceProps>(function Space(
  {
    size = "small",
    direction = "horizontal",
    align,
    wrap = false,
    split,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  const resolvedAlign = align ?? (direction === "vertical" ? "start" : "center");
  const customGap = typeof size === "number"
    ? [size, size]
    : Array.isArray(size) ? size : undefined;
  const mergedStyle = customGap ? {
    ...style,
    "--qizhi-space-column-gap": `${customGap[0]}px`,
    "--qizhi-space-row-gap": `${customGap[1]}px`,
  } as CSSProperties : style;
  const items = Children.toArray(children);
  const content = split == null ? items : items.flatMap((child, index) => (
    index === 0 ? [child] : [<Fragment key={`split-${index}`}>{split}</Fragment>, child]
  ));

  return (
    <div
      {...rest}
      ref={ref}
      className={[
        "qizhi-space",
        `qizhi-space--${direction}`,
        `qizhi-space--align-${resolvedAlign}`,
        typeof size === "string" && `qizhi-space-size-${size}`,
        wrap && "qizhi-space--wrap",
        className,
      ].filter(Boolean).join(" ")}
      style={mergedStyle}
    >
      {content}
    </div>
  );
});
