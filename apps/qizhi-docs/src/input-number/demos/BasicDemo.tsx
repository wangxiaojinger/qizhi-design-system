import { InputNumber } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  return (
    <div className="input-number-demo-row">
      <InputNumber min={0} max={15} placeholder="Please enter" aria-label="基础数字输入框" />
      <InputNumber defaultValue={500} disabled aria-label="禁用数字输入框" />
    </div>
  );
}
