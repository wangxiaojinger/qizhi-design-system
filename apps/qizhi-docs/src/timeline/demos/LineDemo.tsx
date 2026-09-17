import { Timeline, TimelineItem } from "@wangxiaojinger/qizhi-react";

export default function LineDemo() {
  return (
    <Timeline>
      <TimelineItem
        label="2017-03-10"
        description="这是一段描述信息"
        lineType="dashed"
      >
        第一个里程碑
      </TimelineItem>
      <TimelineItem
        label="2018-05-12"
        description="这是一段描述信息"
        lineType="dashed"
      >
        第二个里程碑
      </TimelineItem>
      <TimelineItem
        label="2020-09-30"
        description="这是一段描述信息"
      >
        第三个里程碑
      </TimelineItem>
    </Timeline>
  );
}
