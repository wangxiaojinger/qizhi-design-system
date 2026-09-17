import { useEffect } from "react";
import { NotificationApiTable } from "./NotificationApiTable";
import { NotificationDemoCodebox } from "./NotificationDemoCodebox";
import { notificationDemos } from "./notificationDocs.registry";
import "./notificationDocs.css";

export function NotificationDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return <>
    <div className="qz-nav-intro">
      <p>组件 <span className="separator">/</span> <strong>反馈</strong></p>
      <h1 id="通知提醒框-notification">通知提醒框 Notification</h1>
      <p>全局展示通知提醒，将信息及时有效地传达给用户。</p>
    </div>
    <div className="component-examples qizhi-components-wrapper">
      {notificationDemos.map((demo) => (
        <NotificationDemoCodebox key={demo.id} demo={demo} />
      ))}
      <NotificationApiTable />
    </div>
  </>;
}
