import { ApiTable } from "../api/ApiTable";
export function BusinessOverviewApiTable() {
  return (
    <section id="business-overview-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#business-overview-API">API</a>
      </h2>
      <p className="qizhi-api-section__note">
        只列出 QIZHI 概览与指标公共组件已实现的能力。
      </p>
      <h3>MetricCard</h3>
      <ApiTable api="metricCardApi" label="MetricCard API" />
      <h3>ResourceUsageCard</h3>
      <ApiTable
        api="resourceUsageCardApi"
        label="ResourceUsageCard API"
      />
      <h3>MetricItem</h3>
      <ApiTable api="metricItemApi" label="MetricItem API" />
      <h3>ObjectMetrics</h3>
      <ApiTable api="objectMetricsApi" label="ObjectMetrics API" />
      <h3>TaskOverview</h3>
      <ApiTable api="taskOverviewApi" label="TaskOverview API" />
    </section>
  );
}
