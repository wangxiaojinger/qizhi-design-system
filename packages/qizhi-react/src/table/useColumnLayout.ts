import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { TableColumn } from "./Table.types";
import type { TableColumnLayoutMeta, TableColumnLayoutState } from "./TableColumnLayout.types";
import {
  columnLayoutEqual, defaultColumnLayout, moveColumnLayout, normalizeColumnLayout,
  setColumnLayoutVisibility, setColumnLayoutWidth,
} from "./columnLayoutModel";

const clone = (layout: TableColumnLayoutState): TableColumnLayoutState => ({
  schemaVersion: 1, columnOrder: [...layout.columnOrder],
  columnWidths: { ...layout.columnWidths }, columnVisibility: { ...layout.columnVisibility },
});

export function useColumnLayout<R>({ columns, layout, defaultLayout, onChange,
  enabled, protectedKeys, merged }: {
  columns: readonly TableColumn<R>[];
  layout?: TableColumnLayoutState;
  defaultLayout?: TableColumnLayoutState;
  onChange?: (next: TableColumnLayoutState, meta: TableColumnLayoutMeta) => void;
  enabled: boolean;
  protectedKeys: readonly string[];
  merged: boolean;
}) {
  const controlled = layout !== undefined;
  const [inner, setInner] = useState(() => normalizeColumnLayout(columns, defaultLayout, protectedKeys));
  const validKeys = columns.every((column) => typeof column.key === "string" && column.key.trim().length > 0)
    && new Set(columns.map((column) => column.key)).size === columns.length;
  const active = enabled && validKeys;
  const normalized = normalizeColumnLayout(columns, controlled ? layout : inner, protectedKeys);
  const state = merged ? { ...normalized, columnOrder: columns.map((column) => column.key),
    columnVisibility: Object.fromEntries(columns.map((column) => [column.key, true])) } : normalized;
  const current = useRef(state);
  current.current = state;
  // Retire deleted/unauthorized keys without reporting a user edit. In particular,
  // an uncontrolled removed column cannot resurrect its old preference later.
  const definitionKey = JSON.stringify({ columns: columns.map((column) => [column.key, column.fixed,
    column.movable, column.resizable, column.hideable, column.defaultVisible,
    column.layoutRole, column.minWidth, column.maxWidth]), protectedKeys });
  useLayoutEffect(() => {
    if (!controlled && active) setInner((previous) => {
      const clean = normalizeColumnLayout(columns, previous, protectedKeys);
      return columnLayoutEqual(clean, previous) ? previous : clean;
    });
  }, [definitionKey, controlled, active]);

  const commit = useCallback((next: TableColumnLayoutState, meta: TableColumnLayoutMeta) => {
    if (!active) return;
    const clean = normalizeColumnLayout(columns, next, protectedKeys);
    if (columnLayoutEqual(clean, current.current)) return;
    if (!controlled) {
      current.current = clean;
      setInner(clone(clean));
    }
    onChange?.(clone(clean), { ...meta });
  }, [columns, controlled, active, onChange, protectedKeys]);
  const move = (key: string, target: string, placement: "before" | "after") => {
    if (merged) return;
    commit(moveColumnLayout(columns, state, key, target, placement, protectedKeys),
      { reason: "order", columnKey: key });
  };
  const canMove = (key: string, target: string, placement: "before" | "after") => active && !merged
    && !columnLayoutEqual(state, moveColumnLayout(columns, state, key, target, placement, protectedKeys));
  const setVisibility = (key: string, visible: boolean) => {
    if (!merged) commit(setColumnLayoutVisibility(columns, state, key, visible, protectedKeys),
      { reason: "visibility", columnKey: key });
  };
  const setAllVisibility = (visible: boolean) => {
    if (!merged) commit(normalizeColumnLayout(columns, { ...state,
      columnVisibility: Object.fromEntries(columns.map((column) => [column.key, visible])) }, protectedKeys),
    { reason: "visibility" });
  };
  const setWidth = (key: string, width: number) => commit(
    setColumnLayoutWidth(columns, state, key, width, protectedKeys),
    { reason: "width", columnKey: key });
  const reset = () => commit(defaultColumnLayout(columns, protectedKeys), { reason: "reset" });
  const byKey = new Map(columns.map((column) => [column.key, column]));
  const displayed = state.columnOrder.filter((key) => state.columnVisibility[key] !== false)
    .map((key) => byKey.get(key)).filter((column): column is TableColumn<R> => Boolean(column));
  return { active, state, columns: active ? displayed : columns,
    commit, move, canMove, setVisibility, setAllVisibility, setWidth, reset };
}
