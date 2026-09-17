import { forwardRef, useId, type CSSProperties, type ReactNode } from "react";
import { CheckCircleIcon, CheckIcon, CloseIcon } from "../icon";
import { CircleCloseFilledIcon } from "../icon/generated/catalog/CircleCloseFilledIcon";
import { WarningFilledIcon } from "../icon/generated/prompt/WarningFilledIcon";
import type { ProgressGradient, ProgressProps } from "./Progress.types";

type ProgressStyle = CSSProperties & Record<`--qizhi-progress-${string}`, string>;

const join = (...values: Array<string | false | undefined>) =>
  values.filter(Boolean).join(" ");

const clamp = (value: number) => Math.min(100, Math.max(0, value));

const gradient = (value: ProgressGradient) => Object.entries(value)
  .map(([stop, color]) => [Number(stop), color] as const)
  .sort(([a], [b]) => a - b)
  .map(([stop, color]) => `${color} ${stop}%`)
  .join(", ");

const icon = (className: string, child: ReactNode) => (
  <span className={`qizhi-progress__status-icon ${className}`}>{child}</span>
);

const statusIcon = (
  status: ProgressProps["status"],
  type: ProgressProps["type"],
): ReactNode => {
  if (status === "warning") {
    return icon(
      "qizhi-progress__status-icon--warning-filled",
      <WarningFilledIcon aria-hidden="true" />,
    );
  }
  if (status === "danger") {
    return type === "circle"
      ? icon("qizhi-progress__status-icon--close", <CloseIcon aria-hidden="true" />)
      : icon(
          "qizhi-progress__status-icon--circle-close-filled",
          <CircleCloseFilledIcon aria-hidden="true" />,
        );
  }
  if (status === "success") {
    return type === "circle"
      ? icon("qizhi-progress__status-icon--check", <CheckIcon aria-hidden="true" />)
      : icon(
          "qizhi-progress__status-icon--circle-check-filled",
          <CheckCircleIcon aria-hidden="true" />,
        );
  }
  return null;
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(
    {
      percent = 0,
      type = "line",
      status = "normal",
      size = "default",
      color,
      trailColor,
      animation = false,
      steps,
      stepWidth,
      strokeWidth,
      className,
      style,
      "aria-label": ariaLabel = "进度",
      ...rootProps
    },
    ref,
  ) {
    const gradientId = `qizhi-progress-gradient-${useId().replace(/:/g, "")}`;
    const value = clamp(percent);
    const resolvedSize = type === "line" && size === "mini" ? "default" : size;
    const gradientValue = typeof color === "object" ? gradient(color) : null;
    const progressStyle: ProgressStyle = {
      ...style,
      "--qizhi-progress-percent": `${value}%`,
      ...(typeof color === "string"
        ? { "--qizhi-progress-color": color }
        : {}),
      ...(gradientValue
        ? { "--qizhi-progress-fill": `linear-gradient(90deg, ${gradientValue})` }
        : {}),
      ...(trailColor ? { "--qizhi-progress-trail": trailColor } : {}),
      ...(strokeWidth
        ? { "--qizhi-progress-stroke": `${strokeWidth}px` }
        : {}),
      ...(stepWidth
        ? { "--qizhi-progress-step-width": `${stepWidth}px` }
        : {}),
      ...(steps
        ? { "--qizhi-progress-step-count": String(Math.floor(steps)) }
        : {}),
    };
    const statusContent = statusIcon(status, type);
    const text = statusContent || `${value}%`;

    return (
      <div
        {...rootProps}
        ref={ref}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className={join(
          "qizhi-progress",
          `qizhi-progress--${type}`,
          `qizhi-progress--${resolvedSize}`,
          status !== "normal" && `qizhi-progress--${status}`,
          animation && type === "line" && "qizhi-progress--animated",
          steps !== undefined && type === "line" && "qizhi-progress--steps",
          stepWidth !== undefined && type === "line"
            && "qizhi-progress--fixed-steps",
          gradientValue !== null && "qizhi-progress--gradient",
          className,
        )}
        style={progressStyle}
      >
        {type === "circle" ? (
          <>
            <svg className="qizhi-progress__circle" viewBox="0 0 100 100" aria-hidden="true">
              {gradientValue ? (
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                    {Object.entries(color as ProgressGradient)
                      .map(([stop, stopColor]) => [Number(stop), stopColor] as const)
                      .sort(([a], [b]) => a - b)
                      .map(([stop, stopColor]) => (
                        <stop key={stop} offset={`${stop}%`} stopColor={stopColor} />
                      ))}
                  </linearGradient>
                </defs>
              ) : null}
              <circle className="qizhi-progress__circle-trail" cx="50" cy="50" r="46" />
              <circle
                className="qizhi-progress__circle-fill"
                cx="50"
                cy="50"
                r="46"
                pathLength="100"
                style={gradientValue ? { stroke: `url(#${gradientId})` } : undefined}
              />
            </svg>
            {resolvedSize !== "mini" || statusContent ? (
              <span className="qizhi-progress__circle-text">{text}</span>
            ) : null}
          </>
        ) : (
          <>
            {steps && steps > 0 ? (
              <span className="qizhi-progress__steps" aria-hidden="true">
                {Array.from({ length: Math.floor(steps) }, (_, index) => (
                  <span
                    key={index}
                    className={join(
                      "qizhi-progress__step",
                      index < Math.ceil(value / (100 / steps))
                        && "qizhi-progress__step--active",
                    )}
                  />
                ))}
              </span>
            ) : (
              <span className="qizhi-progress__track" aria-hidden="true">
                <span className="qizhi-progress__fill" />
              </span>
            )}
            <span className="qizhi-progress__text">{text}</span>
          </>
        )}
      </div>
    );
  },
);
