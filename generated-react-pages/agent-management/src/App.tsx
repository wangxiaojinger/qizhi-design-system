import { useEffect, useMemo, useState } from "react";
import { Message } from "@wangxiaojinger/qizhi-react";
import {
  addAgentVersion,
  applyAgentFilters,
  createAgent,
  deleteAgent,
  getAgentDraft,
  getCopyDraft,
  getEmptyDraft,
  paginateAgents,
  updateAgent,
} from "./agentModel";
import { AgentDetailView } from "./AgentDetailView";
import { AgentFormDrawer } from "./AgentFormDrawer";
import { AgentListView } from "./AgentListView";
import { AgentProductShell } from "./AgentProductShell";
import { DeleteAgentModal } from "./DeleteAgentModal";
import type { DeleteDialogStatus } from "./DeleteAgentModal";
import { createMockAgents, CURRENT_MOCK_USER } from "./mockData";
import type {
  AgentDraft,
  AgentFilters,
  AgentFormMode,
  AgentRecord,
} from "./types";

interface FormState {
  mode: AgentFormMode;
  draft: AgentDraft;
  agentId?: string;
}

const INITIAL_FILTERS: AgentFilters = {
  scope: "mine",
  keyword: "",
  project: "",
  sortDirection: "descend",
  currentUser: CURRENT_MOCK_USER,
};

export default function App() {
  const [agents, setAgents] = useState(createMockAgents);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [deleteAgentId, setDeleteAgentId] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<DeleteDialogStatus>("idle");
  const filteredAgents = useMemo(
    () => applyAgentFilters(agents, filters),
    [agents, filters],
  );
  const page = paginateAgents(filteredAgents, current, pageSize);
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) ?? null;
  const pendingDeleteAgent = agents.find((agent) => agent.id === deleteAgentId) ?? null;

  useEffect(() => {
    const maximumPage = Math.max(1, Math.ceil(filteredAgents.length / pageSize));
    if (current > maximumPage) setCurrent(maximumPage);
  }, [current, filteredAgents.length, pageSize]);

  const updateFilters = (next: Partial<AgentFilters>) => {
    setFilters((currentFilters) => ({ ...currentFilters, ...next }));
    setCurrent(1);
  };

  const openDetail = (agent: AgentRecord) => {
    setSelectedAgentId(agent.id);
    setSelectedVersion(agent.currentVersion);
    setView("detail");
  };

  const openDelete = (agent: AgentRecord) => {
    setDeleteAgentId(agent.id);
    setDeleteStatus("idle");
  };

  const closeDelete = () => {
    setDeleteAgentId(null);
    setDeleteStatus("idle");
  };

  const confirmDelete = () => {
    if (!deleteAgentId) return;
    setDeleteStatus("submitting");
    window.setTimeout(() => {
      const result = deleteAgent(agents, deleteAgentId);
      if (result.status === "failure") {
        setDeleteStatus("failure");
        return;
      }
      if (result.status === "blocked") {
        setDeleteStatus("blocked");
        return;
      }
      if (result.status === "success") {
        setAgents(result.agents);
        if (selectedAgentId === deleteAgentId) {
          setView("list");
          setSelectedAgentId(null);
        }
        closeDelete();
        Message.success("Agent 已删除");
        return;
      }
      setDeleteStatus("failure");
    }, 180);
  };

  const submitForm = async (draft: AgentDraft) => {
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    if (draft.name === "fail-agent") {
      return { ok: false, message: "新建失败，请重试" };
    }
    if (!formState) return { ok: false, message: "表单状态已失效，请重新打开" };
    try {
      if (formState.mode === "edit" && formState.agentId) {
        const result = updateAgent(agents, formState.agentId, draft, new Date().toLocaleString("sv-SE"));
        setAgents(result.agents);
        Message.success("Agent 已保存");
      } else if (formState.mode === "version" && formState.agentId) {
        const result = addAgentVersion(agents, formState.agentId, draft, new Date().toLocaleString("sv-SE"));
        setAgents(result.agents);
        setSelectedVersion(result.version.version);
        Message.success(`${result.version.version} 已新增`);
      } else {
        const result = createAgent(agents, draft, new Date().toLocaleString("sv-SE"));
        setAgents(result.agents);
        setFilters((currentFilters) => ({ ...currentFilters, scope: "mine", keyword: "", project: "" }));
        setCurrent(1);
        Message.success(formState.mode === "copy" ? "Agent 已复制" : "Agent 已新建");
      }
      setFormState(null);
      return { ok: true };
    } catch {
      return { ok: false, message: "提交失败，请重试" };
    }
  };

  return (
    <AgentProductShell>
      <div className="agent-page-main">
        {view === "detail" && selectedAgent ? (
          <AgentDetailView
            agent={selectedAgent}
            selectedVersion={selectedVersion || selectedAgent.currentVersion}
            onVersionChange={setSelectedVersion}
            onBack={() => setView("list")}
            onEdit={() => setFormState({
              mode: "edit",
              agentId: selectedAgent.id,
              draft: getAgentDraft(selectedAgent, selectedVersion || selectedAgent.currentVersion),
            })}
            onDelete={() => openDelete(selectedAgent)}
            onAddVersion={() => setFormState({
              mode: "version",
              agentId: selectedAgent.id,
              draft: {
                ...getAgentDraft(selectedAgent, selectedVersion || selectedAgent.currentVersion),
                version: `V${selectedAgent.versions.length + 1}`,
              },
            })}
          />
        ) : (
          <AgentListView
            filters={filters}
            page={page}
            current={current}
            pageSize={pageSize}
            onFiltersChange={updateFilters}
            onCurrentChange={setCurrent}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setCurrent(1);
            }}
            onRefresh={() => {
              Message.success("列表已刷新");
            }}
            onCreate={() => setFormState({ mode: "create", draft: getEmptyDraft() })}
            onCopy={(agent) => setFormState({ mode: "copy", draft: getCopyDraft(agent) })}
            onDetail={openDetail}
            onEdit={(agent) => setFormState({ mode: "edit", agentId: agent.id, draft: getAgentDraft(agent) })}
            onDelete={openDelete}
          />
        )}
        <AgentFormDrawer
          open={formState !== null}
          mode={formState?.mode ?? "create"}
          initialDraft={formState?.draft ?? getEmptyDraft()}
          onClose={() => setFormState(null)}
          onSubmit={submitForm}
        />
        <DeleteAgentModal
          open={deleteAgentId !== null}
          agent={pendingDeleteAgent}
          status={deleteStatus}
          onCancel={closeDelete}
          onConfirm={confirmDelete}
        />
      </div>
    </AgentProductShell>
  );
}
