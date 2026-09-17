import { Progress } from "@wangxiaojinger/qizhi-react";

export default function StepsDemo() {
  return (
    <div className="progress-demo-stack">
      <Progress percent={30} steps={3} aria-label="三步任务进度" />
      <Progress
        percent={100}
        steps={5}
        status="warning"
        aria-label="五步警告任务进度"
      />
      <Progress
        percent={50}
        steps={5}
        stepWidth={16}
        strokeWidth={8}
        status="success"
        aria-label="五步紧凑任务进度"
      />
    </div>
  );
}
