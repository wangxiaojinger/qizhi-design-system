import { ApiTable } from "../api/ApiTable";

export function MessageApiTable() {
  return <section id="全局提示-api" className="qizhi-api-section">
    <h2 className="qz-demo-title"><a tabIndex={-1} href="#全局提示-api">API</a></h2>
    <h3 id="全局提示-api-message">Message</h3>
    <ApiTable api="messageApi" label="Message API" />
    <h3 id="全局提示-使用方法">使用方法</h3>
    <ul className="qizhi-message-api-methods">
      <li><code>Message.info / success / warning / error / normal / loading</code></li>
      <li><code>Message.clear()</code></li>
    </ul>
    <h3 id="全局提示-全局设置">全局设置</h3>
    <p><code>Message.config(options)</code></p>
    <ApiTable api="messageConfigApi" label="Message.config API" />
  </section>;
}
