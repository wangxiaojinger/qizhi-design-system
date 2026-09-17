import { useState } from "react";
import { PlatformShell } from "@wangxiaojinger/qizhi-react";

export default function FrameworkPreviewDemo() {
  const [selectedKey, setSelectedKey] = useState("workbench");

  return (
    <PlatformShell
      className="layout-framework-demo"
      stickyHeader
      selectedKey={selectedKey}
      onSelect={setSelectedKey}
    >
      <div className="layout-framework-demo__content">内容区</div>
    </PlatformShell>
  );
}
