import { Button, CloudUploadIcon, Upload } from "@wangxiaojinger/qizhi-react";
import { demoRequest } from "./demoRequest";

export default function BasicDemo() {
  return (
    <div className="upload-demo-basic">
      <Upload multiple customRequest={demoRequest}>
        <Button type="primary" icon={<CloudUploadIcon />}>点击上传</Button>
      </Upload>
      <Upload disabled>
        <Button type="primary" icon={<CloudUploadIcon />} disabled>点击上传</Button>
      </Upload>
    </div>
  );
}
