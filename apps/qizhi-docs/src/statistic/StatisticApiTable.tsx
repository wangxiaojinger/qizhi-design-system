import { ApiTable } from "../api/ApiTable";

export function StatisticApiTable() {
  return (
    <section id="statistic-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#statistic-API">API</a>
      </h2>
      <p className="qizhi-api-section__note">
        只列出 QIZHI Statistic v1 已实现且属于本组件的能力。
      </p>
      <ApiTable api="statisticApi" label="Statistic API" />
    </section>
  );
}
