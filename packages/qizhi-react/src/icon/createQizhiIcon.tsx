import {
  forwardRef,
  useId,
  type ReactElement,
} from "react";
import type { QizhiIconProps } from "./QizhiIcon.types";

export function createQizhiIcon(
  displayName: string,
  viewBox: string,
  path: ReactElement,
) {
  const Icon = forwardRef<SVGSVGElement, QizhiIconProps>(function QizhiIcon(
    {
      size = "1em",
      title,
      width,
      height,
      role,
      "aria-hidden": ariaHidden,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    },
    ref,
  ) {
    const reactId = useId().replace(/:/g, "");
    const titleId = title ? `qizhi-icon-${reactId}-title` : undefined;
    const labelledBy = [titleId, ariaLabelledBy].filter(Boolean).join(" ") || undefined;
    const hasAccessibleName = Boolean(title || ariaLabel || ariaLabelledBy);

    return (
      <svg
        ref={ref}
        viewBox={viewBox}
        width={width ?? size}
        height={height ?? size}
        focusable="false"
        role={role ?? (hasAccessibleName ? "img" : undefined)}
        aria-hidden={ariaHidden ?? (hasAccessibleName ? undefined : true)}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        {...rest}
      >
        {title ? <title id={titleId}>{title}</title> : null}
        {path}
      </svg>
    );
  });

  Icon.displayName = displayName;
  return Icon;
}
