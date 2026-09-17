import { Progress } from "@wangxiaojinger/qizhi-react";

export default function StatusDemo() {
  return (
    <div className="progress-demo-stack">
      <Progress percent={30} aria-label="默认进度" />
      <Progress percent={30} color="#86909c" aria-label="自定义颜色进度" />
      <Progress percent={30} status="warning" aria-label="警告进度" />
      <Progress percent={30} status="danger" aria-label="错误进度" />
      <Progress percent={100} status="success" aria-label="成功进度" />
    </div>
  );
}
