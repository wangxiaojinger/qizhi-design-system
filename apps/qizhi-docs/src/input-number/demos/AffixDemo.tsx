import { InputNumber } from "@wangxiaojinger/qizhi-react";

export default function AffixDemo() {
  return (
    <div className="input-number-demo-row">
      <InputNumber defaultValue={50} min={0} suffix="%" aria-label="百分比" />
      <InputNumber defaultValue={500} min={0} step={100} prefix="¥" aria-label="金额" />
      <InputNumber mode="button" defaultValue={500} min={0} step={100} prefix="¥" aria-label="按钮模式金额" />
    </div>
  );
}
