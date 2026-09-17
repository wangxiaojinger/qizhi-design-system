import { forwardRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { CloseIcon } from "../icon";
import type { TagPresetColor, TagProps } from "./Tag.types";

const presetColors = new Set<TagPresetColor>([
  "red", "orangered", "orange", "gold", "lime", "green", "cyan",
  "blue", "qizhiblue", "purple", "pinkpurple", "magenta", "gray",
]);

type TagStyle = CSSProperties & { "--qizhi-tag-custom-color"?: string };

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  {
    children,
    icon,
    size = "default",
    color,
    bordered = false,
    closable = false,
    closeAriaLabel = "关闭标签",
    visible,
    onClose,
    checkable = false,
    checked,
    defaultChecked = false,
    onChange,
    className,
    style,
    role,
    tabIndex,
    onClick,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const [internalVisible, setInternalVisible] = useState(true);
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isVisible = visible ?? internalVisible;
  const isChecked = checked ?? internalChecked;
  const presetColor = color && presetColors.has(color as TagPresetColor) ? color as TagPresetColor : undefined;
  const mergedStyle: TagStyle = { ...style };
  if (color && !presetColor) mergedStyle["--qizhi-tag-custom-color"] = color;

  if (!isVisible) return null;

  const toggle = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    if (!checkable) return;
    const nextChecked = !isChecked;
    if (checked === undefined) setInternalChecked(nextChecked);
    onChange?.(nextChecked, event);
  };

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    toggle(event);
    onClick?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (checkable && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      toggle(event);
    }
    onKeyDown?.(event);
  };

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (visible === undefined) setInternalVisible(false);
    onClose?.(event);
  };

  const classes = [
    "qizhi-tag",
    `qizhi-tag-size-${size}`,
    presetColor && `qizhi-tag-${presetColor}`,
    color && !presetColor && "qizhi-tag-custom-color",
    bordered && "qizhi-tag-bordered",
    closable && "qizhi-tag-closable",
    checkable && "qizhi-tag-checkable",
    (!checkable || isChecked) && "qizhi-tag-checked",
    className,
  ].filter(Boolean).join(" ");

  return (
    <span
      {...rest}
      ref={ref}
      className={classes}
      style={mergedStyle}
      role={checkable ? "checkbox" : role}
      tabIndex={checkable ? (tabIndex ?? 0) : tabIndex}
      aria-checked={checkable ? isChecked : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {icon ? <span className="qizhi-tag-icon" aria-hidden="true">{icon}</span> : null}
      <span className="qizhi-tag-content">{children}</span>
      {closable ? (
        <button className="qizhi-tag-close-btn" type="button" aria-label={closeAriaLabel} onClick={handleClose}>
          <CloseIcon />
        </button>
      ) : null}
    </span>
  );
});
