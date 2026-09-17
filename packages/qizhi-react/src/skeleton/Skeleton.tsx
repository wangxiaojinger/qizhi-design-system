import { forwardRef, type CSSProperties } from "react";
import type {
  SkeletonImageConfig,
  SkeletonProps,
  SkeletonTextConfig,
  SkeletonWidth,
} from "./Skeleton.types";
import "./skeleton.css";

const joinClassNames = (...names: Array<string | false | undefined>) =>
  names.filter(Boolean).join(" ");

const defaultWidths: readonly SkeletonWidth[] = ["100%", "100%", "60%"];

const widthValue = (width: SkeletonWidth): CSSProperties["width"] => (
  typeof width === "number" ? `min(100%, ${width}px)` : width
);

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton(
    {
      animation = false,
      image = false,
      text = true,
      className,
      "aria-label": ariaLabel = "内容加载中",
      ...rootProps
    },
    ref,
  ) {
    const imageConfig: SkeletonImageConfig = typeof image === "object"
      ? image
      : {};
    const imageSize = imageConfig.size ?? 48;
    const imageShape = imageConfig.shape ?? "square";
    const textConfig: SkeletonTextConfig = typeof text === "object"
      ? text
      : {};
    const rows = Math.max(0, Math.floor(textConfig.rows ?? 3));
    const widths = textConfig.widths ?? defaultWidths;

    return (
      <div
        {...rootProps}
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        className={joinClassNames(
          "qizhi-skeleton",
          animation && "qizhi-skeleton--animated",
          className,
        )}
      >
        {image ? (
          <div className="qizhi-skeleton__header" aria-hidden="true">
            <span
              className={joinClassNames(
                "qizhi-skeleton__image",
                `qizhi-skeleton__image--${imageShape}`,
              )}
              style={{ width: imageSize, height: imageSize }}
            />
          </div>
        ) : null}
        {text ? (
          <div className="qizhi-skeleton__content" aria-hidden="true">
            <span className="qizhi-skeleton__text">
              {Array.from({ length: rows }, (_, index) => (
                <span
                  key={index}
                  className="qizhi-skeleton__row"
                  style={{ width: widthValue(widths[index] ?? "100%") }}
                />
              ))}
            </span>
          </div>
        ) : null}
      </div>
    );
  },
);
