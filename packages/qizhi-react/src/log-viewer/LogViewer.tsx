import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../button/Button";
import { Empty } from "../empty/Empty";
import { RefreshIcon } from "../icon/generated/catalog/RefreshIcon";
import { Input } from "../input/Input";
import { Select } from "../select/Select";
import { Spin } from "../spin/Spin";
import { TextViewport } from "../content-viewer/TextViewport";
import { Tooltip } from "../tooltip/Tooltip";
import type {
  LogLevel,
  LogViewerProps,
} from "./LogViewer.types";
import "./logViewer.css";

const allLevels: LogLevel[] = ["debug", "info", "warning", "error"];
const levelLabels: Record<LogLevel, string> = {
  debug: "调试",
  info: "信息",
  warning: "警告",
  error: "错误",
};

export function LogViewer({
  logs,
  status = "idle",
  loading = false,
  refreshing = false,
  refreshable = false,
  onRefresh,
  autoFollow,
  onAutoFollowChange,
  searchable = false,
  levelFilter = allLevels,
  showLineNumbers = false,
  maxHeight = 360,
  emptyText = "暂无日志",
  className,
  "aria-label": ariaLabel = "日志查看器",
}: LogViewerProps) {
  const [query, setQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([]);
  const [internalFollow, setInternalFollow] = useState(true);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const following = autoFollow ?? internalFollow;

  const setFollowing = (next: boolean) => {
    if (autoFollow === undefined) setInternalFollow(next);
    onAutoFollowChange?.(next);
  };

  const filteredLogs = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    return logs.filter((entry) => {
      if (selectedLevels.length && (!entry.level || !selectedLevels.includes(entry.level))) {
        return false;
      }
      if (!keyword) return true;
      return [entry.timestamp, entry.level, entry.message]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
        .includes(keyword);
    });
  }, [logs, query, selectedLevels]);

  useEffect(() => {
    if (!following || !viewportRef.current) return;
    const viewport = viewportRef.current;
    if (typeof viewport.scrollTo === "function") {
      viewport.scrollTo({ top: viewport.scrollHeight });
    } else {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [filteredLogs, following]);

  const onScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport || !following) return;
    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    if (distanceFromBottom > 24) setFollowing(false);
  };

  const resumeFollowing = () => {
    setFollowing(true);
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  };

  return (
    <section
      className={["qizhi-log-viewer", `qizhi-log-viewer--${status}`, className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      {searchable || levelFilter.length || refreshable || !following ? (
        <div className="qizhi-log-viewer__toolbar">
          {searchable ? (
            <Input
              aria-label="搜索日志"
              placeholder="搜索日志"
              value={query}
              allowClear
              onChange={(event) => setQuery(event.target.value)}
            />
          ) : null}
          {levelFilter.length ? (
            <Select
              aria-label="筛选日志等级"
              mode="multiple"
              placeholder="日志等级"
              value={selectedLevels}
              options={levelFilter.map((level) => ({
                label: levelLabels[level],
                value: level,
              }))}
              onChange={(value) => setSelectedLevels(value.map(String) as LogLevel[])}
            />
          ) : null}
          {!following ? (
            <Button type="secondary" size="small" onClick={resumeFollowing}>
              继续跟随
            </Button>
          ) : null}
          {refreshable ? (
            <Tooltip content={refreshing ? "日志获取中，请稍后…" : status === "running" ? "实例运行中，日志将自动更新" : "刷新日志"}>
              <Button
                type="secondary"
                size="small"
                icon={<RefreshIcon />}
                disabled={refreshing}
                aria-label={refreshing ? "正在刷新日志" : "刷新日志"}
                onClick={onRefresh}
              >
                刷新
              </Button>
            </Tooltip>
          ) : null}
        </div>
      ) : null}
      {loading ? (
        <div className="qizhi-log-viewer__state">
          <Spin aria-label="正在加载日志" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="qizhi-log-viewer__state">
          <Empty description={emptyText} />
        </div>
      ) : (
        <TextViewport
          ref={viewportRef}
          maxHeight={maxHeight}
          aria-label="运行日志内容"
          onScroll={onScroll}
        >
          <div className="qizhi-log-viewer__viewport">
            {filteredLogs.map((entry, index) => (
              <div className={`qizhi-log-viewer__line qizhi-log-viewer__line--${entry.level ?? "info"}`} key={entry.id}>
                {showLineNumbers ? (
                  <span className="qizhi-log-viewer__line-number" aria-hidden="true">{index + 1}</span>
                ) : null}
                {entry.timestamp ? <time className="qizhi-log-viewer__timestamp">{entry.timestamp}</time> : null}
                {entry.level ? <span className="qizhi-log-viewer__level">{entry.level.toUpperCase()}</span> : null}
                <span className="qizhi-log-viewer__message">{entry.message}</span>
              </div>
            ))}
          </div>
        </TextViewport>
      )}
    </section>
  );
}
