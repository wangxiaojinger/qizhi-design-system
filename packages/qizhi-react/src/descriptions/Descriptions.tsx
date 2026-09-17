import { forwardRef } from "react";
import type { DescriptionsComponent, DescriptionsItemProps, DescriptionsProps } from "./Descriptions.types";

const DescriptionsItem = forwardRef<HTMLDivElement, DescriptionsItemProps>(function DescriptionsItem(
  { children, label, className, ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref} className={["qizhi-descriptions__item", className].filter(Boolean).join(" ")}>
      <dt className="qizhi-descriptions__label">{label}</dt>
      <dd className="qizhi-descriptions__value">{children}</dd>
    </div>
  );
});

const DescriptionsRoot = forwardRef<HTMLDivElement, DescriptionsProps>(function Descriptions(
  {
    children,
    title,
    layout = "horizontal",
    labelAlign = "left",
    className,
    ...rest
  },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={[
        "qizhi-descriptions",
        `qizhi-descriptions-layout-${layout}`,
        `qizhi-descriptions-label-align-${labelAlign}`,
        className,
      ].filter(Boolean).join(" ")}
    >
      {title != null ? <div className="qizhi-descriptions__title">{title}</div> : null}
      <dl className="qizhi-descriptions__body">{children}</dl>
    </div>
  );
});

export const Descriptions = Object.assign(DescriptionsRoot, { Item: DescriptionsItem }) as DescriptionsComponent;
