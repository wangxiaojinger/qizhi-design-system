import { forwardRef, useState } from "react";
import type { MouseEvent } from "react";
import { LoadingIcon } from "../icon/LoadingIcon";
import type { SwitchProps } from "./Switch.types";

const joinClassNames = (...names: Array<string | false | undefined>) => names.filter(Boolean).join(" ");

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked = false,
    disabled = false,
    loading = false,
    size = "default",
    checkedText,
    uncheckedText,
    className,
    type = "button",
    tabIndex,
    onChange,
    onClick,
    ...buttonProps
  },
  ref,
) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const resolvedChecked = isControlled ? checked : internalChecked;
  const hasText = checkedText !== undefined || uncheckedText !== undefined;
  const displayText = resolvedChecked ? checkedText : uncheckedText;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    const nextChecked = !resolvedChecked;
    if (!isControlled) setInternalChecked(nextChecked);
    onChange?.(nextChecked, event);
    onClick?.(event);
  };

  return (
    <button
      {...buttonProps}
      ref={ref}
      type={type}
      role="switch"
      aria-checked={resolvedChecked}
      aria-disabled={disabled || loading || undefined}
      disabled={disabled}
      tabIndex={loading ? -1 : tabIndex}
      className={joinClassNames(
        "qizhi-switch",
        "qizhi-switch-type-circle",
        size === "small" && "qizhi-switch-small",
        resolvedChecked && "qizhi-switch-checked",
        loading && "qizhi-switch-loading",
        hasText && "qizhi-switch-with-text",
        className,
      )}
      onClick={handleClick}
    >
      <span className="qizhi-switch-dot" aria-hidden="true">
        {loading ? <span className="qizhi-switch-dot-icon"><LoadingIcon /></span> : null}
      </span>
      {hasText ? <span className="qizhi-switch-text">{displayText}</span> : null}
    </button>
  );
});
