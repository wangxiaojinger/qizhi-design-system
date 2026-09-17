import { Timeline, TimelineItem } from "@wangxiaojinger/qizhi-react";

const items = (
  <>
    <TimelineItem position="right" label="2017-03-10">
      第一个里程碑
    </TimelineItem>
    <TimelineItem position="left" label="2018-05-12">
      第二个里程碑
    </TimelineItem>
    <TimelineItem position="right" label="2020-09-30">
      第三个里程碑
    </TimelineItem>
  </>
);

export default function ModeDemo() {
  return (
    <div className="timeline-docs-two-column timeline-docs-mode-grid">
      <Timeline mode="alternate">{items}</Timeline>
      <Timeline mode="right">
        <TimelineItem label="2017-03-10">第一个里程碑</TimelineItem>
        <TimelineItem label="2018-05-12">第二个里程碑</TimelineItem>
        <TimelineItem label="2020-09-30">第三个里程碑</TimelineItem>
      </Timeline>
    </div>
  );
}
