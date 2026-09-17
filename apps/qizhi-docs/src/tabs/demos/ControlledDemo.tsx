import { useState } from "react";
import { Tabs } from "@wangxiaojinger/qizhi-react";
import type { TabsKey } from "@wangxiaojinger/qizhi-react";
import { tabItems } from "./data";

export default function ControlledDemo() {
  const [activeKey, setActiveKey] = useState<TabsKey>(2);
  return (
    <Tabs
      items={tabItems()}
      activeKey={activeKey}
      onChange={setActiveKey}
    />
  );
}

