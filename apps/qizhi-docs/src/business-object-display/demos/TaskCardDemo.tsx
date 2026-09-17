import { HomeIcon, TaskCard } from "@wangxiaojinger/qizhi-react";
import taskIcon from "../../../../../assets/qizhi-task-overview-item.svg";

export default function TaskCardDemo() {
  return (
    <TaskCard
      name="maomao创建的交互式建模任务"
      space={<><HomeIcon />具身智能</>}
      resource="2 × NVIDIA A100（32GB），36核 CPU 450GB 内存"
      duration="19小时2分钟45秒"
      status="运行中"
      icon={<img src={taskIcon} alt="" />}
    />
  );
}
