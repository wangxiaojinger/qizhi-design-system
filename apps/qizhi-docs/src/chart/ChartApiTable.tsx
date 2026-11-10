import { ApiTable } from "../api/ApiTable";

export function ChartApiTable() {
  return (
    <section id="chart-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#chart-API">组件接口</a></h2>
      <p className="chart-api-note">
        图表不接收底层引擎配置；业务页面只使用启智公共组件。
      </p>
      <h3>LineChart（折线图组件）与 BarChart（柱状图组件）公共属性</h3>
      <ApiTable api="chartCommonApi" label="图表公共 API（接口）" />
      <h3>BarChart（柱状图组件）专属属性</h3>
      <ApiTable api="barChartApi" label="BarChart（柱状图组件）API（接口）" />
      <h3>ChartDatum（图表数据点）</h3>
      <ApiTable api="chartDatumApi" label="ChartDatum（图表数据点）API（接口）" />
      <h3>FocusedItem（聚焦数据项）</h3>
      <ApiTable api="focusedItemApi" label="聚焦数据项接口" />
      <h3>ChartSeries（图表系列）</h3>
      <ApiTable api="chartSeriesApi" label="ChartSeries（图表系列）API（接口）" />
      <h3>DateTimeRangePicker（时间范围）</h3>
      <ApiTable api="timeRangePickerApi" label="时间范围接口" />
      <h3>GranularitySelect（聚合粒度）</h3>
      <ApiTable api="granularitySelectApi" label="聚合粒度接口" />
    </section>
  );
}
