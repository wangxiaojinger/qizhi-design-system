import { Alert, Modal } from "@wangxiaojinger/qizhi-react";
import type { AgentRecord } from "./types";

export type DeleteDialogStatus = "idle" | "submitting" | "failure" | "blocked";

interface DeleteAgentModalProps {
  open: boolean;
  agent: AgentRecord | null;
  status: DeleteDialogStatus;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteAgentModal({
  open,
  agent,
  status,
  onCancel,
  onConfirm,
}: DeleteAgentModalProps) {
  const blocked = status === "blocked";
  return (
    <Modal
      open={open}
      title="删除 Agent"
      okText={blocked ? "知道了" : status === "failure" ? "重试" : "删除"}
      cancelText="取消"
      okButtonProps={{ status: blocked ? "default" : "danger" }}
      confirmLoading={status === "submitting"}
      hideCancel={blocked}
      maskClosable={false}
      onCancel={onCancel}
      onOk={blocked ? onCancel : onConfirm}
    >
      {status === "failure" ? (
        <Alert
          type="error"
          showIcon
          title="删除失败"
          content="删除失败，请重试或取消。"
        />
      ) : status === "blocked" ? (
        <Alert
          type="warning"
          showIcon
          title="存在引用"
          content="该 Agent 仍被其他对象引用，当前不会执行删除。"
        />
      ) : (
        <p>确定删除 Agent“{agent?.name}”吗？删除后无法恢复。</p>
      )}
    </Modal>
  );
}
