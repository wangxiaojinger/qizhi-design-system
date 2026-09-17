import {
  Children,
  Fragment,
  cloneElement,
  forwardRef,
  isValidElement,
} from "react";
import type { ReactElement, ReactNode } from "react";
import type {
  TimelineItemInternalProps,
  TimelineItemProps,
  TimelineProps,
  TimelineStyle,
} from "./Timeline.types";

const classes = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

const flattenItems = (children: ReactNode): ReactNode[] =>
  Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenItems(child.props.children)
      : [child],
  );

export const TimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  function TimelineItem(
    {
      children,
      label,
      description,
      dot,
      dotColor,
      dotType = "hollow",
      lineType = "solid",
      position,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const internal = rest as TimelineItemInternalProps;
    const { isLast, labelPosition = "same", ...nativeProps } = internal;
    const timelineStyle: TimelineStyle = {
      ...style,
      ...(dotColor ? { "--qizhi-timeline-dot-color": dotColor } : null),
    };
    const content = (
      <div className="qizhi-timeline-item-content">{children}</div>
    );
    const labelNode = label !== undefined && label !== null ? (
      <div className="qizhi-timeline-item-label">{label}</div>
    ) : null;

    return (
      <div
        {...nativeProps}
        ref={ref}
        role="listitem"
        className={classes(
          "qizhi-timeline-item",
          isLast && "qizhi-timeline-item-last",
          position && `qizhi-timeline-item-position-${position}`,
          `qizhi-timeline-item-line-${lineType}`,
          className,
        )}
        style={timelineStyle}
      >
        <div className="qizhi-timeline-item-dot-wrapper" aria-hidden="true">
          <div className="qizhi-timeline-item-line" />
          <div className="qizhi-timeline-item-dot-content">
            {dot ?? (
              <span
                className={classes(
                  "qizhi-timeline-item-dot",
                  `qizhi-timeline-item-dot-${dotType}`,
                )}
              />
            )}
          </div>
        </div>
        <div className="qizhi-timeline-item-content-wrapper">
          {labelPosition === "relative" ? labelNode : content}
          {description !== undefined && description !== null ? (
            <div className="qizhi-timeline-item-description">
              {description}
            </div>
          ) : null}
          {labelPosition === "relative" ? content : labelNode}
        </div>
      </div>
    );
  },
);

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  function Timeline(
    {
      children,
      direction = "vertical",
      mode = "left",
      reverse = false,
      labelPosition = "same",
      pending,
      pendingDot,
      className,
      ...rest
    },
    ref,
  ) {
    const childItems = flattenItems(children);
    const orderedItems = reverse ? [...childItems].reverse() : childItems;
    const allItems =
      pending !== undefined && pending !== null
        ? [
            ...orderedItems,
            <TimelineItem key="qizhi-timeline-pending" dot={pendingDot}>
              {pending}
            </TimelineItem>,
          ]
        : orderedItems;

    return (
      <div
        {...rest}
        ref={ref}
        role="list"
        className={classes(
          "qizhi-timeline",
          `qizhi-timeline-direction-${direction}`,
          `qizhi-timeline-mode-${direction === "horizontal" ? "left" : mode}`,
          `qizhi-timeline-label-${labelPosition}`,
          reverse && "qizhi-timeline-reverse",
          pending !== undefined &&
            pending !== null &&
            "qizhi-timeline-pending",
          className,
        )}
      >
        {allItems.map((child, index) =>
          isValidElement<TimelineItemProps>(child)
            ? cloneElement(
                child as ReactElement<TimelineItemInternalProps>,
                {
                  isLast: index === allItems.length - 1,
                  labelPosition,
                },
              )
            : child,
        )}
      </div>
    );
  },
);
