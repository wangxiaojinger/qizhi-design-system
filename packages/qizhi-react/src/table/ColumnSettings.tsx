import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import type { ButtonHandle } from "../button/Button.types";
import { Button } from "../button/Button";
import { Checkbox } from "../checkbox/Checkbox";
import { Popover } from "../popover/Popover";
import type { TableColumnCustomizationLocale } from "./TableColumnLayout.types";
import "./columnSettings.css";

export interface ColumnSettingsItem {
  key: string;
  label: string;
  visible: boolean;
  hideable: boolean;
  visibilityDisabledReason?: string;
}

export interface ColumnSettingsProps {
  items: readonly ColumnSettingsItem[];
  visibility: boolean;
  disabled?: boolean;
  locale?: Partial<TableColumnCustomizationLocale>;
  renderTrigger?: (trigger: ReactElement) => ReactNode;
  onVisibility: (key: string, visible: boolean) => void;
  onVisibilityAll: (visible: boolean) => void;
}

export function ColumnSettings({ items, visibility, disabled = false, locale, renderTrigger,
  onVisibility, onVisibilityAll }: ColumnSettingsProps) {
  const labels = useMemo(() => ({ settings: "列设置", selectAll: "全选", required: "必选",
    ...locale }), [locale]);
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
    document.addEventListener("keydown", closeOnEscape, true);
    return () => document.removeEventListener("keydown", closeOnEscape, true);
  }, [visible]);
  const content = (
    <div className="qizhi-table__column-settings">
      <div className="qizhi-table__column-settings__header">
        <Checkbox checked={items.length > 0 && items.every((item) => item.visible)}
          indeterminate={items.some((item) => item.visible) && !items.every((item) => item.visible)}
          disabled={disabled || !visibility || items.length === 0}
          onChange={(next) => onVisibilityAll(next)}>
          {labels.selectAll}
        </Checkbox>
      </div>
      <div className="qizhi-table__column-settings__list">
        {items.map((item) => {
          const locked = !item.hideable || item.visibilityDisabledReason != null;
          const reason = item.visibilityDisabledReason ?? (locked ? labels.required : undefined);
          return (
            <div key={item.key} className="qizhi-table__column-settings__row">
              <div className="qizhi-table__column-settings__column">
                <Checkbox checked={item.visible} disabled={disabled || !visibility || locked}
                  onChange={(next) => onVisibility(item.key, next)}>
                  {item.label}
                </Checkbox>
                {reason ? <span className="qizhi-table__column-settings__reason">{reason}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  const popover = (
    <Popover title={labels.settings} content={content} trigger="click" position="bottomRight"
      popupVisible={visible} onVisibleChange={setVisible} role="dialog"
      classNames={{ root: "qizhi-table__column-settings-popover",
        content: "qizhi-table__column-settings-content" }}>
      <Button ref={triggerRef} disabled={disabled}>{labels.settings}</Button>
    </Popover>
  );
  return renderTrigger ? <>{renderTrigger(popover)}</> : popover;
}
