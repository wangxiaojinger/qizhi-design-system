import { useState } from "react";
import { Button, Form, Input, Select } from "@wangxiaojinger/qizhi-react";
import type { FormBulkEditPatch } from "@wangxiaojinger/qizhi-react";

interface Member {
  id: string;
  name: string;
  department: string;
  status: string;
  profile: { remark: string };
}

const initialMembers: Member[] = [
  { id: "member-1", name: "成员甲", department: "design", status: "enabled", profile: { remark: "负责交互" } },
  { id: "member-2", name: "成员乙", department: "engineering", status: "enabled", profile: { remark: "负责前端" } },
  { id: "member-3", name: "成员丙", department: "design", status: "enabled", profile: { remark: "负责测试" } },
];

const departmentOptions = [
  { value: "design", label: "设计部" },
  { value: "engineering", label: "研发部" },
  { value: "product", label: "产品部" },
  { value: "operations", label: "运营部" },
];

const statusOptions = [
  { value: "enabled", label: "启用" },
  { value: "disabled", label: "停用" },
];

export default function BulkEditDemo() {
  const [form] = Form.useForm();
  const [members, setMembers] = useState<readonly Member[]>(initialMembers);
  const [patch, setPatch] = useState<FormBulkEditPatch<string> | null>(null);
  const [targetSummary, setTargetSummary] = useState("尚未生成补丁");
  const [resultSummary, setResultSummary] = useState("尚未模拟提交结果");
  const bulk = Form.useBulkEdit({
    form,
    records: members,
    getRowKey: (member) => member.id,
    fields: ["department", "status", ["profile", "remark"]],
  });
  const departmentState = bulk.getFieldState("department");
  const remarkState = bulk.getFieldState(["profile", "remark"]);
  const departmentFailures = bulk.getFieldFailures("department");

  const generatePatch = async () => {
    try {
      const nextPatch = await bulk.validate();
      setPatch(nextPatch);
      setTargetSummary(`本次目标：${nextPatch.targetKeys.join("、")}`);
      return nextPatch;
    } catch (error) {
      const current = error as { code?: string; message?: string };
      setTargetSummary(current.code === "no-changes" ? "暂无可提交的修改" : current.message ?? "无法生成补丁");
      return null;
    }
  };

  const simulatePartialSuccess = () => {
    const [first, second, third] = bulk.remainingKeys;
    if (!first || !second || !third) return;
    bulk.applyResult({
      succeededKeys: [first],
      failures: [
        { key: second, field: "department", message: "没有修改部门的权限" },
        { key: third, message: "成员记录正在审批中" },
      ],
    });
    setResultSummary("成功 1 条，失败 2 条");
  };

  const retryFailures = async () => {
    const retryPatch = await generatePatch();
    if (!retryPatch) return;
    bulk.applyResult({ succeededKeys: retryPatch.targetKeys, failures: [] });
    setResultSummary(`重试成功 ${retryPatch.targetKeys.length} 条，失败 0 条`);
  };

  return (
    <Form form={form} aria-label="批量编辑成员">
      <div className="form-docs-bulk-edit-summary">
        已选择 3 名成员：{members.map((member) => member.name).join("、")}
      </div>

      <div className="form-docs-bulk-edit-fields">
        <Form.Item name="department" label="统一部门">
          <Select
            aria-label="统一部门"
            aria-describedby={departmentState.mixed && departmentState.mode === "keep" ? "bulk-edit-department-mixed" : undefined}
            options={departmentOptions}
            placeholder={departmentState.mixed ? "多个不同值" : "请选择部门"}
          />
        </Form.Item>
        {departmentState.mixed && departmentState.mode === "keep" ? (
          <p id="bulk-edit-department-mixed" className="form-docs-bulk-edit-mixed">多个不同值</p>
        ) : null}
        <Form.ErrorList errors={departmentFailures.map((failure) => `${failure.key}：${failure.message}`)} />

        <Form.Item name="status" label="统一状态">
          <Select aria-label="统一状态" options={statusOptions} />
        </Form.Item>

        <Form.Item name={["profile", "remark"]} label="统一备注">
          <Input
            aria-label="统一备注"
            aria-describedby={remarkState.mixed && remarkState.mode === "keep" ? "bulk-edit-remark-mixed" : undefined}
            placeholder={remarkState.mixed ? "多个不同值" : "请输入备注"}
            allowClear={false}
          />
        </Form.Item>
        {remarkState.mixed && remarkState.mode === "keep" ? (
          <p id="bulk-edit-remark-mixed" className="form-docs-bulk-edit-mixed">备注为多个不同值</p>
        ) : null}
      </div>

      <div className="form-docs-bulk-edit-actions">
        <Button onClick={() => bulk.clearField(["profile", "remark"])}>清空备注</Button>
        <Button onClick={() => bulk.keepField("department")}>撤销部门修改</Button>
        <Button type="primary" onClick={() => void generatePatch()}>校验并生成补丁</Button>
        <Button disabled={!patch || bulk.remainingKeys.length !== 3} onClick={simulatePartialSuccess}>模拟部分成功</Button>
        <Button disabled={!bulk.failures.length || bulk.status === "sourceChanged"} onClick={() => void retryFailures()}>仅重试失败成员</Button>
        <Button onClick={() => setMembers((current) => current.map((member) => member.id === "member-2" ? { ...member, department: "operations" } : member))}>模拟外部数据变化</Button>
        <Button disabled={bulk.status !== "sourceChanged"} onClick={bulk.rebase}>基于最新数据重新开始</Button>
      </div>

      {bulk.status === "sourceChanged" ? (
        <div role="alert" aria-label="批量编辑数据变化" className="form-docs-bulk-edit-warning">
          源数据已变化，请确认后基于最新数据重新开始。
        </div>
      ) : null}

      <div className="form-docs-bulk-edit-results" aria-live="polite">
        <output aria-label="批量编辑目标">{targetSummary}</output>
        <output aria-label="批量编辑结果">{resultSummary}</output>
        {bulk.failures.length ? (
          <ul aria-label="批量编辑失败明细">
            {bulk.failures.map((failure, index) => (
              <li key={`${failure.key}-${index}`} tabIndex={0}>{failure.key}：{failure.message}</li>
            ))}
          </ul>
        ) : null}
        <pre role="status" aria-label="批量编辑补丁">{patch ? JSON.stringify(patch, null, 2) : "尚未生成补丁"}</pre>
      </div>
    </Form>
  );
}
