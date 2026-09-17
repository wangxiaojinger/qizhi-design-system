import { Progress } from "@wangxiaojinger/qizhi-react";

const color = { 0: "#3366ff", 100: "#00b42a" };

export default function GradientDemo() {
  return (
    <div className="progress-demo-gradient">
      <div className="progress-demo-stack">
        <Progress percent={80} color={color} aria-label="渐变进度 80%" />
        <Progress
          percent={100}
          color={color}
          status="success"
          aria-label="渐变进度 100%"
        />
      </div>
      <div className="progress-demo-row">
        <Progress
          percent={80}
          type="circle"
          color={color}
          aria-label="渐变环形进度 80%"
        />
        <Progress
          percent={100}
          type="circle"
          color={color}
          status="success"
          aria-label="渐变环形进度 100%"
        />
      </div>
    </div>
  );
}
