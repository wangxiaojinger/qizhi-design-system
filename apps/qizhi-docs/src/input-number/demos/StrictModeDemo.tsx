import { InputNumber } from "@wangxiaojinger/qizhi-react";

export default function StrictModeDemo() {
  return (
    <InputNumber
      className="input-number-strict-demo"
      mode="button"
      strictMode
      defaultValue="100000000000000000000"
      aria-label="高精度数字输入框"
    />
  );
}
