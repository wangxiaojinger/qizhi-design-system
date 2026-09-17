import { useState } from "react";
import { Progress, type ProgressSize } from "@wangxiaojinger/qizhi-react";
import { DemoSegmentedControl } from "../../demo-controls/DemoSegmentedControl";

type DemoProgressSize = Exclude<ProgressSize, "mini">;

export default function SizeDemo() {
  const [size, setSize] = useState<DemoProgressSize>("default");
  return (
    <div className="progress-demo-size">
      <DemoSegmentedControl
        value={size}
        options={["small", "default", "large"]}
        onChange={setSize}
        aria-label="进度条尺寸"
      />
      <div className="progress-demo-size-preview">
        <Progress
          percent={90}
          size={size}
          status="success"
          aria-label="尺寸示例线性进度"
        />
        <Progress
          percent={90}
          type="circle"
          size={size}
          status="success"
          aria-label="尺寸示例环形进度"
        />
      </div>
    </div>
  );
}
