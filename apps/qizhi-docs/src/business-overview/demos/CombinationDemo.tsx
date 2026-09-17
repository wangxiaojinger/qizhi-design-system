import { TaskOverview } from "@wangxiaojinger/qizhi-react";
import taskIcon from "../../../../../assets/qizhi-task-overview-item.svg";

const cardData = [
  ["interactive", "交互式建模", 23, "运行中", 12, false],
  ["distributed", "分布式训练", 12, "最近运行", 8, false],
  ["compute", "高性能计算", 19, "最近运行", 3, false],
  ["evaluation", "模型评测", 0, "进行中", 0, true],
  ["dedicated", "专属实例", 1, "服务中", 1, false],
  ["dynamic", "动态实例", 2, "服务中", 0, false],
] as const;

const tasks = [
  ["interactive", "maomao创建的交互式建模任务", "具身智能",
    "2 × NVIDIA A100（32GB），36核 CPU 450GB 内存", "19小时2分钟45秒"],
  ["interactive", "test0317", "拟人多模态大任务",
    "4核 CPU 32GB 内存", "3小时45分钟8秒"],
  ["interactive", "qhgao-gpu-1-codec", "具身智能",
    "4核 CPU 16GB 内存", "3小时45分钟8秒"],
  ["interactive", "dispider", "具身智能",
    "4核 CPU 32GB 内存", "12小时54分钟59秒"],
  ["interactive", "dev-setup-1", "拟人化强交互具身多模态",
    "72核 CPU 800GB 内存", "14小时54分钟6秒"],
  ["interactive", "vision-language-lab", "具身智能",
    "8核 CPU 64GB 内存", "6小时18分钟12秒"],
  ["interactive", "embodied-agent-debug", "具身智能",
    "8核 CPU 32GB 内存", "5小时27分钟36秒"],
  ["interactive", "multimodal-workbench", "拟人多模态大任务",
    "16核 CPU 64GB 内存", "9小时13分钟20秒"],
  ["interactive", "robot-policy-dev", "具身智能",
    "2 × NVIDIA A800（80GB）", "7小时42分钟11秒"],
  ["interactive", "vlm-experiment-04", "默认空间",
    "8核 CPU 48GB 内存", "4小时8分钟56秒"],
  ["interactive", "simulation-notebook", "具身智能",
    "16核 CPU 128GB 内存", "11小时26分钟18秒"],
  ["interactive", "agent-evaluation-dev", "默认空间",
    "4核 CPU 32GB 内存", "2小时39分钟7秒"],
  ["distributed", "distributed-train-a100", "默认空间",
    "8 × NVIDIA A100（80GB）", "2小时16分钟30秒"],
  ["distributed", "llm-pretrain-70b", "具身智能",
    "16 × NVIDIA H800（80GB）", "28小时11分钟5秒"],
  ["distributed", "distributed-finetune-01", "默认空间",
    "4 × NVIDIA A800（80GB）", "6小时15分钟42秒"],
  ["distributed", "multinode-training-02", "具身智能",
    "8 × NVIDIA H800（80GB）", "12小时31分钟10秒"],
  ["distributed", "foundation-model-train", "默认空间",
    "16 × NVIDIA A100（80GB）", "18小时20分钟3秒"],
  ["distributed", "distributed-eval-run", "具身智能",
    "4 × NVIDIA A100（40GB）", "3小时46分钟28秒"],
  ["distributed", "data-parallel-job", "默认空间",
    "8 × NVIDIA A800（80GB）", "7小时14分钟51秒"],
  ["distributed", "tensor-parallel-job", "具身智能",
    "8 × NVIDIA H800（80GB）", "9小时52分钟16秒"],
  ["compute", "hpc-simulation-01", "默认空间",
    "128核 CPU 512GB 内存", "8小时9分钟42秒"],
  ["compute", "hpc-simulation-02", "具身智能",
    "96核 CPU 384GB 内存", "5小时37分钟24秒"],
  ["compute", "scientific-compute-03", "默认空间",
    "64核 CPU 256GB 内存", "3小时22分钟18秒"],
  ["dedicated", "custom-service-prod", "默认空间",
    "4核 CPU 16GB 内存", "36小时20分钟18秒"],
] as const;

export default function CombinationDemo() {
  return (
    <TaskOverview
      defaultType="interactive"
      spaces={["全部", "具身智能", "默认空间"]}
      metrics={cardData.map(([
        key, title, total, label, value, disabled,
      ]) => ({
        key, title, total, label, value, disabled,
        info: key === "dedicated"
          ? "统计自定义服务，专属实力数据"
          : undefined,
      }))}
      tasks={tasks.map((task) => ({
        key: task[1],
        type: task[0],
        name: task[1],
        space: task[2],
        spaceValue: task[2],
        resource: task[3],
        duration: task[4],
        status: "运行中",
        icon: <img src={taskIcon} alt="" />,
      }))}
    />
  );
}
