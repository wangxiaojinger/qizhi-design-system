import { ApiTable } from "../api/ApiTable";

export function TimelineApiTable() {
  return (
    <section id="timeline-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#timeline-API">
          API
        </a>
      </h2>
      <p className="qizhi-api-section__note">
        只列出 QIZHI Timeline v1 已实现且属于本组件的能力。
      </p>
      <h3>Timeline</h3>
      <ApiTable api="timelineApi" label="Timeline API" />
      <h3>TimelineItem</h3>
      <ApiTable api="timelineItemApi" label="TimelineItem API" />
    </section>
  );
}

