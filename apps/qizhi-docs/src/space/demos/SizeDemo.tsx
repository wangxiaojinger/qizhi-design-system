import { useState } from "react";
import { Button, Segmented, Space, type SpaceSize } from "@wangxiaojinger/qizhi-react";

const options = ["mini", "small", "medium", "large"].map((value) => ({ label: value, value }));

export default function SizeDemo() {
  const [size, setSize] = useState<SpaceSize>("small");
  return <div className="space-interactive-demo">
    <Segmented aria-label="选择间距尺寸" options={options} value={size}
      onChange={(value) => setSize(value as SpaceSize)} />
    <Space size={size} aria-live="polite">
      <Button type="primary">Item1</Button>
      <Button type="primary">Item2</Button>
      <Button type="primary">Item3</Button>
    </Space>
  </div>;
}
