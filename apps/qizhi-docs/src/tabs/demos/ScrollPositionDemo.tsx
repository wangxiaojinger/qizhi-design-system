import { useState } from "react";
import { Tabs } from "@wangxiaojinger/qizhi-react";
import type {
  TabsPosition,
  TabsScrollPosition,
} from "@wangxiaojinger/qizhi-react";
import { DemoSegmentedControl } from "../../demo-controls/DemoSegmentedControl";
import { scrollItems } from "./data";

export default function ScrollPositionDemo() {
  const [position, setPosition] = useState<TabsPosition>("top");
  const [scrollPosition, setScrollPosition] =
    useState<TabsScrollPosition>("center");
  return (
    <div className="tabs-docs-scroll">
      <div className="tabs-docs-controls">
        <DemoSegmentedControl
          value={position}
          onChange={setPosition}
          aria-label="滚动方向"
          options={[
            { label: "水平", value: "top" },
            { label: "垂直", value: "left" },
          ]}
        />
        <DemoSegmentedControl
          value={scrollPosition}
          onChange={setScrollPosition}
          aria-label="滚动偏移位置"
          options={[
            { label: "起始", value: "start" },
            { label: "居中", value: "center" },
            { label: "末尾", value: "end" },
          ]}
        />
      </div>
      <Tabs
        className="qizhi-tabs--scrolling"
        items={scrollItems}
        defaultActiveKey={3}
        position={position}
        scrollPosition={scrollPosition}
      />
    </div>
  );
}
