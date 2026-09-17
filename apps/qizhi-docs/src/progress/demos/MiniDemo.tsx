import { Progress } from "@wangxiaojinger/qizhi-react";

const values = [0, 40, 70, 100];

export default function MiniDemo() {
  return (
    <div className="progress-demo-mini-groups">
      <div className="progress-demo-mini-row">
        {values.map((percent) => (
          <Progress
            key={percent}
            percent={percent}
            type="circle"
            size="mini"
            strokeWidth={2}
            status={percent === 100 ? "success" : "normal"}
            aria-label={`进度 ${percent}%`}
          />
        ))}
      </div>
      <div className="progress-demo-mini-row">
        {values.map((percent) => (
          <Progress
            key={percent}
            percent={percent}
            type="circle"
            size="mini"
            strokeWidth={4}
            status={percent === 100 ? "success" : "normal"}
            aria-label={`粗线进度 ${percent}%`}
          />
        ))}
      </div>
    </div>
  );
}
