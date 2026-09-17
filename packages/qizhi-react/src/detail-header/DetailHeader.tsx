import { forwardRef, useId } from "react";
import type { DetailHeaderProps } from "./DetailHeader.types";

export const DetailHeader = forwardRef<HTMLElement, DetailHeaderProps>(function DetailHeader(
  { icon, title, status, action, properties = [], audit, tabs, className, ...rest },
  ref,
) {
  const reactId = useId().replace(/:/g, "");
  const titleId = `qizhi-detail-header-${reactId}-title`;
  const classes = ["qizhi-detail-header", className].filter(Boolean).join(" ");

  return (
    <article ref={ref} className={classes} aria-labelledby={titleId} {...rest}>
      <div className="qizhi-detail-header__main">
        {icon ? (
          <span className="qizhi-detail-header__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <div className="qizhi-detail-header__content">
          <div className="qizhi-detail-header__title-row">
            <h2 id={titleId}>{title}</h2>
            {status ? (
              <span className={`qizhi-detail-header__status qizhi-detail-header__status--${status.tone}`}>
                <span className="qizhi-detail-header__status-dot" aria-hidden="true" />
                <span>{status.label}</span>
              </span>
            ) : null}
            {action ? <span className="qizhi-detail-header__action">{action}</span> : null}
          </div>
          {properties.length ? (
            <dl className="qizhi-detail-header__properties">
              {properties.map((property, index) => (
                <div
                  key={index}
                  className={property.plain
                    ? "qizhi-detail-header__property--plain"
                    : undefined}
                >
                  <dt>{property.label}</dt>
                  <dd>{property.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {audit ? <div className="qizhi-detail-header__audit">{audit}</div> : null}
        </div>
      </div>
      {tabs ? <div className="qizhi-detail-header__tabs">{tabs}</div> : null}
    </article>
  );
});
