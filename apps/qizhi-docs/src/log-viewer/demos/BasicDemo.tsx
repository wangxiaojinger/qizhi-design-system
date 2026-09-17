import { LogViewer } from "@wangxiaojinger/qizhi-react";

const logs = [
  { id: "1", timestamp: "10:22:22", level: "info" as const, message: "Created container qizhi-agent-01" },
  { id: "2", timestamp: "10:22:23", level: "debug" as const, message: "Loaded Skill.md configuration" },
  { id: "3", timestamp: "10:22:24", level: "warning" as const, message: "GPU utilization is above 80%" },
  { id: "4", timestamp: "10:22:25", level: "error" as const, message: "Readiness probe timed out" },
];

export default function BasicDemo() {
  return <LogViewer logs={logs} showLineNumbers levelFilter={[]} />;
}
