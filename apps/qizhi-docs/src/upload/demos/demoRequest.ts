import type { UploadRequestOptions } from "@wangxiaojinger/qizhi-react";

export const demoRequest = ({ onProgress, onSuccess }: UploadRequestOptions) => {
  let progress = 12;
  const timer = window.setInterval(() => {
    progress = Math.min(progress + 22, 100);
    onProgress(progress);
    if (progress === 100) {
      window.clearInterval(timer);
      onSuccess();
    }
  }, 260);
  return () => window.clearInterval(timer);
};
