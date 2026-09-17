import { BillingBudgetCard } from "@wangxiaojinger/qizhi-react";

export default function BillingBudgetCardDemo() {
  return (
    <BillingBudgetCard
      model="Moonshot-v1-128k"
      instanceCount={1}
      settlementMethod="后付费（按小时）"
      settlementCycle="小时"
      price="10.00"
      priceUnit="点券/小时"
      formula={<>*计费公式 = 实例数 × 资源单价<br />
        <span>（不满 1 小时按 1 小时计费）</span></>}
      budget="10,000 点券"
    />
  );
}
