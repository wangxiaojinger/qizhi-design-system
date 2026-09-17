import { useRef, useState } from "react";
import { Button, CloudUploadIcon, Modal, Upload, type UploadFile } from "@wangxiaojinger/qizhi-react";
import { demoRequest } from "./demoRequest";

const files: UploadFile[] = [
  { uid: "light", name: "light.png", status: "success" },
  { uid: "ice", name: "ice.png", status: "success" },
];

export default function BeforeRemoveDemo() {
  const [fileName, setFileName] = useState("");
  const resolveRef = useRef<((result: boolean) => void) | null>(null);
  const close = (result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setFileName("");
  };
  return (
    <>
      <Upload
        multiple
        defaultFileList={files}
        customRequest={demoRequest}
        onRemove={(file) => new Promise((resolve) => {
          setFileName(file.name);
          resolveRef.current = resolve;
        })}
      >
        <Button type="primary" icon={<CloudUploadIcon />}>点击上传</Button>
      </Upload>
      <Modal
        open={Boolean(fileName)}
        title="onRemove"
        onCancel={() => close(false)}
        onOk={() => close(true)}
      >
        确认删除 {fileName}
      </Modal>
    </>
  );
}
