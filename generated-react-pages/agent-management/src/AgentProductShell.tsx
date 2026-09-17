import type { ReactNode } from "react";
import { PlatformShell } from "@wangxiaojinger/qizhi-react";

interface AgentProductShellProps {
  children: ReactNode;
}

export function AgentProductShell({ children }: AgentProductShellProps) {
  return (
    <PlatformShell
      className="agent-page-product-shell"
      selectedKey="agent"
      sideNavigationProps={{
        selectedKey: "agent-item",
        workspaces: ["HW-H800-Public"],
        defaultWorkspace: "HW-H800-Public",
        className: "agent-page-side-navigation",
      }}
    >
      {children}
    </PlatformShell>
  );
}
