import { describe, expect, it } from "vitest";
import {
  addAgentVersion,
  applyAgentFilters,
  createAgent,
  deleteAgent,
  getCopyDraft,
  paginateAgents,
  updateAgent,
  validateAgentName,
} from "./agentModel";
import { createMockAgents } from "./mockData";

describe("Agent Mock domain", () => {
  it("validates the confirmed Agent name rules and exact messages", () => {
    expect(validateAgentName("")).toBe("请输入 Agent 名称");
    expect(validateAgentName("1agent")).toBe(
      "名称只能包含字母、数字、下划线、短横线和点，且必须以字母开头",
    );
    expect(validateAgentName(`a${"b".repeat(64)}`)).toBe(
      "Agent 名称不能超过 64 个字符",
    );
    expect(validateAgentName("agent_v1.2-test")).toBe("");
  });

  it("combines owner range, keyword, project, and time sorting", () => {
    const agents = createMockAgents();
    const result = applyAgentFilters(agents, {
      scope: "mine",
      keyword: "memory",
      project: "基础-启智",
      sortDirection: "ascend",
      currentUser: "inspire-admin",
    });

    expect(result.length).toBeGreaterThan(1);
    expect(result.every((agent) => agent.creator === "inspire-admin")).toBe(true);
    expect(result.every((agent) => agent.project === "基础-启智")).toBe(true);
    expect(result.every((agent) => agent.name.toLowerCase().includes("memory"))).toBe(true);
    expect(new Date(result[0].updatedAt).getTime()).toBeLessThanOrEqual(
      new Date(result.at(-1)?.updatedAt ?? 0).getTime(),
    );
  });

  it("paginates without mutating the source", () => {
    const agents = createMockAgents();
    const original = [...agents];
    const page = paginateAgents(agents, 2, 10);

    expect(page.items).toHaveLength(10);
    expect(page.start).toBe(11);
    expect(page.end).toBe(20);
    expect(agents).toEqual(original);
  });

  it("creates, updates, copies, versions, and deletes immutable Mock records", () => {
    const agents = createMockAgents();
    const source = agents[0];
    const copied = getCopyDraft(source);
    expect(copied.name).toBe("");
    expect(copied.description).toBe(source.description);

    const created = createAgent(agents, {
      ...copied,
      name: "created-agent",
      project: "基础-启智",
      instructionMode: "manual",
      instructionContent: "# Created",
    });
    expect(created.agents).toHaveLength(agents.length + 1);
    expect(agents).toHaveLength(createMockAgents().length);

    const updated = updateAgent(created.agents, created.agent.id, {
      ...created.draft,
      description: "已编辑描述",
    });
    expect(updated.agent.description).toBe("已编辑描述");

    const versioned = addAgentVersion(updated.agents, updated.agent.id, {
      ...created.draft,
      instructionContent: "# V2",
    });
    expect(versioned.agent.versions).toHaveLength(2);
    expect(versioned.version.version).toBe("V2");
    expect(versioned.agent.currentVersion).toBe("V1");

    const deleted = deleteAgent(versioned.agents, versioned.agent.id);
    expect(deleted.status).toBe("success");
    expect(deleted.agents.some((agent) => agent.id === versioned.agent.id)).toBe(false);
  });

  it("keeps deterministic deletion failure and reference-blocked records", () => {
    const agents = createMockAgents();
    expect(deleteAgent(agents, "agent-delete-fail").status).toBe("failure");
    expect(deleteAgent(agents, "agent-in-use").status).toBe("blocked");
    expect(deleteAgent(agents, "missing").status).toBe("not_found");
  });
});

