import { Button, Modal, WarningFilledIcon } from "@wangxiaojinger/qizhi-react";

export default function ConfirmDemo() {
  const open = () => Modal.confirm({
    title: "确认删除",
    okText: "删除",
    okButtonProps: { status: "danger" },
    content: (
      <div className="qizhi-modal-confirm">
        <WarningFilledIcon className="qizhi-modal-confirm__icon" />
        <div>
          <div className="qizhi-modal-confirm__title">确认删除</div>
          <p>确定要删除已选择的 3 个项目吗？删除后无法撤销此操作。</p>
        </div>
      </div>
    ),
  });
  return <Button type="primary" data-testid="modal-trigger" onClick={open}>确认</Button>;
}
