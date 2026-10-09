import { Button, CheckCircleIcon, LoadingIcon, Modal } from "@wangxiaojinger/qizhi-react";

export default function ManualDemo() {
  const open = () => {
    const handle = Modal.confirm({
      title: "提交中...",
      icon: null,
      footer: null,
      content: <div className="qizhi-modal-status"><LoadingIcon />
        <span>对话框将在 1.5 秒后更新为成功状态。</span>
      </div>,
    });
    window.setTimeout(() => {
      handle.update({
        title: "提交成功",
        content: <div className="qizhi-modal-status is-success"><CheckCircleIcon />
          <span>对话框将在 1.5 秒后自动关闭。</span>
        </div>,
      });
      window.setTimeout(handle.close, 1500);
    }, 1500);
  };
  return <Button type="primary" data-testid="modal-trigger" onClick={open}>打开模态框</Button>;
}
