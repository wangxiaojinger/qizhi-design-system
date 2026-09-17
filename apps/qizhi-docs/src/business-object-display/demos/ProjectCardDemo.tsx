import { useMemo, useState } from "react";
import {
  InteractiveModelingIcon,
  ProjectCard,
  Segmented,
} from "@wangxiaojinger/qizhi-react";
import type { ProjectCardProps } from "@wangxiaojinger/qizhi-react";

const publicStorage = [
  {
    name: "inspire-sfs",
    applied: "2TiB",
    remaining: "1.97TiB",
    updatedAt: "2026-08-12 17:01:45",
  },
  {
    name: "sfs-legacy",
    applied: "-",
    remaining: "0.00TiB",
    updatedAt: "2026-08-12 17:01:45",
    warning: "该存储实例暂无有效申请额度，"
      + "请检查申请状态或提交资源变更。",
  },
] as const;

const privateStorage = [
  {
    name: "全闪存储",
    applied: "10TB",
    remaining: "8.42TB",
    updatedAt: "2026-08-12 17:01:45",
  },
  {
    name: "混闪存储",
    applied: "5TB",
    remaining: "3.16TB",
    updatedAt: "2026-08-12 17:01:45",
  },
] as const;

const members = [
  { label: "K", name: "Kevin" },
  { label: "L", name: "Lisa" },
  { label: "P", name: "Project Admin" },
] as const;

const publicRows = [
  ["申请空间", "XX空间"],
  ["存储配额", publicStorage],
  ["作业预算", "¥10,000.00　可用预算：¥899.23"],
  ["权重优先级", "高优项目-10"],
] as const;

const privateRows = [
  ["申请空间", "XX独立空间"],
  ["存储配额", privateStorage],
  ["空间有效期", "2025-04-12 至 2025-08-12"],
] as const;

type Project = Omit<ProjectCardProps, "onOpen" | "action"> & {
  action?: string;
};

const groups: Record<string, readonly Project[]> = {
  basic: [
    {
      name: "kevin-003",
      englishName: "pvc-test",
      status: "立项审批中",
      tone: "primary",
      rows: [
        ["项目描述", "XXXX"],
        ["申请备注", "XXXX项目"],
        ["提交时间", "2025-01-25 12:23"],
      ],
      members: [members[0]],
    },
    {
      name: "kevin-003",
      englishName: "pvc-test",
      status: "立项申请驳回",
      tone: "danger",
      rows: [
        ["项目描述", "XXXX"],
        ["申请备注", "XXXX项目"],
        ["提交时间", "2025-01-25 12:23"],
      ],
      members: [members[0]],
    },
    {
      name: "kevin-003公共空间项目",
      englishName: "pvc-test",
      status: "项目申请成功",
      tone: "success",
      rows: publicRows,
      members,
      action: "资源变更",
    },
  ],
  space: [
    {
      name: "kevin-003公共空间项目",
      englishName: "pvc-test",
      status: "项目申请成功",
      tone: "success",
      rows: publicRows,
      members,
      action: "资源变更",
    },
    {
      name: "kevin-独立空间项目",
      englishName: "pvc-test",
      status: "项目申请成功",
      tone: "success",
      rows: privateRows,
      members,
      action: "资源变更",
    },
  ],
  resource: [
    {
      name: "kevin-003公共空间项目",
      englishName: "pvc-test",
      status: "资源审批中",
      tone: "primary",
      rows: publicRows,
      members,
      action: "资源申请",
    },
    {
      name: "kevin-独立空间项目",
      englishName: "pvc-test",
      status: "资源申请驳回",
      tone: "danger",
      rows: privateRows,
      members,
      action: "资源申请",
    },
    {
      name: "基础-启智",
      englishName: "inf-inspire",
      status: "项目变更成功",
      tone: "success",
      rows: [
        ["申请空间", "HW-H800-Public"],
        ["存储配额", publicStorage],
        ["作业预算", "¥158,609.00　可用预算：¥34,706.59"],
        ["权重优先级", "普通项目-4"],
      ],
      members: members.slice(0, 2),
      action: "资源变更",
    },
  ],
  risk: [
    {
      name: "kevin-003公共空间项目",
      englishName: "pvc-test",
      status: "项目申请成功",
      tone: "success",
      rows: publicRows,
      members,
      action: "资源变更",
      risk: "可用预算不足 15%，如需继续使用，"
        + "请及时进行资源变更。",
      riskLevel: "warning",
    },
    {
      name: "kevin-003公共空间项目",
      englishName: "pvc-test",
      status: "项目申请成功",
      tone: "success",
      rows: [
        ...publicRows.slice(0, 2),
        ["作业预算", "¥10,000.00　可用预算：¥0.00"],
        publicRows[3],
      ],
      members,
      action: "资源变更",
      risk: "作业预算已耗尽，如需继续使用，"
        + "请及时进行资源变更。",
      riskLevel: "danger",
    },
    {
      name: "kevin-独立空间项目",
      englishName: "pvc-test",
      status: "项目申请成功",
      tone: "success",
      rows: privateRows,
      members,
      action: "资源变更",
      risk: "空间资源即将到期，如需继续使用，"
        + "请及时进行资源变更。",
      riskLevel: "danger",
    },
  ],
};

const options = [
  { label: "基础与审批", value: "basic" },
  { label: "空间类型", value: "space" },
  { label: "资源申请与变更", value: "resource" },
  { label: "资源风险", value: "risk" },
];

export default function ProjectCardDemo() {
  const [group, setGroup] = useState("basic");
  const [message, setMessage] = useState("");
  const projects = useMemo(() => groups[group], [group]);
  const notify = (text: string) => {
    setMessage("");
    requestAnimationFrame(() => setMessage(text));
  };
  return (
    <div className="business-project-demo">
      <Segmented
        aria-label="项目卡示例类型"
        value={group}
        options={options}
        onChange={(value) => setGroup(String(value))}
      />
      <div className="business-project-demo__grid">
        {projects.map((project, index) => (
          <ProjectCard
            key={group + "-" + index}
            {...project}
            onOpen={() => notify(
              "已进入项目“" + project.name + "”详情",
            )}
            action={project.action === undefined ? undefined : {
              label: project.action,
              icon: <InteractiveModelingIcon />,
              onClick: () => notify(
                "已打开“" + project.name + "”的" + project.action,
              ),
            }}
            onManageMembers={() => notify(
              "已打开“" + project.name + "”的成员管理",
            )}
          />
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
