import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import type { ButtonHandle } from "../button/Button.types";
import { Button } from "../button/Button";
import { Checkbox } from "../checkbox/Checkbox";
import { InputNumber } from "../input-number/InputNumber";
import { Popover } from "../popover/Popover";
import type { TableColumnCustomizationLocale } from "./TableColumnLayout.types";
import "./columnSettings.css";

export interface ColumnSettingsItem {
  key: string;
  label: string;
  visible: boolean;
  hideable: boolean;
  visibilityDisabledReason?: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  resizable: boolean;
  canMoveBefore: boolean;
  canMoveAfter: boolean;
}

export interface ColumnSettingsProps {
  items: readonly ColumnSettingsItem[];
  visibility: boolean;
  reorder: boolean;
  resize: boolean;
  disabled?: boolean;
  locale?: Partial<TableColumnCustomizationLocale>;
  renderTrigger?: (trigger: ReactElement) => ReactNode;
  onVisibility: (key: string, visible: boolean) => void;
  onVisibilityAll: (visible: boolean) => void;
  onMove: (key: string, direction: -1 | 1) => void;
  onResize: (key: string, width: number) => void;
  onReset: () => void;
}

const defaultLocale: TableColumnCustomizationLocale = {
  settings: "列设置",
  reset: "恢复默认",
  selectAll: "全选",
  moveBefore: "前移",
  moveAfter: "后移",
  resize: "列宽",
  required: "必选",
  minimumVisible: "至少保留一列数据",
};

const hasOwn = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value, key);

const getNumberBound = (value: number) => (Number.isFinite(value) ? value : undefined);

const clampWidth = (value: string, item: ColumnSettingsItem) => {
  const parsed = Number(value);
  if (value.trim() === "" || !Number.isFinite(parsed)) return undefined;
  const min = getNumberBound(item.minWidth);
  const max = getNumberBound(item.maxWidth);
  return Math.min(max ?? parsed, Math.max(min ?? parsed, parsed));
};

export function ColumnSettings({
  items,
  visibility,
  reorder,
  resize,
  disabled = false,
  locale,
  renderTrigger,
  onVisibility,
  onVisibilityAll,
  onMove,
  onResize,
  onReset,
}: ColumnSettingsProps) {
  const labels = useMemo(() => ({ ...defaultLocale, ...locale }), [locale]);
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<ButtonHandle>(null);
  useEffect(() => {
    if (!visible) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setVisible(false);
      triggerRef.current?.focus();
    };
    // Own dismissal before a containing Drawer/Modal document listener sees it.
    document.addEventListener("keydown", closeOnEscape, true);
    return () => document.removeEventListener("keydown", closeOnEscape, true);
  }, [visible]);
  const [draftWidths, setDraftWidths] = useState<Record<string, number | undefined>>({});
  const itemWidthsRef = useRef(new Map<string, number>());
  const lastCommittedWidthsRef = useRef(new Map<string, number>());
  const allVisible = items.length > 0 && items.every((item) => item.visible);
  const someVisible = items.some((item) => item.visible);

  useEffect(() => {
    const previousWidths = itemWidthsRef.current;
    const nextWidths = new Map(items.map((item) => [item.key, item.width]));
    let shouldClearDrafts = false;
    const nextDrafts = { ...draftWidths };

    for (const item of items) {
      if (previousWidths.get(item.key) === undefined || previousWidths.get(item.key) === item.width) continue;
      if (hasOwn(nextDrafts, item.key)) {
        delete nextDrafts[item.key];
        shouldClearDrafts = true;
      }
      lastCommittedWidthsRef.current.set(item.key, item.width);
    }

    itemWidthsRef.current = nextWidths;
    if (shouldClearDrafts) setDraftWidths(nextDrafts);
  }, [items]);

  const commitWidth = (item: ColumnSettingsItem, value: string) => {
    const width = clampWidth(value, item);
    if (width === undefined) {
      setDraftWidths((current) => {
        if (!hasOwn(current, item.key)) return current;
        const next = { ...current };
        delete next[item.key];
        return next;
      });
      return;
    }

    setDraftWidths((current) => {
      const next = { ...current };
      delete next[item.key];
      return next;
    });
    if (width === item.width || width === lastCommittedWidthsRef.current.get(item.key)) return;
    lastCommittedWidthsRef.current.set(item.key, width);
    onResize(item.key, width);
  };

  const content = (
    <div className="qizhi-table__column-settings">
      {visibility ? (
        <div className="qizhi-table__column-settings__header">
          <Checkbox
            checked={allVisible}
            indeterminate={someVisible && !allVisible}
            disabled={disabled || items.length === 0}
            onChange={(nextVisible) => onVisibilityAll(nextVisible)}
          >
            {labels.selectAll}
          </Checkbox>
          <Button type="text" size="small" disabled={disabled} onClick={onReset}>{labels.reset}</Button>
        </div>
      ) : (
        <div className="qizhi-table__column-settings__header qizhi-table__column-settings__header--reset">
          <Button type="text" size="small" disabled={disabled} onClick={onReset}>{labels.reset}</Button>
        </div>
      )}
      <div className="qizhi-table__column-settings__list">
        {items.map((item) => {
          const visibilityLocked = !item.hideable || item.visibilityDisabledReason != null;
          const reason = item.visibilityDisabledReason ?? (visibilityLocked ? labels.required : undefined);
          const draftWidth = hasOwn(draftWidths, item.key) ? draftWidths[item.key] : item.width;
          const min = getNumberBound(item.minWidth);
          const max = getNumberBound(item.maxWidth);

          return (
            <div key={item.key} className="qizhi-table__column-settings__row">
              <div className="qizhi-table__column-settings__column">
                {visibility ? (
                  <Checkbox
                    checked={item.visible}
                    disabled={disabled || visibilityLocked}
                    onChange={(nextVisible) => onVisibility(item.key, nextVisible)}
                  >
                    {item.label}
                  </Checkbox>
                ) : (
                  <span className="qizhi-table__column-settings__label">{item.label}</span>
                )}
                {visibility && reason ? <span className="qizhi-table__column-settings__reason">{reason}</span> : null}
              </div>
              {(reorder || resize) ? (
                <div className="qizhi-table__column-settings__actions">
                  {reorder ? (
                    <>
                      <Button
                        type="text"
                        size="small"
                        aria-label={`${labels.moveBefore}${item.label}`}
                        disabled={disabled || !item.canMoveBefore}
                        onClick={() => onMove(item.key, -1)}
                      >
                        {labels.moveBefore}
                      </Button>
                      <Button
                        type="text"
                        size="small"
                        aria-label={`${labels.moveAfter}${item.label}`}
                        disabled={disabled || !item.canMoveAfter}
                        onClick={() => onMove(item.key, 1)}
                      >
                        {labels.moveAfter}
                      </Button>
                    </>
                  ) : null}
                  {resize ? (
                    <label className="qizhi-table__column-settings__width">
                      <span className="qizhi-table__column-settings__width-label">{labels.resize}</span>
                      <InputNumber
                        aria-label={`${labels.resize}${item.label}`}
                        value={draftWidth}
                        min={min}
                        max={max}
                        controls="hidden"
                        disabled={disabled || !item.resizable}
                        onChange={(nextWidth) => {
                          lastCommittedWidthsRef.current.delete(item.key);
                          setDraftWidths((current) => ({ ...current, [item.key]: nextWidth == null ? undefined : Number(nextWidth) }));
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          commitWidth(item, event.currentTarget.value);
                        }}
                        onBlur={(event) => commitWidth(item, event.currentTarget.value)}
                      />
                    </label>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
  const popover = (
    <Popover
      title={labels.settings}
      content={content}
      trigger="click"
      popupVisible={visible}
      onVisibleChange={setVisible}
      position="bottomRight"
      role="dialog"
      classNames={{
        root: "qizhi-table__column-settings-popover",
        content: "qizhi-table__column-settings-content",
      }}
    >
      <Button ref={triggerRef} disabled={disabled}>{labels.settings}</Button>
    </Popover>
  );

  return renderTrigger ? <>{renderTrigger(popover)}</> : popover;
}
