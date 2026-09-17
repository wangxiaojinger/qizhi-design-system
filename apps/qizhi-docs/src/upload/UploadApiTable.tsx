import { ApiTable } from "../api/ApiTable";

export function UploadApiTable() {
  return <section id="upload-API" className="qizhi-api-section"><h2 className="qz-demo-title"><a tabIndex={-1} href="#upload-API">API</a></h2><h3>Upload</h3><ApiTable api="uploadApi" label="Upload API" /></section>;
}
