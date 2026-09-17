import { useState } from "react";
import { Slider, type SliderMultipleValue } from "@wangxiaojinger/qizhi-react";

export default function MultipleDemo() {
  const [value, setValue] = useState<SliderMultipleValue>([0, 20, 50]);
  return (
    <div className="slider-demo-stack">
      <Slider multiple value={value} onChange={setValue} aria-label="多点选择" />
      <code className="slider-demo-value">
        value: [{value.join(",")}]
      </code>
    </div>
  );
}
