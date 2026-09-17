import { forwardRef } from "react";
import { LoadingIcon } from "../icon/LoadingIcon";
import type { SpinProps } from "./Spin.types";
import "./spin.css";

const joinClassNames = (...names: Array<string | false | undefined>) =>
  names.filter(Boolean).join(" ");

export const Spin = forwardRef<HTMLDivElement, SpinProps>(function Spin(
  {
    loading = true,
    size = 20,
    tip,
    icon,
    block = false,
    children,
    className,
    "aria-label": ariaLabel,
    ...rootProps
  },
  ref,
) {
  const container = children !== undefined;
  const label = ariaLabel ?? "正在加载";
  const indicator = loading ? (
    <span className="qizhi-spin__indicator" aria-hidden="true">
      {icon ?? <LoadingIcon />}
    </span>
  ) : null;
  const status = loading ? (
    <div className="qizhi-spin__overlay" role="status" aria-label={label}>
      {tip !== undefined ? (
        <span className="qizhi-spin__overlay-content">
          {indicator}
          <span className="qizhi-spin__tip">{tip}</span>
        </span>
      ) : indicator}
    </div>
  ) : null;

  return (
    <div
      {...rootProps}
      ref={ref}
      className={joinClassNames(
        "qizhi-spin",
        `qizhi-spin--size-${size}`,
        container && "qizhi-spin--container",
        block && "qizhi-spin--block",
        loading && "is-loading",
        className,
      )}
      aria-label={!container && loading ? label : undefined}
      aria-busy={container ? loading : undefined}
      role={!container && loading ? "status" : undefined}
    >
      {container ? (
        <>
          <div className="qizhi-spin__children" inert={loading}>
            {children}
          </div>
          {status}
        </>
      ) : loading ? (
        tip !== undefined ? (
          <span className="qizhi-spin__overlay-content">
            {indicator}
            <span className="qizhi-spin__tip">{tip}</span>
          </span>
        ) : indicator
      ) : null}
    </div>
  );
});
