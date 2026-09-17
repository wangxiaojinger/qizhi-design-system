import { useState } from "react";
import { Statistic, Switch } from "@wangxiaojinger/qizhi-react";

export default function LoadingDemo() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="statistic-loading-demo">
      <div className="statistic-loading-demo__control">
        <Switch
          checked={loading}
          size="small"
          aria-label="切换数值加载状态"
          onChange={setLoading}
        />
        <span>加载中</span>
      </div>
      <Statistic title="下载" value={125670} loading={loading} />
    </div>
  );
}
