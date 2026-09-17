import { Slider } from "@wangxiaojinger/qizhi-react";

export default function StatesDemo() {
  return (
    <div className="slider-demo-row">
      <Slider defaultValue={30} aria-label="默认状态" />
      <Slider defaultValue={30} disabled aria-label="禁用状态" />
    </div>
  );
}

