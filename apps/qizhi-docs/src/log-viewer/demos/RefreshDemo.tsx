import { useEffect, useRef, useState } from "react";
import { LogViewer } from "@wangxiaojinger/qizhi-react";

export default function RefreshDemo() {
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const refresh = () => {
    setRefreshing(true);
    timerRef.current = window.setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <LogViewer
      logs={[{ id: "1", timestamp: "11:00:00", level: "info", message: "日志由页面传入" }]}
      status="idle"
      refreshable
      refreshing={refreshing}
      onRefresh={refresh}
      levelFilter={[]}
    />
  );
}
