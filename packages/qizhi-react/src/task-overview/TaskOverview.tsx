import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "../button/Button";
import { MetricCard } from "../business-metrics/BusinessMetrics";
import { TaskCard } from "../business-objects/BusinessObjects";
import { Select } from "../select/Select";
import { interpolateLocaleMessage, useLocale } from "../locale/LocaleProvider";
import type { TaskOverviewProps } from "./TaskOverview.types";
import "./taskOverview.css";

export function TaskOverview({
  title,
  metrics,
  tasks,
  spaces,
  defaultType,
  defaultSpace,
  initialVisibleCount = 4,
  className,
  ...rest
}: TaskOverviewProps) {
  const { t } = useLocale();
  const allSpace = defaultSpace ?? t("taskOverview.all");
  const [type, setType] = useState(defaultType);
  const [space, setSpace] = useState(allSpace);
  const [expanded, setExpanded] = useState(false);
  const titleId = `qizhi-task-overview-${useId()}`;
  useEffect(() => {
    setSpace(allSpace);
    setExpanded(false);
  }, [allSpace]);
  const matching = useMemo(() => tasks.filter((task) => (
    task.type === type
    && (space === allSpace || task.spaceValue === space)
  )), [allSpace, space, tasks, type]);
  const visible = expanded ? matching : matching.slice(0, initialVisibleCount);

  return (
    <section
      {...rest}
      className={["qizhi-task-overview", className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      <header>
        <h3 id={titleId}>{title ?? t("taskOverview.title")}</h3>
        <Select
          aria-label={t("taskOverview.filterAriaLabel")}
          className="qizhi-task-overview__space"
          value={space}
          options={spaces.map((item) => ({
            value: item,
            label: interpolateLocaleMessage(t("taskOverview.space"), { name: item }),
          }))}
          renderOption={(option) => String(option.value)}
          onChange={(value) => {
            setSpace(String(value));
            setExpanded(false);
          }}
        />
      </header>
      <div className="qizhi-task-overview__grid" role="group"
        aria-label={t("taskOverview.groupAriaLabel")}>
        {metrics.map(({ key, ...metric }) => (
          <MetricCard
            key={key}
            {...metric}
            selected={type === key}
            onClick={() => {
              setType(key);
              setExpanded(false);
            }}
          />
        ))}
      </div>
      <div className="qizhi-task-overview__results">
        <div className="qizhi-task-overview__list">
          {visible.map(({
            key, type: _type, spaceValue: _spaceValue, ...task
          }) => <TaskCard key={key} {...task} />)}
        </div>
        {matching.length > initialVisibleCount ? (
          <Button type="text" aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}>
            {expanded ? t("common.collapse") : t("common.viewAll")}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
