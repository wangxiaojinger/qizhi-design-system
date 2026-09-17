import { Timeline, TimelineItem } from "@wangxiaojinger/qizhi-react";

export default function LabelDemo() {
  return (
    <div className="timeline-docs-two-column">
      <div>
        <div className="timeline-docs-caption">同侧</div>
        <Timeline>
          <TimelineItem label="2017-03-10">第一个里程碑</TimelineItem>
          <TimelineItem label="2018-05-12">第二个里程碑</TimelineItem>
        </Timeline>
      </div>
      <div>
        <div className="timeline-docs-caption">相对</div>
        <Timeline labelPosition="relative">
          <TimelineItem label="2017-03-10">第一个里程碑</TimelineItem>
          <TimelineItem label="2018-05-12">第二个里程碑</TimelineItem>
        </Timeline>
      </div>
    </div>
  );
}
