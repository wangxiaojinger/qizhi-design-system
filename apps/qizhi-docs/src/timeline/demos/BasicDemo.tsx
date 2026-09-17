import { useState } from "react";
import { Switch, Timeline, TimelineItem } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  const [reverse, setReverse] = useState(false);

  return (
    <div className="timeline-docs-panel">
      <div className="timeline-docs-controls">
        <span>倒序</span>
        <Switch
          size="small"
          checked={reverse}
          aria-label="倒序展示"
          onChange={setReverse}
        />
      </div>
      <Timeline reverse={reverse}>
        <TimelineItem label="2017-03-10">第一个里程碑</TimelineItem>
        <TimelineItem label="2018-05-12">第二个里程碑</TimelineItem>
        <TimelineItem label="2020-09-30">第三个里程碑</TimelineItem>
      </Timeline>
    </div>
  );
}
