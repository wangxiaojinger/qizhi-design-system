import { LoadingIcon, Timeline, TimelineItem } from "@wangxiaojinger/qizhi-react";

export default function PendingDemo() {
  return (
    <Timeline
      pending="记录中..."
      pendingDot={<LoadingIcon className="timeline-docs-pending-dot" />}
    >
      <TimelineItem dotColor="rgb(var(--success-6))" label="2017-03-10">
        第一个里程碑
      </TimelineItem>
      <TimelineItem label="2018-05-12">第二个里程碑</TimelineItem>
      <TimelineItem label="2020-09-30">第三个里程碑</TimelineItem>
    </Timeline>
  );
}
