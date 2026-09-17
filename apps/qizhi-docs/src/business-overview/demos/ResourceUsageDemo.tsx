import { ResourceUsageCard } from "@wangxiaojinger/qizhi-react";

export default function ResourceUsageDemo() {
  return (
    <div className="business-overview-demo__row">
      <ResourceUsageCard
        title="GPU（卡数）"
        value="189 / 224"
        percent={84.38}
      />
      <ResourceUsageCard title="CPU（核）" value="1,355 / 不限制" />
    </div>
  );
}
