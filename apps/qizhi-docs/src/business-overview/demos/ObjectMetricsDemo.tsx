import { MetricItem, ObjectMetrics } from "@wangxiaojinger/qizhi-react";

export default function ObjectMetricsDemo() {
  return (
    <ObjectMetrics
      title="七宝机房"
      summaryLabel="剩余可分配节点数"
      summaryValue={80}
    >
      <MetricItem label="节点数" value={200} />
      <MetricItem label="已分配节点数" value={100} />
      <MetricItem
        label="异常节点数"
        value={20}
        info="包含离线和故障节点"
      />
    </ObjectMetrics>
  );
}
