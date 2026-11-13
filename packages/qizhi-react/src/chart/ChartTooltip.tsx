import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ChartSeries } from "./Chart.types";
import { colorTokenCss, seriesColorToken } from "./chartModel";

export interface ChartTooltipProps {
  id: string; anchor: { x: number; y: number }; title: string;
  kind?: "line" | "bar";
  barBounds?: { left: number; right: number };
  plotLeft?: number;
  items: { series: ChartSeries; index: number; value: string }[];
}
export function ChartTooltip({ id, anchor, title, items, kind, barBounds, plotLeft = 0 }: ChartTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: anchor.x, top: anchor.y });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const update = () => {
      const rect = ref.current!.getBoundingClientRect(); const gap = 12; const edge = 8;
      const rightAnchor = barBounds ? plotLeft + barBounds.right : anchor.x;
      const leftAnchor = barBounds ? plotLeft + barBounds.left : anchor.x;
      const left = rightAnchor + gap + rect.width <= window.innerWidth - edge
        ? rightAnchor + gap : Math.max(edge, leftAnchor - gap - rect.width);
      const top = Math.min(window.innerHeight - edge - rect.height, Math.max(edge, anchor.y - rect.height / 2));
      setPosition({ left, top });
    };
    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(ref.current); return () => observer?.disconnect();
  }, [anchor.x, anchor.y, barBounds?.left, barBounds?.right, plotLeft, title, items]);
  return createPortal(<div ref={ref} id={id} className="qizhi-chart-tooltip" role="tooltip" data-kind={kind} style={position}>
    <strong>{title}</strong>
    {items.map(item => <div className="qizhi-chart-tooltip__row" key={item.series.key}>
      <span className="qizhi-chart__swatch" aria-hidden="true" style={{ backgroundColor: colorTokenCss(seriesColorToken(item.series, item.index)) }} />
      <span>{item.series.label}</span><span className="qizhi-chart-tooltip__value">{item.value}</span>
    </div>)}
  </div>, document.body);
}
