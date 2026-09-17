import { useState } from "react";
import { Button, Modal } from "@wangxiaojinger/qizhi-react";

export default function BasicDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="primary" data-testid="modal-trigger" onClick={() => setOpen(true)}>
        打开模态框
      </Button>
      <Modal
        open={open}
        title="对话框标题"
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <p>
          你可以根据当前场景自定义对话框正文。点击确定按钮后，对话框会立即关闭。
        </p>
      </Modal>
    </>
  );
}
