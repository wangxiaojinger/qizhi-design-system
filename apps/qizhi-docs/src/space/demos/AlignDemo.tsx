import { useState } from "react";
import { Button, Segmented, Space, type SpaceAlign } from "@wangxiaojinger/qizhi-react";

const options = ["start", "center", "end", "baseline"].map((value) => ({ label: value, value }));

export default function AlignDemo() {
  const [align, setAlign] = useState<SpaceAlign>("center");
  return <div className="space-interactive-demo">
    <Segmented aria-label="选择对齐方式" options={options} value={align}
      onChange={(value) => setAlign(value as SpaceAlign)} />
    <Space align={align} className="space-align-preview" aria-live="polite">
      <span>Space:</span>
      <Button type="primary">Item2</Button>
      <article className="space-demo-card"><strong>Card</strong><span>Card content</span></article>
    </Space>
  </div>;
}
