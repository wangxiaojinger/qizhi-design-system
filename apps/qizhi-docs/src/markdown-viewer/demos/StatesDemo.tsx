import { MarkdownViewer } from "@wangxiaojinger/qizhi-react";

export default function StatesDemo() {
  return (
    <div className="content-viewer-demo-stack">
      <MarkdownViewer value={'<button onclick="alert(1)">这段 HTML 仅作为文字展示</button>'} />
      <div className="content-viewer-demo-grid">
        <MarkdownViewer value="" loading aria-label="加载状态 Markdown" />
        <MarkdownViewer value="" emptyText="暂无 Markdown 内容" aria-label="空状态 Markdown" />
      </div>
    </div>
  );
}
