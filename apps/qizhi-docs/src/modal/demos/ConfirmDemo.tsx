import { Button, Modal } from "@wangxiaojinger/qizhi-react";

export default function ConfirmDemo() {
  const open = () => Modal.confirm({
    title: "确定要删除已选择的 3 个项目吗？删除后无法撤销此操作。",
    okText: "删除",
    okButtonProps: { status: "danger" },
  });
  return <Button type="primary" data-testid="modal-trigger" onClick={open}>确认</Button>;
}
