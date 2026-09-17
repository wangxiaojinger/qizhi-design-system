import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import "./contentViewer.css";

interface TextViewportProps extends Pick<HTMLAttributes<HTMLDivElement>, "onScroll"> {
  children: ReactNode;
  className?: string;
  maxHeight?: number | string;
  wrap?: boolean;
  "aria-label"?: string;
}

const toCssSize = (value: number | string | undefined) => {
  if (typeof value === "number") return `${value}px`;
  return value ?? "none";
};

export const TextViewport = forwardRef<HTMLDivElement, TextViewportProps>(function TextViewport({
  children,
  className,
  maxHeight,
  wrap = false,
  "aria-label": ariaLabel,
  onScroll,
}, ref) {
  return (
    <div
      ref={ref}
      className={[
        "qizhi-content-viewer",
        wrap && "qizhi-content-viewer--wrap",
        className,
      ].filter(Boolean).join(" ")}
      style={{
        "--qizhi-content-viewer-max-height": toCssSize(maxHeight),
      } as CSSProperties}
      aria-label={ariaLabel}
      tabIndex={0}
      onScroll={onScroll}
    >
      {children}
    </div>
  );
});
