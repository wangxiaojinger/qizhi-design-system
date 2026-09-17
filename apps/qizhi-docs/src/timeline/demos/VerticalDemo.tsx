import { Timeline, TimelineItem } from "@wangxiaojinger/qizhi-react";

export default function VerticalDemo() {
  return (
    <div className="timeline-docs-two-column">
      <Timeline>
        <TimelineItem label="2017-03-10">左侧时间轴</TimelineItem>
        <TimelineItem label="2018-05-12">纵向默认</TimelineItem>
        <TimelineItem label="2020-09-30">结束里程碑</TimelineItem>
      </Timeline>
      <Timeline mode="right">
        <TimelineItem label="2017-03-10">右侧时间轴</TimelineItem>
        <TimelineItem label="2018-05-12">纵向右侧</TimelineItem>
        <TimelineItem label="2020-09-30">结束里程碑</TimelineItem>
      </Timeline>
    </div>
  );
}
