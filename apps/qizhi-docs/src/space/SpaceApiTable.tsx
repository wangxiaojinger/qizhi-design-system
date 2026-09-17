import { ApiTable } from "../api/ApiTable";

export function SpaceApiTable() {
  return <section id="space-API" className="qizhi-space-api">
    <h2 className="qz-demo-title"><a tabIndex={-1} href="#space-API">API</a></h2>
    <h3>Space</h3>
    <ApiTable api="spaceApi" label="Space API" />
    <h3>SpaceSize</h3>
    <pre className="qizhi-space-type-definition" aria-label="SpaceSize 类型定义"><code>{'export type SpaceSize = "mini" | "small" | "medium" | "large" | number;'}</code></pre>
  </section>;
}
