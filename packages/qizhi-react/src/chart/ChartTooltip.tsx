import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getFittedFloatingPlacement } from "../overlay/floatingPosition";
import type { ChartSeries } from "./Chart.types";
import { colorTokenCss, seriesColorToken } from "./chartModel";

export interface ChartTooltipProps {
  id: string; anchor: { x: number; y: number }; title: string;
  items: { series: ChartSeries; index: number; value: string }[];
}
export function ChartTooltip({ id, anchor, title, items }: ChartTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: anchor.x, top: anchor.y });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const update = () => setPosition(getFittedFloatingPlacement(new DOMRect(anchor.x, anchor.y, 0, 0), ref.current!.getBoundingClientRect(), "top"));
    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(ref.current); return () => observer?.disconnect();
  }, [anchor.x, anchor.y, title, items]);
  return createPortal(<div ref={ref} id={id} className="qizhi-chart-tooltip" role="tooltip" style={position}>
    <strong>{title}</strong>
    {items.map(item => <div className="qizhi-chart-tooltip__row" key={item.series.key}>
      <span className="qizhi-chart__swatch" aria-hidden="true" style={{ backgroundColor: colorTokenCss(seriesColorToken(item.series, item.index)) }} />
      <span>{item.series.label}</span><span className="qizhi-chart-tooltip__value">{item.value}</span>
    </div>)}
  </div>, document.body);
}
