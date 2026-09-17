import { useRef, useState } from "react";
import { Button, CloudUploadIcon, Modal, Upload } from "@wangxiaojinger/qizhi-react";
import { demoRequest } from "./demoRequest";

export default function BeforeUploadDemo() {
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
        customRequest={demoRequest}
        beforeUpload={(file) => new Promise((resolve) => {
          setFileName(file.name);
          resolveRef.current = resolve;
        })}
      >
        <Button type="primary" icon={<CloudUploadIcon />}>点击上传</Button>
      </Upload>
      <Modal
        open={Boolean(fileName)}
        title="beforeUpload"
        onCancel={() => close(false)}
        onOk={() => close(true)}
      >
        确认上传 {fileName}
      </Modal>
    </>
  );
}
