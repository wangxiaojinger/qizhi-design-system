import { useMemo, useRef, useState } from "react";
import { Button } from "../button/Button";
import type { ButtonHandle } from "../button/Button.types";
import { AddIcon } from "../icon/AddIcon";
import { SearchIcon } from "../icon/generated/catalog/SearchIcon";
import { SwitchIcon } from "../icon/generated/SwitchIcon";
import { SelectModelColorIcon } from "../icon/generated/prompt/SelectModelColorIcon";
import { Input } from "../input/Input";
import { Modal } from "../modal/Modal";
import { Radio } from "../radio/Radio";
import { Select } from "../select/Select";
import type {
  ObjectSelectorItem,
  ObjectSelectorProps,
  ObjectSelectorValue,
} from "./ObjectSelector.types";
import "./objectSelector.css";

const names = (...values: Array<string | false | undefined>) => (
  values.filter(Boolean).join(" ")
);

export function ObjectSelector({
  label,
  items,
  projects,
  value,
  defaultValue,
  placeholder = label,
  searchPlaceholder = "输入模型名称搜索",
  onChange,
  className,
}: ObjectSelectorProps) {
  const controlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<ObjectSelectorValue | undefined>(
    defaultValue,
  );
  const committed = controlled ? value : innerValue;
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [project, setProject] = useState("all");
  const [draftObject, setDraftObject] = useState<string | undefined>();
  const [draftVersion, setDraftVersion] = useState<string | undefined>();
  const triggerRef = useRef<ButtonHandle>(null);

  const committedItem = items.find((item) => item.value === committed?.object);
  const draftItem = items.find((item) => item.value === draftObject);
  const visibleItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return items.filter((item) => (
      (!keyword || item.name.toLowerCase().includes(keyword))
      && (project === "all" || item.project === project)
    ));
  }, [items, project, search]);

  const show = () => {
    setSearch("");
    setProject("all");
    setDraftObject(committed?.object);
    setDraftVersion(committed?.version);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  };
  const cancel = () => close();
  const confirm = () => {
    if (!draftItem || !draftVersion) return;
    const next = { object: draftItem.value, version: draftVersion };
    if (!controlled) setInnerValue(next);
    onChange?.(next, draftItem);
    close();
  };

  return (
    <div className={names("qizhi-object-selector-field", className)}>
      <span className="qizhi-object-selector-field__label">{label}</span>
      {committed && committedItem ? (
        <article className="qizhi-selected-object">
          <span className="qizhi-selected-object__icon" aria-hidden="true">
            {committedItem.icon ?? <SelectModelColorIcon />}
          </span>
          <span className="qizhi-selected-object__body">
            <span className="qizhi-selected-object__heading">
              <strong>{committedItem.name}</strong><span>{committed.version}</span>
            </span>
            <span className="qizhi-selected-object__description">
              {committedItem.description}
            </span>
          </span>
          <Button ref={triggerRef} type="text" size="small" icon={<SwitchIcon className="qizhi-object-selector__switch-icon" />} iconPosition="after" onClick={show}>切换</Button>
        </article>
      ) : (
        <Button ref={triggerRef} type="secondary" icon={<AddIcon />} onClick={show}>{placeholder}</Button>
      )}

      <Modal
        open={open}
        title={label}
        width={920}
        className="qizhi-object-selector"
        bodyClassName="qizhi-object-selector__body"
        onCancel={cancel}
        footer={(
          <div className="qizhi-object-selector__footer">
            <span aria-live="polite">已选模型 {draftItem && draftVersion ? 1 : 0}/1</span>
            <div className="qizhi-object-selector__footer-actions">
              <Button onClick={cancel}>取消</Button>
              <Button
                type="primary"
                className="qizhi-modal__ok"
                disabled={!draftItem || !draftVersion}
                onClick={confirm}
              >确认</Button>
            </div>
          </div>
        )}
      >
        <div className="qizhi-object-selector__toolbar">
          <Input
            aria-label="搜索模型"
            value={search}
            placeholder={searchPlaceholder}
            prefix={<SearchIcon />}
            onChange={(event) => {
              const next = event.currentTarget.value;
              setSearch(next);
              const stillVisible = items.some((item) => (
                item.value === draftObject
                && item.name.toLowerCase().includes(next.trim().toLowerCase())
                && (project === "all" || item.project === project)
              ));
              if (draftObject && !stillVisible) {
                setDraftObject(undefined);
                setDraftVersion(undefined);
              }
            }}
          />
          <Select
            aria-label="筛选所属项目"
            value={project}
            options={projects.map((item) => ({
              label: `所属项目：${item.label}`,
              value: item.value,
            }))}
            onChange={(next) => {
              const nextProject = String(next ?? "all");
              setProject(nextProject);
              if (draftItem && nextProject !== "all" && draftItem.project !== nextProject) {
                setDraftObject(undefined);
                setDraftVersion(undefined);
              }
            }}
          />
        </div>
        <div className="qizhi-object-selector__main">
          <div className="qizhi-object-selector__objects" role="listbox" aria-label="模型列表">
            {visibleItems.map((item) => (
              <button
                key={item.value}
                type="button"
                className={names(
                  "qizhi-object-option",
                  draftObject === item.value && "is-selected",
                )}
                role="option"
                aria-selected={draftObject === item.value}
                onKeyDown={(event) => {
                  if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
                  event.preventDefault();
                  const index = visibleItems.indexOf(item);
                  const direction = event.key === "ArrowUp" ? -1 : 1;
                  const nextIndex = (index + direction + visibleItems.length)
                    % visibleItems.length;
                  setDraftObject(visibleItems[nextIndex].value);
                  setDraftVersion(undefined);
                  const options = event.currentTarget.parentElement
                    ?.querySelectorAll<HTMLElement>('[role="option"]');
                  options?.[nextIndex]?.focus();
                }}
                onClick={() => {
                  setDraftObject(item.value);
                  setDraftVersion(undefined);
                }}
              >
                <span className="qizhi-object-option__icon" aria-hidden="true">
                  {item.icon ?? <SelectModelColorIcon />}
                </span>
                <span className="qizhi-object-option__body">
                  <strong>{item.name}</strong>
                  {item.meta ? <span>{item.meta}</span> : null}
                </span>
              </button>
            ))}
          </div>
          <div className="qizhi-object-selector__properties">
            <h4>版本选择</h4>
            {draftItem ? (
              <Radio.Group
                key={draftItem.value}
                aria-label="选择模型版本"
                value={draftVersion}
                onChange={(next) => setDraftVersion(String(next))}
              >
                {draftItem.versions.map((version) => (
                  <Radio
                    key={version.value}
                    value={version.value}
                    className="qizhi-object-property-option"
                  >
                    <span className="qizhi-object-property-option__text">
                      <strong>{version.value}</strong>
                      {version.description ? <span>{version.description}</span> : null}
                    </span>
                  </Radio>
                ))}
              </Radio.Group>
            ) : <p className="qizhi-object-selector__empty">请先选择一个模型</p>}
          </div>
        </div>
      </Modal>
    </div>
  );
}
