import { ChartView } from "./ChartView";
import type { LineChartProps } from "./Chart.types";
export function LineChart(props: LineChartProps) { return <ChartView {...props} kind="line" />; }
