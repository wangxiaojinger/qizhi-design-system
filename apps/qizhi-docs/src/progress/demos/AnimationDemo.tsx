import { Progress } from "@wangxiaojinger/qizhi-react";

export default function AnimationDemo() {
  return (
    <div className="progress-demo-stack">
      <Progress percent={80} animation aria-label="动画进度" />
      <Progress
        percent={80}
        status="danger"
        animation
        aria-label="错误动画进度"
      />
    </div>
  );
}
