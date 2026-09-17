import { Timeline, TimelineItem } from "@wangxiaojinger/qizhi-react";

export default function HorizontalDemo() {
  return (
    <Timeline direction="horizontal">
      <TimelineItem label="2017-03-10">开始</TimelineItem>
      <TimelineItem label="2018-05-12">处理中</TimelineItem>
      <TimelineItem label="2020-09-30">完成</TimelineItem>
    </Timeline>
  );
}
