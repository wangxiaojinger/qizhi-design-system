export type AgentScope = "mine" | "all";
export type SortDirection = "ascend" | "descend";
export type InstructionMode = "manual" | "upload";
export type DemoListState = "normal" | "loading" | "empty" | "failure";

export interface SkillRecord {
  id: string;
  name: string;
  version: string;
  project: string;
  creator: string;
  summary: string;
}

export interface McpRecord {
  id: string;
  name: string;
  version: string;
  status: "运行中" | "异常";
  tools: number;
  project: string;
  creator: string;
  updatedAt: string;
  selectable: boolean;
}

export interface UploadMetadata {
  name: string;
  size: number;
  type: string;
}

export interface AgentVersion {
  version: string;
  instructionMode: InstructionMode;
  instructionContent: string;
  instructionFile: UploadMetadata | null;
  skills: SkillRecord[];
  mcps: McpRecord[];
  createdAt: string;
}

export interface AgentRecord {
  id: string;
  name: string;
  description: string;
  project: string;
  tags: string[];
  creator: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: string;
  versions: AgentVersion[];
  deleteBehavior: "success" | "failure" | "blocked";
}

export interface AgentDraft {
  version: string;
  name: string;
  project: string;
  tags: string[];
  description: string;
  instructionMode: InstructionMode;
  instructionContent: string;
  instructionFile: UploadMetadata | null;
  skills: SkillRecord[];
  mcps: McpRecord[];
}

export interface AgentFilters {
  scope: AgentScope;
  keyword: string;
  project: string;
  sortDirection: SortDirection;
  currentUser: string;
}

export interface PaginatedAgents {
  items: AgentRecord[];
  start: number;
  end: number;
  total: number;
}

export interface AgentMutationResult {
  agents: AgentRecord[];
  agent: AgentRecord;
  draft: AgentDraft;
}

export interface AddVersionResult extends AgentMutationResult {
  version: AgentVersion;
}

export interface DeleteAgentResult {
  agents: AgentRecord[];
  status: "success" | "failure" | "blocked" | "not_found";
}

export type AgentFormMode = "create" | "copy" | "edit" | "version";

