import {
  CheckCircleIcon,
  TimeIcon,
  Timeline,
  TimelineItem,
} from "@wangxiaojinger/qizhi-react";

export default function CustomDotDemo() {
  return (
    <div className="timeline-docs-custom-grid">
      <Timeline>
        <TimelineItem dotColor="rgb(var(--success-6))" label="2020-04-12">
          第一个里程碑
        </TimelineItem>
        <TimelineItem label="2020-05-17">第二个里程碑</TimelineItem>
        <TimelineItem
          dot={<TimeIcon className="timeline-docs-dot timeline-docs-dot-time" />}
          label="2020-06-22"
        >
          第三个里程碑
        </TimelineItem>
        <TimelineItem dotColor="rgb(var(--gray-5))" label="2020-06-22">
          第三个里程碑
        </TimelineItem>
      </Timeline>
      <Timeline>
        <TimelineItem
          dot={<CheckCircleIcon className="timeline-docs-dot" />}
          label="2020-04-12"
        >
          第一个里程碑
        </TimelineItem>
        <TimelineItem
          dot={<CheckCircleIcon className="timeline-docs-dot" />}
          label="2020-05-17"
        >
          第二个里程碑
        </TimelineItem>
        <TimelineItem label="2020-06-22">第三个里程碑</TimelineItem>
        <TimelineItem dotColor="rgb(var(--gray-5))" label="2020-06-22">
          第三个里程碑
        </TimelineItem>
      </Timeline>
      <Timeline>
        <TimelineItem label="2020-04-12">第一个里程碑</TimelineItem>
        <TimelineItem dotColor="rgb(var(--gray-5))" label="2020-05-17">
          第二个里程碑
        </TimelineItem>
        <TimelineItem dotColor="rgb(var(--gray-5))" label="2020-06-22">
          第三个里程碑
        </TimelineItem>
      </Timeline>
    </div>
  );
}
