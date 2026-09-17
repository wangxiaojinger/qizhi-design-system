import { LogViewer } from "@wangxiaojinger/qizhi-react";

const logs = [
  { id: "1", timestamp: "12:00:00", level: "debug" as const, message: "Loaded runtime variables" },
  { id: "2", timestamp: "12:00:01", level: "info" as const, message: "Agent is ready" },
  { id: "3", timestamp: "12:00:02", level: "warning" as const, message: "Retrying dataset connection" },
  { id: "4", timestamp: "12:00:03", level: "error" as const, message: "Dataset connection failed" },
];

export default function FilterDemo() {
  return <LogViewer logs={logs} searchable levelFilter={["debug", "info", "warning", "error"]} />;
}
