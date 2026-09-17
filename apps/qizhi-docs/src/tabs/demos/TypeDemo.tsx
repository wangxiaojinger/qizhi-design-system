import { useState } from "react";
import { Radio, Tabs } from "@wangxiaojinger/qizhi-react";
import type { TabsType } from "@wangxiaojinger/qizhi-react";

const types: readonly TabsType[] = [
  "line",
  "card",
  "card-gutter",
  "text",
  "capsule",
];

export default function TypeDemo() {
  const [type, setType] = useState<TabsType>("line");
  return (
    <div className="tabs-docs-type">
      <Radio.Group
        value={type}
        onChange={(value) => setType(value as TabsType)}
        options={types}
        aria-label="页签类型"
      />
      <Tabs
        type={type}
        defaultActiveKey={3}
        items={[
          { key: 1, title: "Tab 1", content: "标签一内容区。" },
          {
            key: 2,
            title: "Tab 2",
            content: "标签二内容区。",
            disabled: true,
          },
          { key: 3, title: "Tab 3", content: "标签三内容区。" },
          { key: 4, title: "Tab 4", content: "标签四内容区。" },
        ]}
      />
    </div>
  );
}

