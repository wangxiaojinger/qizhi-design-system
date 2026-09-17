import { useEffect, useState } from "react";
import { LogViewer } from "@wangxiaojinger/qizhi-react";
import type { LogEntry } from "@wangxiaojinger/qizhi-react";

const initialLogs: LogEntry[] = [
  { id: "1", timestamp: "10:30:00", level: "info", message: "Agent instance started" },
];

export default function LiveDemo() {
  const [logs, setLogs] = useState(initialLogs);
  const [autoFollow, setAutoFollow] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLogs((current) => {
        if (current.length >= 8) return current;
        const sequence = current.length + 1;
        return [...current, {
          id: String(sequence),
          timestamp: `10:30:${String(sequence).padStart(2, "0")}`,
          level: "info",
          message: `Mock log entry ${sequence}`,
        }];
      });
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <LogViewer
      logs={logs}
      status={autoFollow ? "running" : "paused"}
      autoFollow={autoFollow}
      onAutoFollowChange={setAutoFollow}
      levelFilter={[]}
      maxHeight={260}
    />
  );
}
