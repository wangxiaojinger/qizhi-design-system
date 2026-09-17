import { ApiTable } from "../api/ApiTable";
export function LogViewerApiTable() { return <section id="log-viewer-API" className="qizhi-api-section"><h2 className="qz-demo-title"><a tabIndex={-1} href="#log-viewer-API">API</a></h2><h3>LogViewer</h3><p className="qizhi-api-section__note">组件只接收日志数据和状态，不负责请求接口。</p><ApiTable api="logViewerApi" label="LogViewer API" /></section>; }
