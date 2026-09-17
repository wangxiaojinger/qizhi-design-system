import { Progress } from "@wangxiaojinger/qizhi-react";

const trailColor = "#e8f3ff";

export default function TrailDemo() {
  return (
    <div className="progress-demo-stack">
      <Progress
        percent={30}
        trailColor={trailColor}
        strokeWidth={4}
        aria-label="线形剩余进度"
      />
      <Progress
        percent={30}
        steps={4}
        trailColor={trailColor}
        strokeWidth={4}
        aria-label="步骤剩余进度"
      />
      <Progress
        percent={30}
        type="circle"
        trailColor={trailColor}
        strokeWidth={4}
        aria-label="环形剩余进度"
      />
    </div>
  );
}
