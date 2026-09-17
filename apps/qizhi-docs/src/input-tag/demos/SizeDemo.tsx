import { useState } from "react";
import { InputTag, Radio } from "@wangxiaojinger/qizhi-react";
import type { InputTagSize } from "@wangxiaojinger/qizhi-react";

const sizes: InputTagSize[] = ["small", "default", "large"];

export default function SizeDemo() {
  const [size, setSize] = useState<InputTagSize>("default");
  return (
    <div className="input-tag-size-demo">
      <Radio.Group
        type="button"
        name="input-tag-size"
        value={size}
        onChange={(value) => setSize(value as InputTagSize)}
        aria-label="标签输入框尺寸"
      >
        {sizes.map((item) => <Radio key={item} value={item}>{item}</Radio>)}
      </Radio.Group>
      <InputTag
        size={size}
        defaultValue={["北京", "上海"]}
        placeholder="请输入标签"
        aria-label="城市标签"
      />
    </div>
  );
}
