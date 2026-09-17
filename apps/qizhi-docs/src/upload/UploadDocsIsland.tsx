import { useEffect } from "react";
import { UploadApiTable } from "./UploadApiTable";
import { UploadDemoCodebox } from "./UploadDemoCodebox";
import { uploadDemos } from "./uploadDocs.registry";
import "./uploadDocs.css";

export function UploadDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return <><div className="qz-nav-intro"><p>组件 <span className="separator">/</span> <strong>数据输入</strong></p><h1>上传 Upload</h1><p>用户可传输文件或提交相应的内容。</p></div><div className="component-examples qizhi-components-wrapper">{uploadDemos.map((demo) => <UploadDemoCodebox key={demo.id} demo={demo} />)}<UploadApiTable /></div></>;
}
