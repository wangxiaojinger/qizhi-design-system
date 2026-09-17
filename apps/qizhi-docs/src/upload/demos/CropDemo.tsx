import { useEffect, useRef, useState } from "react";
import { Modal, Slider, Upload } from "@wangxiaojinger/qizhi-react";
import { demoRequest } from "./demoRequest";

export default function CropDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [zoom, setZoom] = useState(10);
  const [rotate, setRotate] = useState(0);
  const resolveRef = useRef<((result: boolean | File) => void) | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    stageRef.current?.style.setProperty("--upload-crop-zoom", String(zoom / 10));
    stageRef.current?.style.setProperty("--upload-crop-rotate", `${rotate}deg`);
  }, [rotate, zoom]);
  const close = (confirmed: boolean) => {
    resolveRef.current?.(confirmed && file ? file : false);
    resolveRef.current = null;
    if (!confirmed && preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
  };
  return (
    <>
      <Upload
        accept="image/*"
        listType="picture-card"
        customRequest={demoRequest}
        beforeUpload={(nextFile) => new Promise((resolve) => {
          setFile(nextFile);
          setPreview(URL.createObjectURL(nextFile));
          resolveRef.current = resolve;
        })}
      />
      <Modal
        open={Boolean(file)}
        title="裁剪图片"
        width={500}
        okText="裁剪并上传"
        onCancel={() => close(false)}
        onOk={() => close(true)}
      >
        <div className="upload-demo-cropper">
          <div ref={stageRef} className="upload-demo-cropper__stage">
            {preview ? <img src={preview} alt={file?.name ?? "待裁剪图片"} /> : null}
            <span className="upload-demo-cropper__area" aria-hidden="true" />
          </div>
          <label className="upload-demo-cropper__control">
            <span>缩放</span>
            <Slider min={10} max={24} value={zoom} onChange={setZoom} aria-label="缩放" />
          </label>
          <label className="upload-demo-cropper__control">
            <span>旋转</span>
            <Slider min={0} max={360} value={rotate} onChange={setRotate} aria-label="旋转" />
          </label>
        </div>
      </Modal>
    </>
  );
}
