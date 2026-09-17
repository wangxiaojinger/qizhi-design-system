import type { CSSProperties, ReactNode } from "react";

export type UploadStatus = "init" | "uploading" | "success" | "error";
export type UploadListType = "text" | "picture-card";

export interface UploadFile {
  uid: string;
  name: string;
  status: UploadStatus;
  percent?: number;
  url?: string;
  originFile?: File;
  relativePath?: string;
}

export interface UploadRequestOptions {
  file: File;
  onProgress: (percent: number) => void;
  onSuccess: () => void;
  onError: () => void;
}

export interface UploadHandle {
  submit: (file?: UploadFile) => void;
  abort: (file?: UploadFile) => void;
  reupload: (file: UploadFile) => void;
}

export interface UploadProps {
  fileList?: readonly UploadFile[];
  defaultFileList?: readonly UploadFile[];
  onChange?: (fileList: UploadFile[], file: UploadFile) => void;
  beforeUpload?: (file: File, fileList: readonly File[]) => boolean | File | Promise<boolean | File>;
  onRemove?: (file: UploadFile, fileList: readonly UploadFile[]) => boolean | Promise<boolean>;
  onReupload?: (file: UploadFile) => void;
  onReject?: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  limit?: number;
  directory?: boolean;
  drag?: boolean;
  listType?: UploadListType;
  showUploadList?: boolean;
  customRequest?: (options: UploadRequestOptions) => void | (() => void);
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}
