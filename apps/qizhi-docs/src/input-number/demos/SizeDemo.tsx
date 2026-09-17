import { useState } from "react";
import { InputNumber, Radio } from "@wangxiaojinger/qizhi-react";
import type { InputNumberSize } from "@wangxiaojinger/qizhi-react";

const sizes: InputNumberSize[] = ["small", "default", "large"];

export default function SizeDemo() {
  const [size, setSize] = useState<InputNumberSize>("default");
  return (
    <div className="input-number-size-demo">
      <Radio.Group
        type="button"
        name="input-number-size"
        value={size}
        onChange={(value) => setSize(value as InputNumberSize)}
        aria-label="数字输入框尺寸"
      >
        {sizes.map((item) => <Radio key={item} value={item}>{item}</Radio>)}
      </Radio.Group>
      <div className="input-number-demo-row">
        <InputNumber size={size} defaultValue={2} max={20} aria-label="内嵌模式尺寸示例" />
        <InputNumber mode="button" size={size} defaultValue={2} max={20} aria-label="按钮模式尺寸示例" />
      </div>
    </div>
  );
}
