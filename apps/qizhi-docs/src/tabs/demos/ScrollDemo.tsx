import { useState } from "react";
import { Tabs } from "@wangxiaojinger/qizhi-react";
import type { TabsPosition } from "@wangxiaojinger/qizhi-react";
import { DemoSegmentedControl } from "../../demo-controls/DemoSegmentedControl";
import { scrollItems } from "./data";

export default function ScrollDemo() {
  const [position, setPosition] = useState<TabsPosition>("top");
  return (
    <div className="tabs-docs-scroll">
      <DemoSegmentedControl
        value={position}
        onChange={setPosition}
        aria-label="滚动方向"
        options={[
          { label: "水平", value: "top" },
          { label: "垂直", value: "left" },
        ]}
      />
      <Tabs
        className="qizhi-tabs--scrolling"
        items={scrollItems}
        position={position}
      />
    </div>
  );
}

