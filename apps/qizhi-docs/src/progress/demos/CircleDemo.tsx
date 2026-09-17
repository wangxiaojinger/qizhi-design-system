import { Progress } from "@wangxiaojinger/qizhi-react";

export default function CircleDemo() {
  return (
    <div className="progress-demo-row">
      <Progress percent={20} type="circle" aria-label="默认环形进度" />
      <Progress
        percent={20}
        type="circle"
        status="warning"
        aria-label="警告环形进度"
      />
      <Progress
        percent={20}
        type="circle"
        status="danger"
        aria-label="错误环形进度"
      />
      <Progress
        percent={100}
        type="circle"
        status="success"
        aria-label="成功环形进度"
      />
    </div>
  );
}
