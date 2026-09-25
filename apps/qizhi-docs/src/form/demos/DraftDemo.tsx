import { useMemo, useState } from "react";
import { Button, Form, Input } from "@wangxiaojinger/qizhi-react";
import type { FormDraftRecord, FormDraftSaveInput, FormDraftSaveResult, FormDraftStorage, FormValues } from "@wangxiaojinger/qizhi-react";

type DraftValues = FormValues & { serviceName?: unknown; description?: unknown };
type DraftMetadata = { stepKey: string };

class MemoryDraftStorage implements FormDraftStorage<DraftValues, DraftMetadata> {
  private current: FormDraftRecord<DraftValues, DraftMetadata> | null = null;
  private revision = 0;

  async load(key: string) {
    return this.current?.key === key ? structuredClone(this.current) : null;
  }

  async save(input: FormDraftSaveInput<DraftValues, DraftMetadata>): Promise<FormDraftSaveResult<DraftValues, DraftMetadata>> {
    if (!input.force && this.current && input.expectedRevision !== this.current.revision) {
      return { status: "conflict", remote: structuredClone(this.current) };
    }
    this.revision += 1;
    this.current = {
      key: input.key,
      version: input.version,
      revision: `r${this.revision}`,
      values: structuredClone(input.values),
      metadata: input.metadata,
      updatedAt: new Date().toISOString(),
    };
    return { status: "saved", record: structuredClone(this.current) };
  }

  async remove(key: string, expectedRevision?: string) {
    if (this.current?.key !== key) return;
    if (expectedRevision && expectedRevision !== this.current.revision) throw new Error("草稿版本已变化");
    this.current = null;
  }

  seed(input: { version?: string; values: DraftValues; expiresAt?: string }) {
    this.revision += 1;
    this.current = {
      key: "service:create:user-1",
      version: input.version ?? "v1",
      revision: `r${this.revision}`,
      values: structuredClone(input.values),
      metadata: { stepKey: "detail" },
      updatedAt: new Date().toISOString(),
      expiresAt: input.expiresAt,
    };
  }
}

const statusLabels = {
  idle: "尚未检测草稿",
  loading: "正在检测草稿",
  ready: "发现可恢复草稿",
  saving: "正在保存草稿",
  saved: "草稿已保存",
  expired: "草稿已过期",
  "version-mismatch": "草稿版本不匹配",
  conflict: "检测到远端冲突",
  error: "草稿操作失败",
} as const;

export default function DraftDemo() {
  const [form] = Form.useForm();
  const storage = useMemo(() => new MemoryDraftStorage(), []);
  const [restoredStep, setRestoredStep] = useState("base");
  const draft = Form.useDraft<DraftValues, DraftMetadata>({
    form,
    draftKey: "service:create:user-1",
    version: "v1",
    storage,
    selectValues: (values) => ({
      serviceName: values.serviceName,
      description: values.description,
    }),
    getMetadata: () => ({ stepKey: "detail" }),
    onRestoreMetadata: (metadata) => setRestoredStep(metadata?.stepKey ?? "base"),
  });

  const currentSafeValues = () => ({
    serviceName: form.getFieldValue("serviceName"),
    description: form.getFieldValue("description"),
  });

  return (
    <Form
      form={form}
      aria-label="表单草稿"
      initialValues={{ serviceName: "service-a", description: "初始描述", password: "initial-secret" }}
    >
      <Form.Item name="serviceName" label="草稿服务名称">
        <Input aria-label="草稿服务名称" allowClear={false} />
      </Form.Item>
      <Form.Item name="description" label="草稿描述">
        <Input.TextArea aria-label="草稿描述" rows={2} />
      </Form.Item>
      <Form.Item name="password" label="访问密码" extra="密码字段不会进入草稿。">
        <Input aria-label="草稿访问密码" type="password" allowClear={false} />
      </Form.Item>

      <div className="form-draft-demo__actions">
        <Button type="primary" onClick={() => void draft.save()}>保存草稿</Button>
        <Button onClick={() => void draft.load()}>检测草稿</Button>
        <Button disabled={draft.status !== "ready"} onClick={draft.restore}>恢复草稿</Button>
        <Button onClick={() => void draft.remove()}>清除草稿</Button>
        <Button onClick={() => {
          storage.seed({ values: currentSafeValues(), expiresAt: "2020-01-01T00:00:00.000Z" });
          void draft.load();
        }}>模拟过期草稿</Button>
        <Button onClick={() => {
          storage.seed({ version: "v0", values: currentSafeValues() });
          void draft.load();
        }}>模拟版本不匹配</Button>
        <Button onClick={() => {
          storage.seed({ values: { serviceName: "remote-service", description: "远端草稿内容" } });
          void draft.save();
        }}>模拟远端冲突</Button>
      </div>

      {draft.status === "conflict" ? (
        <div className="form-draft-demo__conflict" role="group" aria-label="草稿冲突处理">
          <Button onClick={draft.useRemote}>选择远端版本</Button>
          <Button type="primary" onClick={() => void draft.overwrite()}>覆盖远端草稿</Button>
        </div>
      ) : null}

      <div className="form-draft-demo__state" aria-live="polite">
        <output aria-label="草稿状态">{draft.status}：{statusLabels[draft.status]}</output>
        <output aria-label="草稿版本">{draft.record?.revision ?? draft.conflict?.revision ?? "无版本"}</output>
        <output aria-label="恢复步骤">恢复步骤：{restoredStep}</output>
        <output aria-label="草稿字段范围">已保存字段：serviceName、description；未保存字段：password</output>
      </div>
    </Form>
  );
}
