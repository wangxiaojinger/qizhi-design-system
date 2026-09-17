import { useState } from "react";
import { Button, Modal, Space } from "@wangxiaojinger/qizhi-react";

type Variant = "disabled" | "custom" | "none" | null;

const content = <>{Array.from({ length: 5 }, (_, index) => (
  <p key={index}>这里是对话框内容。</p>
))}</>;

export default function FooterDemo() {
  const [variant, setVariant] = useState<Variant>(null);
  const close = () => setVariant(null);
  return (
    <>
      <Space size="large">
        <Button type="primary" data-testid="modal-trigger" onClick={() => setVariant("disabled")}>
          打开自定义按钮属性模态框
        </Button>
        <Button type="primary" data-testid="modal-trigger" onClick={() => setVariant("custom")}>
          打开自定义页脚模态框
        </Button>
        <Button type="secondary" data-testid="modal-trigger" onClick={() => setVariant("none")}>
          打开无页脚模态框
        </Button>
      </Space>
      <Modal
        open={variant === "disabled"}
        title="对话框标题"
        cancelButtonProps={{ disabled: true }}
        okButtonProps={{ disabled: true }}
        onCancel={close}
        onOk={close}
      >
        {content}
      </Modal>
      <Modal
        open={variant === "custom"}
        title="对话框标题"
        onCancel={close}
        footer={<>
          <Button onClick={close}>返回</Button>
          <Button type="primary" onClick={close}>提交</Button>
        </>}
      >
        {content}
      </Modal>
      <Modal open={variant === "none"} title="对话框标题" footer={null} onCancel={close}>
        {content}
      </Modal>
    </>
  );
}
