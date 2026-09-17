import { createContext, forwardRef, useContext, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "../button/Button";
import type { AvatarComponent, AvatarGroupProps, AvatarProps, AvatarSize } from "./Avatar.types";

type AvatarStyle = CSSProperties & { "--qizhi-avatar-content-scale"?: number };
const AvatarGroupSizeContext = createContext<AvatarSize | null>(null);

const AvatarRoot = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    children,
    size = "default",
    shape = "circle",
    triggerIcon,
    triggerType = "button",
    onTriggerClick,
    triggerAriaLabel = "操作头像",
    className,
    style,
    ...rest
  },
  forwardedRef,
) {
  const groupSize = useContext(AvatarGroupSizeContext);
  const resolvedSize = groupSize ?? size;
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const contentRef = useRef<HTMLSpanElement | null>(null);
  const [contentScale, setContentScale] = useState(1);

  useLayoutEffect(() => {
    const updateScale = () => {
      const root = rootRef.current;
      const content = contentRef.current;
      if (!root || !content || root.clientWidth <= 0 || content.scrollWidth <= 0) {
        setContentScale(1);
        return;
      }
      setContentScale(Math.min(1, (root.clientWidth * 0.8) / content.scrollWidth));
    };
    updateScale();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(updateScale);
    observer.observe(rootRef.current!);
    observer.observe(contentRef.current!);
    return () => observer.disconnect();
  }, [children, resolvedSize]);

  const mergedStyle: AvatarStyle = {
    ...style,
    "--qizhi-avatar-content-scale": contentScale,
  };

  return (
    <span
      {...rest}
      ref={(node) => {
        rootRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      className={[
        "qizhi-avatar",
        `qizhi-avatar-size-${resolvedSize}`,
        `qizhi-avatar-shape-${shape}`,
        triggerIcon && onTriggerClick && "qizhi-avatar-has-trigger",
        className,
      ].filter(Boolean).join(" ")}
      style={mergedStyle}
    >
      <span ref={contentRef} className="qizhi-avatar__content">{children}</span>
      {triggerIcon && onTriggerClick ? (
        <Button
          type="primary"
          size="mini"
          iconOnly
          icon={triggerIcon}
          className={`qizhi-avatar-trigger-${triggerType}`}
          aria-label={triggerAriaLabel}
          onClick={onTriggerClick}
        />
      ) : null}
    </span>
  );
});

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { children, size = "default", className, ...rest },
  ref,
) {
  return (
    <AvatarGroupSizeContext.Provider value={size}>
      <div
        {...rest}
        ref={ref}
        className={["qizhi-avatar-group", `qizhi-avatar-group-size-${size}`, className].filter(Boolean).join(" ")}
      >
        {children}
      </div>
    </AvatarGroupSizeContext.Provider>
  );
});

export const Avatar = Object.assign(AvatarRoot, { Group: AvatarGroup }) as AvatarComponent;
