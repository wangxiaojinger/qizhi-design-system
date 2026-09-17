import { InputNumber } from "@wangxiaojinger/qizhi-react";

export default function ButtonModeDemo() {
  return (
    <div className="input-number-demo-row">
      <InputNumber mode="button" defaultValue={500} aria-label="按钮模式数字输入框" />
      <InputNumber mode="button" defaultValue={500} disabled aria-label="禁用按钮模式数字输入框" />
    </div>
  );
}
