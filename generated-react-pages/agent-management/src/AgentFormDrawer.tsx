import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  InputTag,
  Modal,
  Radio,
  Select,
  Table,
  Typography,
  Upload,
  UploadFileIcon,
} from "@wangxiaojinger/qizhi-react";
import { CloseIcon } from "@wangxiaojinger/qizhi-react/icon";
import type {
  InputTagValue,
  RadioValue,
  SelectRawValue,
  TableColumn,
  UploadFile,
} from "@wangxiaojinger/qizhi-react";
import { AssetSelectorModal } from "./AssetSelectorModal";
import { validateAgentName } from "./agentModel";
import type {
  AgentDraft,
  AgentFormMode,
  McpRecord,
  SkillRecord,
  UploadMetadata,
} from "./types";

interface AgentFormDrawerProps {
  open: boolean;
  mode: AgentFormMode;
  initialDraft: AgentDraft;
  onClose: () => void;
  onSubmit: (draft: AgentDraft) => Promise<{ ok: boolean; message?: string }>;
}

interface FormErrors {
  name: string;
  project: string;
  instruction: string;
  tags: string;
  file: string;
  submit: string;
}

const EMPTY_ERRORS: FormErrors = {
  name: "",
  project: "",
  instruction: "",
  tags: "",
  file: "",
  submit: "",
};

const PROJECT_OPTIONS = [
  { label: "基础-启智", value: "基础-启智" },
  { label: "模型服务", value: "模型服务" },
  { label: "智算平台", value: "智算平台" },
];

const titleForMode = (mode: AgentFormMode) => {
  if (mode === "edit") return "编辑 Agent";
  if (mode === "version") return "新增版本";
  return "新建 Agent";
};

const submitTextForMode = (mode: AgentFormMode) => mode === "edit" ? "保存" : "新建";

const fileListFromMetadata = (metadata: UploadMetadata | null): UploadFile[] => metadata ? [{
  uid: `local-${metadata.name}`,
  name: metadata.name,
  status: "success",
  percent: 100,
}] : [];

export function AgentFormDrawer({
  open,
  mode,
  initialDraft,
  onClose,
  onSubmit,
}: AgentFormDrawerProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const [submitting, setSubmitting] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [selectorKind, setSelectorKind] = useState<"skill" | "mcp" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(initialDraft);
    setErrors(EMPTY_ERRORS);
    setSubmitting(false);
    setDiscardOpen(false);
    setSelectorKind(null);
  }, [initialDraft, open]);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft],
  );

  const requestClose = () => {
    if (dirty) setDiscardOpen(true);
    else onClose();
  };

  const validate = () => {
    const next: FormErrors = {
      ...EMPTY_ERRORS,
      name: validateAgentName(draft.name),
      project: draft.project ? "" : "请选择所属项目",
      instruction: draft.instructionMode === "manual" && !draft.instructionContent.trim()
        ? "请输入 Agent 指令内容"
        : "",
      file: draft.instructionMode === "upload" && !draft.instructionFile
        ? "请选择 .md 或 .txt 文件"
        : "",
    };
    setErrors(next);
    const firstInvalidSelector = next.name
      ? '[aria-label="Agent 名称"]'
      : next.project
        ? '[aria-label="所属项目"]'
        : next.instruction
          ? '[aria-label="Agent 指令内容"]'
          : next.file
            ? '[aria-label="选择 Agent 指令文件"]'
            : "";
    if (firstInvalidSelector) {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>(firstInvalidSelector);
      firstInvalid?.focus();
      firstInvalid?.scrollIntoView?.({ block: "center" });
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setErrors((current) => ({ ...current, submit: "" }));
    const result = await onSubmit(draft);
    setSubmitting(false);
    if (!result.ok) {
      setErrors((current) => ({ ...current, submit: result.message ?? "提交失败，请重试" }));
    }
  };

  const skillColumns: TableColumn<SkillRecord>[] = [
    { key: "name", title: "Skill 名称", dataIndex: "name", width: 130 },
    { key: "version", title: "版本号", dataIndex: "version", width: 80 },
    { key: "project", title: "所属项目", dataIndex: "project", width: 110 },
    { key: "creator", title: "创建人", dataIndex: "creator", width: 100 },
    { key: "summary", title: "简介", dataIndex: "summary", width: 180 },
    {
      key: "action", title: "操作", width: 70,
      render: (_, record) => (
        <Button type="text" status="danger" size="small" onClick={() => setDraft((current) => ({
          ...current,
          skills: current.skills.filter((skill) => skill.id !== record.id),
        }))}>移除</Button>
      ),
    },
  ];

  const mcpColumns: TableColumn<McpRecord>[] = [
    { key: "name", title: "MCP 名称", dataIndex: "name", width: 130 },
    { key: "version", title: "版本号", dataIndex: "version", width: 80 },
    { key: "status", title: "服务状态", dataIndex: "status", width: 90 },
    { key: "tools", title: "Tools", dataIndex: "tools", width: 70 },
    { key: "project", title: "所属项目", dataIndex: "project", width: 110 },
    { key: "creator", title: "创建人", dataIndex: "creator", width: 100 },
    {
      key: "action", title: "操作", width: 70,
      render: (_, record) => (
        <Button type="text" status="danger" size="small" onClick={() => setDraft((current) => ({
          ...current,
          mcps: current.mcps.filter((mcp) => mcp.id !== record.id),
        }))}>移除</Button>
      ),
    },
  ];

  return (
    <>
      <Drawer
        open={open && selectorKind === null && !discardOpen}
        title={(
          <span className="agent-page-drawer-title">
            <Button type="text" iconOnly icon={<CloseIcon />} aria-label="关闭抽屉" onClick={requestClose} />
            <strong>{titleForMode(mode)}</strong>
          </span>
        )}
        closable={false}
        width="48vw"
        maskClosable={false}
        onClose={requestClose}
        footer={
          <div className="agent-page-drawer-footer">
            <Button onClick={requestClose}>取消</Button>
            <Button type="primary" loading={submitting} onClick={() => void submit()}>
              {submitTextForMode(mode)}
            </Button>
          </div>
        }
      >
        <Form ref={formRef} className="agent-page-form" layout="vertical" onSubmit={(event) => event.preventDefault()}>
          <section className="agent-page-form-section" aria-labelledby="agent-basic-heading">
            <Typography.Title id="agent-basic-heading" heading={5}>基本信息</Typography.Title>
            <Form.Item label="版本号" required>
              <Input
                className="agent-page-control-full"
                value={draft.version}
                disabled={mode === "edit"}
                aria-label="版本号"
                onChange={(event) => setDraft((current) => ({
                  ...current,
                  version: event.target.value,
                }))}
              />
            </Form.Item>
            <Form.Item
              label="Agent 名称"
              required
              extra={errors.name || "支持字母，数字，下划线，短横线和点，且只能以字母开头"}
            >
              <Input
                className="agent-page-control-full"
                aria-label="Agent 名称"
                placeholder="请输入 Agent 名称"
                value={draft.name}
                maxLength={64}
                showWordLimit
                status={errors.name ? "error" : "default"}
                aria-invalid={Boolean(errors.name)}
                onChange={(event) => {
                  const name = event.target.value;
                  setDraft((current) => ({ ...current, name }));
                  setErrors((current) => ({ ...current, name: name ? validateAgentName(name) : current.name }));
                }}
              />
            </Form.Item>
            <Form.Item label="所属项目" required extra={errors.project || undefined}>
              <Select
                className="agent-page-control-full"
                aria-label="所属项目"
                placeholder="请选择"
                status={errors.project ? "error" : "default"}
                value={draft.project || undefined}
                options={PROJECT_OPTIONS}
                onChange={(value: SelectRawValue | undefined) => {
                  setDraft((current) => ({ ...current, project: String(value ?? "") }));
                  setErrors((current) => ({ ...current, project: "" }));
                }}
              />
            </Form.Item>
            <Form.Item
              label="标签"
              extra={errors.tags || "请输入标签，如：金融分析，风控，单个标签字数最多不超过8个字符；"}
            >
              <InputTag
                className="agent-page-control-full"
                aria-label="标签"
                value={draft.tags}
                placeholder="请输入标签"
                saveOnBlur
                tokenSeparators={[",", "，"]}
                validate={(input) => {
                  if (input.length <= 8) {
                    setErrors((current) => ({ ...current, tags: "" }));
                    return true;
                  }
                  setErrors((current) => ({ ...current, tags: "单个标签不能超过 8 个字符" }));
                  return false;
                }}
                onChange={(value: InputTagValue[]) => setDraft((current) => ({
                  ...current,
                  tags: value.map(String),
                }))}
              />
            </Form.Item>
            <Form.Item label="描述">
              <Input.TextArea
                className="agent-page-control-full"
                placeholder="请输入 Agent 的功能描述"
                value={draft.description}
                maxLength={500}
                showWordLimit
                autoSize={{ minRows: 3, maxRows: 6 }}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              />
            </Form.Item>
          </section>

          <section className="agent-page-form-section" aria-labelledby="agent-instruction-heading">
            <Typography.Title id="agent-instruction-heading" heading={5}>Agent 指令</Typography.Title>
            <Form.Item label="录入方式" required>
              <Radio.Group
                aria-label="录入方式"
                type="button"
                value={draft.instructionMode}
                options={[{ label: "手动录入", value: "manual" }, { label: "文件上传", value: "upload" }]}
                onChange={(value: RadioValue) => setDraft((current) => ({
                  ...current,
                  instructionMode: value as AgentDraft["instructionMode"],
                }))}
              />
            </Form.Item>
            {draft.instructionMode === "manual" ? (
              <Form.Item label="Agent 指令内容" required extra={errors.instruction || undefined}>
                <Input.TextArea
                  className="agent-page-control-full"
                  aria-label="Agent 指令内容"
                  placeholder="请输入 Agent 指令内容"
                  value={draft.instructionContent}
                  status={errors.instruction ? "error" : "default"}
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, instructionContent: event.target.value }));
                    setErrors((current) => ({ ...current, instruction: "" }));
                  }}
                />
              </Form.Item>
            ) : (
              <Form.Item
                label="Agent 指令文件"
                required
                extra={errors.file || "仅保留文件名、大小和格式元数据，不读取或上传文件内容。支持 .md、.txt。"}
              >
                <Upload
                  className="agent-page-upload"
                  aria-label="选择 Agent 指令文件"
                  drag
                  accept=".md,.txt"
                  fileList={fileListFromMetadata(draft.instructionFile)}
                  onReject={() => setErrors((current) => ({ ...current, file: "仅支持 .md 或 .txt 文件" }))}
                  onChange={(nextFiles, file) => {
                    if (!nextFiles.length) {
                      setDraft((current) => ({ ...current, instructionFile: null }));
                      return;
                    }
                    const origin = file.originFile;
                    setDraft((current) => ({
                      ...current,
                      instructionFile: {
                        name: file.name,
                        size: origin?.size ?? 0,
                        type: origin?.type ?? "",
                      },
                    }));
                    setErrors((current) => ({ ...current, file: "" }));
                  }}
                  onRemove={() => {
                    setDraft((current) => ({ ...current, instructionFile: null }));
                    return true;
                  }}
                  customRequest={({ onSuccess }) => onSuccess()}
                >
                  <div className="agent-page-upload-content">
                    <UploadFileIcon size={32} />
                    <strong>{draft.instructionFile ? "替换 Agent 指令文件" : "点击上传 Agent 指令文件"}</strong>
                    <span>支持 .md、.txt 文件；当前 Demo 仅保留文件元数据</span>
                  </div>
                </Upload>
              </Form.Item>
            )}
          </section>

          <section className="agent-page-form-section" aria-labelledby="agent-capability-heading">
            <Typography.Title id="agent-capability-heading" heading={5}>能力设置</Typography.Title>
            <div className="agent-page-capability-heading">
              <Typography.Text bold>Skill</Typography.Text>
            </div>
            <Table
              aria-label="已选 Skill"
              rowKey="id"
              columns={skillColumns}
              dataSource={draft.skills}
              scrollX={660}
              pagination={false}
              empty={<div className="agent-page-inline-empty">暂无数据</div>}
            />
            <Button className="agent-page-capability-add" onClick={() => setSelectorKind("skill")}>+ 选择Skill</Button>

            <div className="agent-page-capability-heading agent-page-capability-heading--spaced">
              <Typography.Text bold>MCP</Typography.Text>
            </div>
            <Table
              aria-label="已选 MCP"
              rowKey="id"
              columns={mcpColumns}
              dataSource={draft.mcps}
              scrollX={650}
              pagination={false}
              empty={<div className="agent-page-inline-empty">暂无数据</div>}
            />
            <Button className="agent-page-capability-add" onClick={() => setSelectorKind("mcp")}>+ 选择MCP</Button>
          </section>

          {errors.submit ? <div className="agent-page-submit-error" role="alert">{errors.submit}</div> : null}
        </Form>
      </Drawer>

      <AssetSelectorModal
        kind={selectorKind ?? "skill"}
        open={selectorKind !== null}
        selectedIds={(selectorKind === "mcp" ? draft.mcps : draft.skills).map((record) => record.id)}
        onCancel={() => setSelectorKind(null)}
        onConfirm={(records) => {
          if (selectorKind === "mcp") {
            setDraft((current) => ({ ...current, mcps: records as McpRecord[] }));
          } else {
            setDraft((current) => ({ ...current, skills: records as SkillRecord[] }));
          }
          setSelectorKind(null);
        }}
      />

      <Modal
        open={discardOpen}
        title="放弃未保存内容"
        okText="放弃并关闭"
        cancelText="继续编辑"
        okButtonProps={{ status: "danger" }}
        maskClosable={false}
        onCancel={() => setDiscardOpen(false)}
        onOk={() => {
          setDiscardOpen(false);
          onClose();
        }}
      >
        <p>关闭后，当前未保存的内容将丢失。确定要关闭吗？</p>
      </Modal>
    </>
  );
}
