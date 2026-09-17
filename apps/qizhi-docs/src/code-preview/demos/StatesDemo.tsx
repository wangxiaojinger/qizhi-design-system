import { CodePreview } from "@wangxiaojinger/qizhi-react";

export default function StatesDemo() {
  return (
    <div className="content-viewer-demo-grid">
      <CodePreview value="" loading aria-label="加载状态代码预览" />
      <CodePreview value="" emptyText="暂无可预览代码" aria-label="空状态代码预览" />
    </div>
  );
}
