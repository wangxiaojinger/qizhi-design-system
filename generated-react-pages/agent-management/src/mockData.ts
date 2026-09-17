import type { AgentRecord, McpRecord, SkillRecord } from "./types";

export const CURRENT_MOCK_USER = "inspire-admin";

export const MOCK_SKILLS: SkillRecord[] = [
  {
    id: "skill-memory",
    name: "长期记忆",
    version: "V1.2",
    project: "基础-启智",
    creator: "anyi",
    summary: "为 Agent 提供结构化记忆检索能力",
  },
  {
    id: "skill-risk",
    name: "风险识别",
    version: "V2.0",
    project: "金融智能",
    creator: "kevin",
    summary: "识别文本中的风险信号并给出分类",
  },
  {
    id: "skill-report",
    name: "报告生成",
    version: "V1.0",
    project: "模型服务",
    creator: "inspire-admin",
    summary: "根据结构化输入生成分析报告",
  },
];

export const MOCK_MCPS: McpRecord[] = [
  {
    id: "mcp-knowledge",
    name: "知识库 MCP",
    version: "V1.4",
    status: "运行中",
    tools: 6,
    project: "基础-启智",
    creator: "anyi",
    updatedAt: "2026-08-26 18:20:12",
    selectable: true,
  },
  {
    id: "mcp-search",
    name: "联网检索 MCP",
    version: "V2.1",
    status: "运行中",
    tools: 4,
    project: "模型服务",
    creator: "kevin",
    updatedAt: "2026-08-25 09:10:08",
    selectable: true,
  },
  {
    id: "mcp-broken",
    name: "异常示例 MCP",
    version: "V1.0",
    status: "异常",
    tools: 2,
    project: "智算平台",
    creator: "inspire-admin",
    updatedAt: "2026-08-20 11:14:33",
    selectable: false,
  },
];

const PROJECTS = ["基础-启智", "模型服务", "智算平台"];
const DESCRIPTIONS = [
  "面向知识管理场景，完成检索、归纳与引用整理。",
  "根据业务输入生成结构化分析结果。",
  "用于演示 Agent 配置、版本与能力管理。",
];

export const createMockAgents = (): AgentRecord[] =>
  Array.from({ length: 31 }, (_, index) => {
    const number = index + 1;
    const project = PROJECTS[index % PROJECTS.length];
    const creator = index % 2 === 0 ? CURRENT_MOCK_USER : "anyi";
    const isMemory = index % 3 === 0;
    const id =
      index === 0
        ? "agent-in-use"
        : index === 1
          ? "agent-delete-fail"
          : `agent-${String(number).padStart(2, "0")}`;
    const day = String(27 - (index % 20)).padStart(2, "0");
    const updatedAt = `2026-08-${day} ${String(18 - (index % 10)).padStart(2, "0")}:20:${String(
      10 + (index % 40),
    ).padStart(2, "0")}`;
    const name = `${isMemory ? "memory" : "analysis"}-agent-${String(number).padStart(2, "0")}`;
    const instructionContent = `# ${name}\n\n你是一个用于交互演示的 Agent。\n\n- 只处理演示数据\n- 不连接真实服务`;
    const versions = [
      {
        version: "V1",
        instructionMode: "manual" as const,
        instructionContent,
        instructionFile: null,
        skills: index % 2 === 0 ? [MOCK_SKILLS[0]] : [],
        mcps: index % 3 === 0 ? [MOCK_MCPS[0]] : [],
        createdAt: updatedAt,
      },
    ];

    if (index === 2) {
      versions.push({
        ...versions[0],
        version: "V2",
        instructionContent: `${instructionContent}\n- 当前版本增加结果校验`,
        createdAt: "2026-08-27 10:30:00",
      });
    }

    return {
      id,
      name,
      description: DESCRIPTIONS[index % DESCRIPTIONS.length],
      project,
      tags: index % 4 === 0 ? [] : [index % 2 === 0 ? "知识管理" : "业务分析"],
      creator,
      createdAt: `2026-07-${String(1 + (index % 28)).padStart(2, "0")} 09:00:00`,
      updatedAt,
      currentVersion: index === 2 ? "V2" : "V1",
      versions,
      deleteBehavior: index === 0 ? "blocked" : index === 1 ? "failure" : "success",
    };
  });
