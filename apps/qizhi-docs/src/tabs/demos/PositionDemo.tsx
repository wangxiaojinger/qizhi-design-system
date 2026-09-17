import { useState } from "react";
import { Tabs } from "@wangxiaojinger/qizhi-react";
import type { TabsPosition } from "@wangxiaojinger/qizhi-react";
import { DemoSegmentedControl } from "../../demo-controls/DemoSegmentedControl";
import { tabItems } from "./data";

export default function PositionDemo() {
  const [position, setPosition] = useState<TabsPosition>("left");
  return (
    <div className="tabs-docs-position">
      <DemoSegmentedControl
        value={position}
        onChange={setPosition}
        aria-label="页签位置"
        options={[
          { label: "left", value: "left" },
          { label: "top", value: "top" },
          { label: "right", value: "right" },
        ]}
      />
      <Tabs items={tabItems()} position={position} />
    </div>
  );
}

