import { Tabs } from "@wangxiaojinger/qizhi-react";
import { tabItems } from "./data";

export default function NestedDemo() {
  return (
    <Tabs
      position="left"
      items={[
        {
          key: 1,
          title: "Tab 1",
          content: <Tabs items={tabItems()} />,
        },
        { key: 2, title: "Tab 2", content: "标签二内容区。" },
        { key: 3, title: "Tab 3", content: "标签三内容区。" },
      ]}
    />
  );
}

