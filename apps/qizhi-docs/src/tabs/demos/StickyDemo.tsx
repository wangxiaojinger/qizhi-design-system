import { Tabs } from "@wangxiaojinger/qizhi-react";

export default function StickyDemo() {
  return (
    <div className="tabs-docs-sticky-shell">
      <Tabs
        className="tabs-docs-sticky"
        items={[
          { key: 1, title: "规范", content: "规范内容。" },
          { key: 2, title: "组件", content: "组件内容。" },
          { key: 3, title: "资源", content: "资源内容。" },
        ]}
      />
      <div className="tabs-docs-sticky-space" aria-hidden="true" />
    </div>
  );
}

