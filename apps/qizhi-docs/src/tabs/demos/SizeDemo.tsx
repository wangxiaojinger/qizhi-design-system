import { Tabs } from "@wangxiaojinger/qizhi-react";

const items = (label: string) => [
  { key: 1, title: label, content: null },
  { key: 2, title: "标签2", content: null },
];

export default function SizeDemo() {
  return (
    <div className="tabs-docs-size">
      <Tabs items={items("Small")} size="small" />
      <Tabs items={items("Default")} />
      <Tabs items={items("Large")} size="large" />
    </div>
  );
}

