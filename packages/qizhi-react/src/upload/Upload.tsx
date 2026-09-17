import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { UploadIcon } from "../icon/generated/catalog/UploadIcon";
import { DeleteFilledIcon } from "../icon/generated/catalog/DeleteFilledIcon";
import { PlusIcon } from "../icon/generated/catalog/PlusIcon";
import { UploadFileIcon } from "../icon/generated/catalog/UploadFileIcon";
import { StatusFailureIcon } from "../icon/generated/prompt/StatusFailureIcon";
import type {
  UploadFile,
  UploadHandle,
  UploadProps,
  UploadRequestOptions,
} from "./Upload.types";
import "./upload.css";

let uploadUid = 0;
const nextUid = () => `qizhi-upload-${++uploadUid}`;
const fileName = (file: File) => (
  (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name || "未命名文件"
);
const accepts = (file: File, accept = "") => {
  const rules = accept.split(",").map((rule) => rule.trim().toLowerCase()).filter(Boolean);
  if (!rules.length) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => rule.startsWith(".")
    ? name.endsWith(rule)
    : rule.endsWith("/*")
      ? type.startsWith(rule.slice(0, -1))
      : type === rule);
};

export const Upload = forwardRef<UploadHandle, UploadProps>(function Upload({
  fileList,
  defaultFileList = [],
  onChange,
  beforeUpload,
  onRemove,
  onReupload,
  onReject,
  accept,
  multiple = false,
  disabled = false,
  limit,
  directory = false,
  drag = false,
  listType = "text",
  showUploadList = true,
  customRequest,
  children,
  className,
  style,
  "aria-label": ariaLabel,
}, ref) {
  const controlled = fileList !== undefined;
  const [innerFiles, setInnerFiles] = useState<UploadFile[]>(() => [...defaultFileList]);
  const [dragOver, setDragOver] = useState(false);
  const files = controlled ? [...fileList] : innerFiles;
  const filesRef = useRef(files);
  filesRef.current = files;
  const inputRef = useRef<HTMLInputElement>(null);
  const aborters = useRef(new Map<string, () => void>());

  const update = (next: UploadFile[], changed: UploadFile) => {
    filesRef.current = next;
    if (!controlled) setInnerFiles(next);
    onChange?.(next, changed);
  };
  const replace = (changed: UploadFile) => {
    const current = filesRef.current;
    update(current.map((item) => item.uid === changed.uid ? changed : item), changed);
  };
  const request = (item: UploadFile) => {
    const origin = item.originFile ?? new File([], item.name);
    const uploading = { ...item, status: "uploading" as const, percent: item.percent ?? 0 };
    replace(uploading);
    const options: UploadRequestOptions = {
      file: origin,
      onProgress: (percent) => replace({ ...uploading, status: "uploading", percent }),
      onSuccess: () => replace({ ...uploading, status: "success", percent: 100 }),
      onError: () => replace({ ...uploading, status: "error" }),
    };
    const abort = customRequest?.(options);
    if (typeof abort === "function") aborters.current.set(item.uid, abort);
    if (!customRequest) options.onSuccess();
  };
  const addFiles = async (selected: readonly File[]) => {
    for (const original of selected) {
      if (limit && filesRef.current.length >= limit) break;
      if (!accepts(original, accept)) {
        onReject?.(original);
        continue;
      }
      const checked = beforeUpload ? await beforeUpload(original, selected) : original;
      if (checked === false) continue;
      const resolved = checked instanceof File ? checked : original;
      const item: UploadFile = {
        uid: nextUid(),
        name: fileName(resolved),
        relativePath: (resolved as File & { webkitRelativePath?: string }).webkitRelativePath,
        status: "init",
        percent: 0,
        originFile: resolved,
        url: resolved.type.startsWith("image/") ? URL.createObjectURL(resolved) : undefined,
      };
      const current = filesRef.current;
      const next = [item, ...current];
      update(next, item);
      request({ ...item, status: "uploading" });
    }
  };
  const remove = async (item: UploadFile) => {
    const current = filesRef.current;
    const allowed = onRemove ? await onRemove(item, current) : true;
    if (allowed === false) return;
    aborters.current.get(item.uid)?.();
    update(current.filter((entry) => entry.uid !== item.uid), item);
  };
  const reupload = (item: UploadFile) => {
    onReupload?.(item);
    request({ ...item, status: "uploading", percent: 0 });
  };
  useImperativeHandle(ref, () => ({
    submit: (item) => item ? request(item) : files.filter((entry) => entry.status === "init").forEach(request),
    abort: (item) => item ? aborters.current.get(item.uid)?.() : aborters.current.forEach((abort) => abort()),
    reupload,
  }));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) void addFiles([...event.target.files]);
    event.target.value = "";
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (!disabled && event.dataTransfer.files.length) void addFiles([...event.dataTransfer.files]);
  };
  const limitReached = !!limit && files.length >= limit;
  const openPicker = () => { if (!disabled) inputRef.current?.click(); };
  const directoryProps = directory ? { webkitdirectory: "", directory: "" } : {};

  return (
    <div className={["qizhi-upload", `qizhi-upload--${listType}`, dragOver && "is-dragover", className].filter(Boolean).join(" ")} style={style}>
      <input ref={inputRef} data-testid="qizhi-upload-input" type="file" hidden disabled={disabled} accept={accept} multiple={multiple || directory} onChange={handleChange} {...directoryProps} />
      {!limitReached && (drag ? (
        <div className="qizhi-upload__drag-trigger" role="button" tabIndex={disabled ? -1 : 0} aria-label={ariaLabel ?? "点击或拖动文件到该区域上传"} aria-disabled={disabled} onClick={openPicker} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPicker(); } }} onDragEnter={(event) => { event.preventDefault(); if (!disabled) setDragOver(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOver(false); }} onDrop={handleDrop}>
          {children ?? <><UploadIcon /><span className="qizhi-upload__drag-title">点击或拖动文件到该区域上传</span><span className="qizhi-upload__drag-tip">支持单次上传或批量上传</span></>}
        </div>
      ) : listType === "picture-card" && !children ? (
        <button className="qizhi-upload__picture-trigger" type="button" aria-label={ariaLabel ?? "点击上传"} disabled={disabled} onClick={openPicker}><PlusIcon /></button>
      ) : (
        <span className="qizhi-upload__trigger" onClick={openPicker}>{children}</span>
      ))}
      {showUploadList ? <div className="qizhi-upload__list" role="list" aria-label="上传文件列表" aria-live="polite">
        {files.map((item) => <div key={item.uid} role="listitem" data-upload-file-item className={`qizhi-upload__item is-${item.status}`}>
          {listType === "picture-card" && item.url ? <img src={item.url} alt={item.name} /> : item.status === "error" ? <StatusFailureIcon /> : <UploadFileIcon />}
          <div className="qizhi-upload__item-main"><span className="qizhi-upload__name">{item.relativePath || item.name}</span>{item.percent != null && item.status !== "error" ? <span className="qizhi-upload__progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.percent}><span style={{ width: `${item.percent}%` }} /></span> : null}</div>
          {item.status === "error" ? <button className="qizhi-upload__retry" type="button" aria-label={`重新上传 ${item.name}`} onClick={() => reupload(item)}>重新上传</button> : null}
          <button className="qizhi-upload__remove" type="button" aria-label={`删除 ${item.name}`} onClick={() => void remove(item)}><DeleteFilledIcon /></button>
        </div>)}
      </div> : null}
    </div>
  );
});
