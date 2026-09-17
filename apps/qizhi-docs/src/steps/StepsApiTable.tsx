import { ApiTable } from "../api/ApiTable";

export function StepsApiTable() {
  return (
    <section id="steps-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#steps-API">API</a>
      </h2>
      <h3>Steps</h3>
      <ApiTable api="stepsApi" label="Steps API" />
    </section>
  );
}
