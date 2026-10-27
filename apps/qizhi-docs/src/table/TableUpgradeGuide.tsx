import { MarkdownViewer } from "@wangxiaojinger/qizhi-react";
import guide from "../../../../docs/releases/v0.5.0-table-upgrade.md?raw";

// The section supplies the routable heading; keep inner headings out of the demo TOC.
const content = guide.replace(/^# .+\n/, "").replace(/^## /gm, "#### ");

export function TableUpgradeGuide() {
  return (
    <section id="table-upgrade-v050" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a href="#table-upgrade-v050">v0.5.0 业务升级接入说明</a>
      </h2>
      <MarkdownViewer value={content} aria-label="Table v0.5.0 业务升级接入说明" />
    </section>
  );
}
