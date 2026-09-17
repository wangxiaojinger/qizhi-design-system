import type {
  AddVersionResult,
  AgentDraft,
  AgentFilters,
  AgentMutationResult,
  AgentRecord,
  AgentVersion,
  DeleteAgentResult,
  PaginatedAgents,
} from "./types";

const DEFAULT_NOW = "2026-08-27 15:00:00";

export const validateAgentName = (name: string): string => {
  if (!name) return "请输入 Agent 名称";
  if (name.length > 64) return "Agent 名称不能超过 64 个字符";
  if (!/^[A-Za-z][A-Za-z0-9_.-]*$/.test(name)) {
    return "名称只能包含字母、数字、下划线、短横线和点，且必须以字母开头";
  }
  return "";
};

export const getVersion = (agent: AgentRecord, version: string): AgentVersion =>
  agent.versions.find((item) => item.version === version) ?? agent.versions[0];

export const getAgentDraft = (agent: AgentRecord, version = agent.currentVersion): AgentDraft => {
  const selected = getVersion(agent, version);
  return {
    version: selected.version,
    name: agent.name,
    project: agent.project,
    tags: [...agent.tags],
    description: agent.description,
    instructionMode: selected.instructionMode,
    instructionContent: selected.instructionContent,
    instructionFile: selected.instructionFile ? { ...selected.instructionFile } : null,
    skills: selected.skills.map((skill) => ({ ...skill })),
    mcps: selected.mcps.map((mcp) => ({ ...mcp })),
  };
};

export const getEmptyDraft = (): AgentDraft => ({
  version: "V1",
  name: "",
  project: "",
  tags: [],
  description: "",
  instructionMode: "manual",
  instructionContent: "",
  instructionFile: null,
  skills: [],
  mcps: [],
});

export const getCopyDraft = (agent: AgentRecord): AgentDraft => ({
  ...getAgentDraft(agent),
  version: "V1",
  name: "",
});

export const applyAgentFilters = (agents: AgentRecord[], filters: AgentFilters): AgentRecord[] => {
  const keyword = filters.keyword.trim().toLowerCase();
  return agents
    .filter((agent) => filters.scope === "all" || agent.creator === filters.currentUser)
    .filter((agent) => !keyword || agent.name.toLowerCase().includes(keyword))
    .filter((agent) => !filters.project || agent.project === filters.project)
    .sort((left, right) => {
      const difference = new Date(left.updatedAt.replace(" ", "T")).getTime() -
        new Date(right.updatedAt.replace(" ", "T")).getTime();
      return filters.sortDirection === "ascend" ? difference : -difference;
    });
};

export const paginateAgents = (
  agents: AgentRecord[],
  current: number,
  pageSize: number,
): PaginatedAgents => {
  const startIndex = Math.max(0, (current - 1) * pageSize);
  const items = agents.slice(startIndex, startIndex + pageSize);
  return {
    items,
    start: agents.length === 0 ? 0 : startIndex + 1,
    end: Math.min(startIndex + items.length, agents.length),
    total: agents.length,
  };
};

const nextAgentId = (agents: AgentRecord[]): string => {
  let sequence = agents.length + 1;
  while (agents.some((agent) => agent.id === `agent-mock-${sequence}`)) sequence += 1;
  return `agent-mock-${sequence}`;
};

const versionFromDraft = (draft: AgentDraft, version: string, now: string): AgentVersion => ({
  version,
  instructionMode: draft.instructionMode,
  instructionContent: draft.instructionContent,
  instructionFile: draft.instructionFile ? { ...draft.instructionFile } : null,
  skills: draft.skills.map((skill) => ({ ...skill })),
  mcps: draft.mcps.map((mcp) => ({ ...mcp })),
  createdAt: now,
});

export const createAgent = (
  agents: AgentRecord[],
  draft: AgentDraft,
  now = DEFAULT_NOW,
): AgentMutationResult => {
  const version = versionFromDraft(draft, "V1", now);
  const agent: AgentRecord = {
    id: nextAgentId(agents),
    name: draft.name,
    description: draft.description,
    project: draft.project,
    tags: [...draft.tags],
    creator: "inspire-admin",
    createdAt: now,
    updatedAt: now,
    currentVersion: "V1",
    versions: [version],
    deleteBehavior: "success",
  };
  return { agents: [agent, ...agents], agent, draft: getAgentDraft(agent) };
};

export const updateAgent = (
  agents: AgentRecord[],
  agentId: string,
  draft: AgentDraft,
  now = DEFAULT_NOW,
): AgentMutationResult => {
  const source = agents.find((agent) => agent.id === agentId);
  if (!source) throw new Error("Agent 不存在");
  const versionName = draft.version || source.currentVersion;
  const replacement = versionFromDraft(draft, versionName, now);
  const agent: AgentRecord = {
    ...source,
    name: draft.name,
    project: draft.project,
    tags: [...draft.tags],
    description: draft.description,
    updatedAt: now,
    versions: source.versions.map((version) =>
      version.version === versionName ? replacement : version,
    ),
  };
  return {
    agents: agents.map((item) => (item.id === agentId ? agent : item)),
    agent,
    draft: getAgentDraft(agent, versionName),
  };
};

export const addAgentVersion = (
  agents: AgentRecord[],
  agentId: string,
  draft: AgentDraft,
  now = DEFAULT_NOW,
): AddVersionResult => {
  const source = agents.find((agent) => agent.id === agentId);
  if (!source) throw new Error("Agent 不存在");
  const largest = source.versions.reduce((maximum, version) => {
    const value = Number(version.version.replace(/^V/, ""));
    return Number.isFinite(value) ? Math.max(maximum, value) : maximum;
  }, 0);
  const version = versionFromDraft(draft, `V${largest + 1}`, now);
  const agent: AgentRecord = {
    ...source,
    name: draft.name,
    project: draft.project,
    tags: [...draft.tags],
    description: draft.description,
    updatedAt: now,
    versions: [...source.versions, version],
  };
  return {
    agents: agents.map((item) => (item.id === agentId ? agent : item)),
    agent,
    version,
    draft: getAgentDraft(agent, version.version),
  };
};

export const deleteAgent = (agents: AgentRecord[], agentId: string): DeleteAgentResult => {
  const source = agents.find((agent) => agent.id === agentId);
  if (!source) return { agents, status: "not_found" };
  if (source.deleteBehavior === "failure") return { agents, status: "failure" };
  if (source.deleteBehavior === "blocked") return { agents, status: "blocked" };
  return { agents: agents.filter((agent) => agent.id !== agentId), status: "success" };
};

