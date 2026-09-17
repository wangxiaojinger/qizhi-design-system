import { Button, CloudUploadIcon, Upload, type UploadFile } from "@wangxiaojinger/qizhi-react";
import { demoRequest } from "./demoRequest";

const files: UploadFile[] = [
  { uid: "ice", name: "ice.png", status: "uploading", percent: 28 },
  { uid: "light", name: "light.png", status: "success", percent: 100 },
  { uid: "image", name: "IMG_5216.PNG", status: "success" },
  { uid: "cat", name: "cat.png", status: "error" },
];

export default function FileListDemo() {
  return (
    <Upload multiple defaultFileList={files} customRequest={demoRequest}>
      <Button type="primary" icon={<CloudUploadIcon />}>点击上传</Button>
    </Upload>
  );
}
