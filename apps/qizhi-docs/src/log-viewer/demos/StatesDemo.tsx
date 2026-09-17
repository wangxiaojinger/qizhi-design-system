import { LogViewer } from "@wangxiaojinger/qizhi-react";

export default function StatesDemo() {
  return (
    <div className="content-viewer-demo-grid">
      <LogViewer logs={[]} emptyText="暂无运行日志" levelFilter={[]} />
      <LogViewer logs={[]} status="error" emptyText="日志获取失败" levelFilter={[]} />
    </div>
  );
}
