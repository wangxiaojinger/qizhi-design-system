import { InputNumber } from "@wangxiaojinger/qizhi-react";

export default function PrecisionDemo() {
  return (
    <div className="input-number-demo-row">
      <InputNumber defaultValue={3.5} min={0} max={40} step={0.1} precision={1} aria-label="一位小数" />
      <InputNumber defaultValue={1.11} min={0} max={40} step={0.01} precision={2} aria-label="两位小数" />
    </div>
  );
}
