import { useState } from "react";
import { Upload } from "@wangxiaojinger/qizhi-react";
import { demoRequest } from "./demoRequest";

export default function DragDemo() {
  const [message, setMessage] = useState("");
  return (
    <div className="upload-demo-drag">
      <span className="upload-demo-label">上传文件</span>
      <Upload
        drag
        multiple
        accept="image/*"
        customRequest={demoRequest}
        onReject={() => setMessage("不接受的文件类型，请重新上传指定文件类型~")}
      />
      <span className="upload-demo-feedback" role="alert">{message}</span>
    </div>
  );
}
