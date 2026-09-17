import { Button, CloudUploadIcon, Upload } from "@wangxiaojinger/qizhi-react";
import { demoRequest } from "./demoRequest";

export default function LimitDemo() {
  return (
    <Upload multiple limit={3} customRequest={demoRequest}>
      <Button type="primary" icon={<CloudUploadIcon />}>点击上传</Button>
    </Upload>
  );
}
