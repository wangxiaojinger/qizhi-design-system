import { InfoIcon } from "../icon/InfoIcon";
import { Tooltip } from "../tooltip/Tooltip";
import type {
  MetricCardProps,
  MetricItemProps,
  ObjectMetricsProps,
  ResourceUsageCardProps,
} from "./BusinessMetrics.types";
import "./businessMetrics.css";

const classes = (...values: Array<string | false | undefined>) => (
  values.filter(Boolean).join(" ")
);

const MetricInfo = ({ content, label }: {
  content: MetricCardProps["info"];
  label: string;
}) => (
  <Tooltip content={content}>
    <span className="qizhi-metric-info" tabIndex={0} aria-label={label}>
      <InfoIcon />
    </span>
  </Tooltip>
);

const MetricCardContent = ({
  title,
  info,
  total,
  label,
  value,
  unit = "个",
}: Pick<
  MetricCardProps,
  "title" | "info" | "total" | "label" | "value" | "unit"
>) => (
  <>
    <span className="qizhi-metric-card__head">
      <span className="qizhi-metric-card__title">
        {title}
        {info === undefined ? null : (
          <MetricInfo content={info} label={`查看${String(title)}说明`} />
        )}
      </span>
      <span className="qizhi-metric-card__total">
        共 <strong>{total}</strong> 个
      </span>
    </span>
    <span className="qizhi-metric-card__primary">
      <span>{label}</span><strong>{value}</strong><span>{unit}</span>
    </span>
  </>
);

export function MetricCard(props: MetricCardProps) {
  const { selected, disabled, onClick, className, ...content } = props;
  const classNames = classes(
    "qizhi-metric-card",
    selected && "is-selected is-selected-primary",
    disabled && "is-disabled",
    className,
  );
  if (onClick || disabled) {
    return (
      <button
        type="button"
        className={classNames}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        aria-pressed={disabled ? undefined : Boolean(selected)}
        onClick={onClick}
      >
        <MetricCardContent {...content} />
      </button>
    );
  }
  return <article className={classNames}><MetricCardContent {...content} /></article>;
}

export function ResourceUsageCard({
  title,
  value,
  percent,
  className,
  ...rest
}: ResourceUsageCardProps) {
  return (
    <article {...rest} className={classes("qizhi-resource-card", className)}>
      <h3>{title}</h3>
      <div className="qizhi-resource-card__body">
        <strong>{value}</strong>
        {percent === undefined ? null : (
          <>
            <span className="qizhi-resource-card__divider" aria-hidden="true" />
            <div>
              <div
                className="qizhi-resource-meter"
                role="meter"
                aria-label="GPU 分配率"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <span style={{ width: `${100 - percent}%` }} />
              </div>
              <p>GPU 分配率：{percent}%</p>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

export function MetricItem({ label, value, info, className, ...rest }: MetricItemProps) {
  return (
    <div {...rest} className={classes("qizhi-metric-item", className)}>
      <span>{label}</span>
      <span className="qizhi-metric-item__value">
        <strong>{value}</strong>
        {info === undefined ? null : (
          <MetricInfo content={info} label={`查看${String(label)}说明`} />
        )}
      </span>
    </div>
  );
}

export function ObjectMetrics({
  title,
  summaryLabel,
  summaryValue,
  children,
  className,
  ...rest
}: ObjectMetricsProps) {
  return (
    <article {...rest} className={classes("qizhi-object-metrics", className)}>
      <div className="qizhi-object-metrics__head">
        <h3>{title}</h3>
        <p>{summaryLabel} <strong>{summaryValue}</strong></p>
      </div>
      <div className="qizhi-object-metrics__items">{children}</div>
    </article>
  );
}
