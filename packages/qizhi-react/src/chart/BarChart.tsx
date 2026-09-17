import { ChartView } from "./ChartView";
import type { BarChartProps } from "./Chart.types";
export function BarChart(props: BarChartProps) { return <ChartView {...props} kind="bar" />; }
