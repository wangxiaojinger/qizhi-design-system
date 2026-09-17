import { ApiTable } from "../api/ApiTable";

export function NotificationApiTable() {
  return <section id="通知提醒框-api" className="qizhi-api-section">
    <h2 className="qz-demo-title"><a tabIndex={-1} href="#通知提醒框-api">API</a></h2>
    <h3>Notification</h3>
    <ApiTable api="notificationApi" label="Notification API" />
    <h3>使用方法</h3>
    <p><code>Notification.info / success / warning / error / normal</code></p>
    <p><code>Notification.remove(id) / clear()</code></p>
    <h3>全局设置</h3>
    <p><code>Notification.config(options)</code></p>
    <ApiTable api="notificationConfigApi" label="Notification.config API" />
  </section>;
}
