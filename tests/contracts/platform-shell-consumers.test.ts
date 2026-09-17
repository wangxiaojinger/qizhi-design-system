import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

const prohibitedShellComposition = [
  "Layout.Header",
  "Layout.Sider",
  "TopNavigation",
  "SideNavigation",
];

describe("generated page PlatformShell consumers", () => {
  it("uses one public PlatformShell root for the AI lifecycle workbench", () => {
    const source = readSource(
      "generated-react-pages/ai-lifecycle-workbench/src/App.tsx",
    );

    expect(source).toContain("PlatformShell");
    expect(source).not.toContain("<main");
    prohibitedShellComposition.forEach((fragment) => {
      expect(source).not.toContain(fragment);
    });
  });

  it("uses one public PlatformShell root for Agent Management", () => {
    const source = readSource(
      "generated-react-pages/agent-management/src/AgentProductShell.tsx",
    );

    expect(source).toContain("PlatformShell");
    expect(source).not.toContain("<main");
    prohibitedShellComposition.forEach((fragment) => {
      expect(source).not.toContain(fragment);
    });
  });

  it("does not reach into PlatformShell private descendants from page CSS", () => {
    const workbenchCss = readSource(
      "generated-react-pages/ai-lifecycle-workbench/src/page.css",
    );
    const agentCss = readSource(
      "generated-react-pages/agent-management/src/page.css",
    );

    expect(workbenchCss).not.toContain(".qizhi-platform-shell__");
    expect(agentCss).not.toContain(".qizhi-platform-shell__");
    expect(agentCss).not.toContain(
      ".qizhi-side-navigation.agent-page-side-navigation",
    );
  });
});
