import { Timeline, TimelineItem } from "@wangxiaojinger/qizhi-react";

export default function ContentDemo() {
  return (
    <Timeline>
      <TimelineItem dotColor="rgb(var(--success-6))" label="2017-03-10">
        第一个里程碑
      </TimelineItem>
      <TimelineItem label="2018-05-22">第二个里程碑</TimelineItem>
      <TimelineItem dotColor="rgb(var(--danger-6))" label="2020-06-22">
        第三个里程碑
      </TimelineItem>
      <TimelineItem label="2021-06-22">第四个里程碑</TimelineItem>
    </Timeline>
  );
}

