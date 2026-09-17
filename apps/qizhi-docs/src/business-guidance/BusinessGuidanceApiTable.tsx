import { ApiTable } from "../api/ApiTable";

export function BusinessGuidanceApiTable() {
  return (
    <section id="business-guidance-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#business-guidance-API">API</a>
      </h2>
      <h3>BusinessGuide</h3>
      <ApiTable api="businessGuideApi" label="BusinessGuide API" />
    </section>
  );
}
