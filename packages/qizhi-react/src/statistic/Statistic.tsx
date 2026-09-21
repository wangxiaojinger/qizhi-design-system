import { forwardRef } from "react";
import { Skeleton } from "../skeleton/Skeleton";
import type { StatisticFormat, StatisticProps } from "./Statistic.types";
import "./statistic.css";

const joinClassNames = (...names: Array<string | false | undefined>) =>
  names.filter(Boolean).join(" ");

const pad = (value: number) => String(value).padStart(2, "0");

const formatDate = (value: number | string, format: StatisticFormat) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  if (format !== "YYYY/MM/DD HH:mm:ss") return String(value);

  return [
    date.getFullYear(),
    "/",
    pad(date.getMonth() + 1),
    "/",
    pad(date.getDate()),
    " ",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":",
    pad(date.getSeconds()),
  ].join("");
};

const getDateTime = (value: number | string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":",
    pad(date.getSeconds()),
  ].join("");
};

const formatNumber = (value: number, precision?: number) => {
  const options = precision === undefined
    ? { maximumFractionDigits: 20 }
    : {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      };
  return new Intl.NumberFormat("en-US", options).format(value);
};

function StatisticValue({
  value,
  precision,
}: Pick<StatisticProps, "value" | "precision">) {
  const formatted = typeof value === "number"
    ? formatNumber(value, precision)
    : value;
  const decimalIndex = formatted.lastIndexOf(".");
  if (decimalIndex < 0) return <>{formatted}</>;

  return (
    <>
      {formatted.slice(0, decimalIndex)}
      <span className="qizhi-statistic__decimal">
        {formatted.slice(decimalIndex)}
      </span>
    </>
  );
}

export const Statistic = forwardRef<HTMLDivElement, StatisticProps>(
  function Statistic(
    {
      value,
      title,
      prefix,
      suffix,
      extra,
      precision,
      format,
      valueStyle,
      loading = false,
      className,
      ...rootProps
    },
    ref,
  ) {
    const valueContent = format
      ? formatDate(value, format)
      : <StatisticValue value={value} precision={precision} />;
    const valueClassName = joinClassNames(
      "qizhi-statistic__value",
      format && "qizhi-statistic__value--time",
    );
    const valueElement = format ? (
      <time
        className={valueClassName}
        style={valueStyle}
        dateTime={getDateTime(value)}
      >
        {valueContent}
      </time>
    ) : (
      <div className={valueClassName} style={valueStyle}>
        {prefix !== undefined ? (
          <span className="qizhi-statistic__prefix">{prefix}</span>
        ) : null}
        {valueContent}
        {suffix !== undefined ? (
          <span className="qizhi-statistic__suffix">{suffix}</span>
        ) : null}
      </div>
    );

    return (
      <div
        {...rootProps}
        ref={ref}
        className={joinClassNames("qizhi-statistic", className)}
      >
        {title !== undefined ? (
          <div className="qizhi-statistic__title">{title}</div>
        ) : null}
        <div className="qizhi-statistic__content" aria-live="polite">
          {loading ? (
            <Skeleton
              className="qizhi-statistic__skeleton"
              animation
              text={{ rows: 1, widths: [80] }}
              aria-label="数值加载中"
            />
          ) : valueElement}
        </div>
        {extra !== undefined && !loading ? (
          <div className="qizhi-statistic__extra">{extra}</div>
        ) : null}
      </div>
    );
  },
);
