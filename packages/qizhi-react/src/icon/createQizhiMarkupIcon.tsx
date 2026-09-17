import { forwardRef, useId } from "react";
import type { QizhiIconProps } from "./QizhiIcon.types";

type QizhiIconDefaultProps = Partial<QizhiIconProps> & Record<`data-${string}`, string | number | undefined>;

export function createQizhiMarkupIcon(
  displayName: string,
  viewBox: string,
  approvedMarkup: string,
  defaultProps: QizhiIconDefaultProps = {},
) {
  const Icon = forwardRef<SVGSVGElement, QizhiIconProps>(function QizhiMarkupIcon(
    { size = "1em", title, width, height, role, "aria-hidden": ariaHidden, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...rest },
    ref,
  ) {
    const reactId = useId().replace(/[^A-Za-z0-9_-]/g, "");
    const idPrefix = `qizhi-icon-${reactId}`;
    const titleId = title ? `${idPrefix}-title` : undefined;
    const labelledBy = [titleId, ariaLabelledBy].filter(Boolean).join(" ") || undefined;
    const hasAccessibleName = Boolean(title || ariaLabel || ariaLabelledBy);
    const markup = approvedMarkup.replaceAll("__QIZHI_ICON_ID__", idPrefix);

    return (
      <svg
        {...defaultProps}
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
        <g dangerouslySetInnerHTML={{ __html: markup }} />
      </svg>
    );
  });

  Icon.displayName = displayName;
  return Icon;
}
