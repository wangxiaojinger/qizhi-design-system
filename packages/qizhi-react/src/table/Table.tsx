import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Checkbox } from "../checkbox/Checkbox";
import { Empty } from "../empty/Empty";
import { AddIcon } from "../icon/AddIcon";
import { ArrowDownFilledIcon } from "../icon/generated/ArrowDownFilledIcon";
import { ArrowUpFilledIcon } from "../icon/generated/ArrowUpFilledIcon";
import { MinusIcon } from "../icon/generated/catalog/MinusIcon";
import { Pagination } from "../pagination/Pagination";
import { Radio } from "../radio/Radio";
import { Tooltip } from "../tooltip/Tooltip";
import type { TableColumn, TableProps, TableRowKey, TableSortOrder } from "./Table.types";
import "./table.css";
import { allocateColumnWidths } from "./tableLayout";
import { TableCellText } from "./TableCellText";
import { useColumnLayout } from "./useColumnLayout";
import { columnResizeBounds } from "./columnLayoutModel";
import { ColumnResizeHandle } from "./ColumnResizeHandle";
import { ColumnSettings } from "./ColumnSettings";
import { DragIcon } from "../icon/generated/catalog/DragIcon";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");
const defaultSortDirections = ["ascend", "descend"] as const;

const nextSortOrder = <RecordType extends object>(
  column: TableColumn<RecordType>,
  current: TableSortOrder,
): TableSortOrder => {
  const directions = column.sortDirections?.length
    ? column.sortDirections
    : defaultSortDirections;
  if (current === null) return directions[0];
  const currentIndex = directions.indexOf(current);
  return directions[currentIndex + 1] ?? null;
};

const sortAction = (order: TableSortOrder) =>
  order === "ascend" ? "升序" : order === "descend" ? "降序" : "取消";

export function Table<RecordType extends object>({ columns: sourceColumns, dataSource, rowKey, size = "default", border = false, borderCell = false, hover = true, stripe = false, showHeader = true, loading = false, scrollX, rowSelection, expandable, childrenColumnName = "children" as keyof RecordType, pagination = false, empty, emptyPadding, emptyCell, fixedBreakpoint, draggable = false, showSorterTooltip = true, tableLayout, layoutMode = "fill", columnCustomization, columnLayout, defaultColumnLayout, onColumnLayoutChange, treeColumnKey, onSortChange, onRowOrderChange, className, style, "aria-label": ariaLabel = "表格", ...rest }: TableProps<RecordType>) {
  const defaultSort = sourceColumns.find((column) => column.defaultSortOrder);
  const [sort, setSort] = useState<{ key: string; order: TableSortOrder }>({ key: defaultSort?.key ?? "", order: defaultSort?.defaultSortOrder ?? null });
  const sorted = useMemo(() => {
    const column = sourceColumns.find((item) => item.key === sort.key);
    if (!column?.sorter || !sort.order) return [...dataSource];
    return [...dataSource].sort((a, b) => column.sorter!(a, b) * (sort.order === "ascend" ? 1 : -1));
  }, [sourceColumns, dataSource, sort]);
  const pageSize = pagination ? (pagination.pageSize ?? pagination.defaultPageSize ?? 10) : 10;
  const [page, setPage] = useState(pagination ? (pagination.current ?? pagination.defaultCurrent ?? 1) : 1);
  const visible = pagination ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;
  const customizationRequested = columnCustomization !== undefined || columnLayout !== undefined || defaultColumnLayout !== undefined;
  const treeKey = treeColumnKey ?? sourceColumns[0]?.key;
  const hasTree = !expandable && dataSource.some((record) => Array.isArray(record[childrenColumnName]) && (record[childrenColumnName] as unknown[]).length > 0);
  const protectedKeys = treeKey && (hasTree || treeColumnKey !== undefined) ? [treeKey] : [];
  const scanSpans = (records: RecordType[]): boolean => records.some((record, index) =>
    sourceColumns.some((column) => { const span = column.onCell?.(record, index)?.colSpan; return span != null && span !== 1; })
    || (Array.isArray(record[childrenColumnName]) && scanSpans(record[childrenColumnName] as RecordType[])));
  const merged = customizationRequested && scanSpans(visible);
  const custom = useColumnLayout({ columns: sourceColumns, layout: columnLayout,
    defaultLayout: defaultColumnLayout, onChange: onColumnLayoutChange,
    enabled: customizationRequested, protectedKeys, merged });
  const columns = custom.columns;
  const spinning = typeof loading === "boolean" ? loading : loading.spinning;
  const bodyLoading = typeof loading === "object" && loading.scope === "body";
  const loadingTip = typeof loading === "object" ? loading.tip ?? "加载中..." : "加载中...";
  const [loadingBox, setLoadingBox] = useState({ top: 0, height: 0 });
  const effectiveLayout = tableLayout ?? (layoutMode === "compact" ? "auto" : "fixed");
  const extraColumns = (rowSelection ? 1 : 0) + (expandable ? 1 : 0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [renderedWidths, setRenderedWidths] = useState<number[]>([]);
  const previewing = useRef(false);
  const previewWidths = useRef<number[] | null>(null);
  const restoreWidths = useRef<() => void>(() => {});
  const [cancelGeneration, setCancelGeneration] = useState(0);
  const [naturalWidths, setNaturalWidths] = useState<number[]>([]);
  const naturalSignature = useRef("");
  const manualWidths = custom.active ? custom.state.columnWidths : {};
  const hasManual = columns.some((column) => Object.hasOwn(manualWidths, column.key));
  const fixedEnabled = !(fixedBreakpoint != null && Number.isFinite(fixedBreakpoint)
    && fixedBreakpoint >= 0 && containerWidth <= fixedBreakpoint);
  const fixedClass = (column: TableColumn<RecordType>) => fixedEnabled && column.fixed && `is-fixed-${column.fixed}`;
  const constrained = effectiveLayout === "fixed" && columns.every((column) => typeof column.width !== "string") && columns.some((column) => column.minWidth != null || column.maxWidth != null || column.grow != null || column.shrink != null);
  const allocatedWidths = constrained ? allocateColumnWidths(columns, Math.max(containerWidth, typeof scrollX === "number" ? scrollX : 0) - extraColumns * 48, layoutMode === "compact") : undefined;
  const columnWidth = (index: number) => Object.hasOwn(manualWidths, columns[index].key)
    ? manualWidths[columns[index].key]
    : hasManual ? allocatedWidths?.[index] ?? naturalWidths[index + extraColumns]
      ?? (typeof columns[index].width === "number" ? columns[index].width : 120)
      : allocatedWidths?.[index] ?? columns[index].width;
  const widthDefinition = JSON.stringify({ columns: columns.map((column) => [column.key,
    column.width, column.minWidth, column.maxWidth, column.grow, column.shrink,
    column.growPriority, column.shrinkPriority, column.settingsLabel,
    typeof column.title === "string" || typeof column.title === "number" ? column.title : null]),
    tableLayout, layoutMode, scrollX, style });
  const fixedOffsets: number[] = columns.map(() => 0);
  const renderedColumnWidth = (index: number) => renderedWidths[index + extraColumns] ?? (typeof columnWidth(index) === "number" ? columnWidth(index) as number : 0);
  let leftOffset = 0;
  let rightOffset = 0;
  columns.forEach((column, index) => {
    if (column.fixed === "left") { fixedOffsets[index] = leftOffset; leftOffset += renderedColumnWidth(index); }
  });
  for (let index = columns.length - 1; index >= 0; index -= 1) {
    if (columns[index].fixed === "right") { fixedOffsets[index] = rightOffset; rightOffset += renderedColumnWidth(index); }
  }
  const columnStyle = (index: number): CSSProperties => {
    const column = columns[index];
    return { textAlign: column.align, ...(fixedEnabled && column.fixed ? { [column.fixed]: fixedOffsets[index] } : {}) };
  };
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    const table = tableRef.current;
    const hasFixed = columns.some((column) => column.fixed);
    if (!scroller || !table || (!constrained && !hasFixed && !bodyLoading && !custom.active)) return;
    const measure = () => {
      const available = scroller.clientWidth;
      if (previewing.current) {
        if (available !== containerWidth) setCancelGeneration((value) => value + 1);
        return;
      }
      setContainerWidth((previous) => previous === available ? previous : available);
      // Reset ends the manual sizing session. A later first resize must read
      // the current native layout, including content changes since that reset.
      if (!hasManual) naturalSignature.current = "";
      const signature = `${widthDefinition}@${available}`;
      if (hasManual && !constrained && available > 0 && naturalSignature.current !== signature) {
        const cols = Array.from(table.querySelectorAll<HTMLTableColElement>(":scope > colgroup > col"));
        const savedTable = table.style.cssText;
        const savedColumns = cols.map((col) => col.style.cssText);
        table.style.tableLayout = effectiveLayout;
        table.style.width = style?.width != null ? String(style.width) + (typeof style.width === "number" ? "px" : "") : layoutMode === "compact" ? "max-content" : "100%";
        const declared = columns.reduce((sum, column) => sum + (typeof column.width === "number" ? column.width : 0), extraColumns * 48);
        const minimum = style?.minWidth ?? scrollX ?? (declared || "");
        table.style.minWidth = typeof minimum === "number" ? `${minimum}px` : minimum;
        columns.forEach((column, index) => {
          const col = cols[index + extraColumns];
          col.style.width = typeof column.width === "number" ? `${column.width}px` : column.width ?? "";
          col.style.minWidth = effectiveLayout === "auto" && column.minWidth != null ? `${column.minWidth}px` : "";
        });
        const measured = cols.map((col) => col.getBoundingClientRect().width);
        table.style.cssText = savedTable;
        cols.forEach((col, index) => { col.style.cssText = savedColumns[index]; });
        naturalSignature.current = signature;
        setNaturalWidths(measured);
      }
      if (bodyLoading) {
        const headerHeight = table.tHead?.getBoundingClientRect().height ?? 0;
        const top = scroller.offsetTop + headerHeight;
        const height = Math.max(0, scroller.clientHeight - headerHeight);
        setLoadingBox((previous) => previous.top === top && previous.height === height
          ? previous : { top, height });
      }
      if (hasFixed || custom.active) {
        const widths = Array.from(table.querySelectorAll(":scope > colgroup > col"), (col) => col.getBoundingClientRect().width);
        setRenderedWidths((previous) => previous.length === widths.length && widths.every((width, index) => Math.abs(width - previous[index]) < 0.1) ? previous : widths);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    if (typeof ResizeObserver === "undefined") return () => window.removeEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(table);
    if (hasFixed) table.querySelectorAll(":scope > colgroup > col").forEach((col) => observer.observe(col));
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [columns, extraColumns, effectiveLayout, layoutMode, scrollX, containerWidth, constrained, showHeader, dataSource, bodyLoading, spinning, fixedBreakpoint, custom.active, hasManual, widthDefinition]);
  const keyOf = (record: RecordType): TableRowKey => typeof rowKey === "function" ? rowKey(record) : record[rowKey] as TableRowKey;
  const controlledSelection = rowSelection?.selectedRowKeys !== undefined;
  const [innerSelected, setInnerSelected] = useState<TableRowKey[]>(rowSelection?.defaultSelectedRowKeys ?? []);
  const selected = controlledSelection ? rowSelection!.selectedRowKeys! : innerSelected;
  const controlledExpanded = expandable?.expandedRowKeys !== undefined;
  const [innerExpanded, setInnerExpanded] = useState<TableRowKey[]>(expandable?.defaultExpandedRowKeys ?? []);
  const expanded = controlledExpanded ? expandable!.expandedRowKeys! : innerExpanded;
  const dragKey = useRef<TableRowKey | null>(null);
  const [fixedShadows, setFixedShadows] = useState({ left: false, right: false });
  const allRecords = useMemo(() => {
    const result: RecordType[] = [];
    const visit = (records: RecordType[]) => records.forEach((record) => { result.push(record); const children = record[childrenColumnName] as RecordType[] | undefined; if (Array.isArray(children)) visit(children); });
    visit(dataSource); return result;
  }, [dataSource, childrenColumnName]);
  const updateSelection = (next: TableRowKey[]) => {
    if (!controlledSelection) setInnerSelected(next);
    rowSelection?.onChange?.(next, allRecords.filter((record) => next.includes(keyOf(record))));
  };
  const toggleSelected = (record: RecordType) => {
    const key = keyOf(record);
    if (rowSelection?.type === "radio") return updateSelection([key]);
    const add = !selected.includes(key);
    const descendants: TableRowKey[] = [];
    const collect = (item: RecordType) => { descendants.push(keyOf(item)); const children = item[childrenColumnName] as RecordType[] | undefined; children?.forEach(collect); };
    if (rowSelection?.checkStrictly === false) collect(record); else descendants.push(key);
    updateSelection(add ? Array.from(new Set([...selected, ...descendants])) : selected.filter((item) => !descendants.includes(item)));
  };
  const toggleExpanded = (record: RecordType) => {
    const key = keyOf(record); const open = !expanded.includes(key);
    const next = open ? [...expanded, key] : expanded.filter((item) => item !== key);
    if (!controlledExpanded) setInnerExpanded(next);
    expandable?.onExpandedChange?.(open, record, next);
  };
  const changeSort = (column: TableColumn<RecordType>) => {
    const current = sort.key === column.key ? sort.order : null;
    const next = nextSortOrder(column, current);
    setSort({ key: column.key, order: next }); onSortChange?.(next, column);
  };
  const rowLabel = (record: RecordType) => String(sourceColumns[0]?.dataIndex == null ? keyOf(record) : record[sourceColumns[0].dataIndex]);
  const labelOf = (column: TableColumn<RecordType>) => column.settingsLabel
    ?? (typeof column.title === "string" || typeof column.title === "number" ? String(column.title) : column.key);
  const canReorder = custom.active && columnCustomization?.reorder === true && !merged;
  const canResize = custom.active && columnCustomization?.resize === true;
  const canHide = custom.active && columnCustomization?.visibility === true && !merged;
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const dragColumnRef = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ key: string; placement: "before" | "after" } | null>(null);
  const gestureKey = JSON.stringify([custom.state, columns.map((column) => [column.key,
    column.fixed, column.movable, column.resizable, column.hideable, column.minWidth, column.maxWidth]),
    merged, containerWidth, extraColumns, cancelGeneration]);
  useLayoutEffect(() => {
    dragColumnRef.current = null;
    setDraggedColumn(null);
    setDropTarget(null);
  }, [gestureKey]);
  const previewWidth = (key: string, width: number | null) => {
    const table = tableRef.current;
    if (width === null) {
      previewing.current = false;
      previewWidths.current = null;
      restoreWidths.current();
      return;
    }
    if (!table) return;
    const cols = Array.from(table.querySelectorAll<HTMLTableColElement>(":scope > colgroup > col"));
    if (!previewWidths.current) previewWidths.current = cols.map((col) => col.getBoundingClientRect().width);
    const index = columns.findIndex((column) => column.key === key);
    if (index < 0) return;
    previewing.current = true;
    previewWidths.current[index + extraColumns] = width;
    cols.forEach((col, colIndex) => { col.style.width = `${previewWidths.current![colIndex]}px`; });
    const total = previewWidths.current.reduce((sum, value) => sum + value, 0);
    table.style.tableLayout = "fixed";
    table.style.width = `${total}px`;
    table.style.minWidth = `${total}px`;
    const offsets = new Map<string, number>();
    let left = 0; let right = 0;
    columns.forEach((column, columnIndex) => {
      if (column.fixed === "left") { offsets.set(column.key, left); left += previewWidths.current![columnIndex + extraColumns]; }
    });
    [...columns].reverse().forEach((column) => {
      if (column.fixed === "right") {
        offsets.set(column.key, right);
        right += previewWidths.current![columns.findIndex((item) => item.key === column.key) + extraColumns];
      }
    });
    if (fixedEnabled) table.querySelectorAll<HTMLElement>("[data-column-key]").forEach((cell) => {
      const column = columns.find((item) => item.key === cell.dataset.columnKey);
      if (column?.fixed) cell.style[column.fixed] = `${offsets.get(column.key) ?? 0}px`;
    });
  };
  const headerEvents = (column: TableColumn<RecordType>) => ({
    "data-column-key": custom.active ? column.key : undefined,
    "data-column-drop": dropTarget?.key === column.key ? dropTarget.placement : undefined,
    onDragOver: (event: React.DragEvent<HTMLTableCellElement>) => {
      const key = dragColumnRef.current;
      if (!canReorder || !key) return;
      event.stopPropagation();
      const box = event.currentTarget.getBoundingClientRect();
      const placement = event.clientX < box.left + box.width / 2 ? "before" : "after";
      if (!custom.canMove(key, column.key, placement)) { setDropTarget(null); return; }
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setDropTarget((previous) => previous?.key === column.key && previous.placement === placement
        ? previous : { key: column.key, placement });
    },
    onDragLeave: (event: React.DragEvent<HTMLTableCellElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(null);
    },
    onDrop: (event: React.DragEvent<HTMLTableCellElement>) => {
      if (!canReorder || !dragColumnRef.current) return;
      event.preventDefault(); event.stopPropagation();
      if (dropTarget?.key === column.key) custom.move(dragColumnRef.current, column.key, dropTarget.placement);
      dragColumnRef.current = null; setDraggedColumn(null); setDropTarget(null);
    },
  });
  const moveOne = (key: string, direction: -1 | 1) => {
    const index = custom.state.columnOrder.indexOf(key);
    const target = custom.state.columnOrder[index + direction];
    if (target) custom.move(key, target, direction < 0 ? "before" : "after");
  };
  const headerTools = (column: TableColumn<RecordType>, index: number, content: ReactNode) => {
    const move = canReorder && column.movable !== false;
    const resize = canResize && column.resizable !== false;
    if (!move && !resize) return content;
    return <>
      <div className="qizhi-table__header-layout">
        {move ? <button type="button" draggable className="qizhi-table__column-move"
          aria-label={`移动列 ${labelOf(column)}`} aria-pressed={draggedColumn === column.key}
          onClick={(event) => event.stopPropagation()}
          onDragStart={(event) => {
            event.stopPropagation();
            dragColumnRef.current = column.key; setDraggedColumn(column.key);
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("application/x-qizhi-table-column", column.key);
          }}
          onDragEnd={() => { dragColumnRef.current = null; setDraggedColumn(null); setDropTarget(null); }}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault(); event.stopPropagation();
            moveOne(column.key, event.key === "ArrowLeft" ? -1 : 1);
          }}><DragIcon size={14} /></button> : null}
        {content}
      </div>
      {resize ? <ColumnResizeHandle label={`${columnCustomization?.locale?.resize ?? "调整列宽"} ${labelOf(column)}`}
        width={renderedColumnWidth(index) || (typeof columnWidth(index) === "number" ? columnWidth(index) as number : 120)}
        minWidth={columnResizeBounds(column).min} maxWidth={columnResizeBounds(column).max}
        gestureKey={gestureKey} onPreview={(width) => previewWidth(column.key, width)}
        onCommit={(width) => custom.setWidth(column.key, width)} /> : null}
    </>;
  };
  const headerCells = columns.map((column, columnIndex) => {
    if (!column.sorter) {
      return (
        <th
          key={column.key}
          {...headerEvents(column)}
          className={cx("qizhi-table__th", fixedClass(column))}
          data-align={column.align}
          style={columnStyle(columnIndex)}
        >
          {headerTools(column, columnIndex, column.title)}
        </th>
      );
    }
    const current = sort.key === column.key ? sort.order : null;
    const next = nextSortOrder(column, current);
    const action = sortAction(next);
    const sorter = (
      <span
        className={cx(
          "qizhi-table__sorter",
          current === "ascend" && "is-ascend",
          current === "descend" && "is-descend",
        )}
        aria-hidden="true"
      >
        <ArrowUpFilledIcon className="qizhi-table__sorter-icon is-ascend" viewBox="4 5.33334 8 4" width={8} height={4} />
        <ArrowDownFilledIcon className="qizhi-table__sorter-icon is-descend" viewBox="4 6.66666 8 4" width={8} height={4} />
      </span>
    );
    const tooltip = column.showSorterTooltip ?? showSorterTooltip;
    const tooltipTarget = typeof tooltip === "object"
      ? tooltip.target ?? "full-header"
      : "full-header";
    const sorterContent = tooltip && tooltipTarget === "sorter-icon" ? (
      <Tooltip content={`点击${action}排序`} trigger="hover">
        <span className="qizhi-table__sorter-target">{sorter}</span>
      </Tooltip>
    ) : sorter;
    const button = (
      <button
        type="button"
        className="qizhi-table__sort"
        aria-label={`按${String(column.title)}${action}排序`}
        onClick={() => changeSort(column)}
      >
        {column.title}
        {sorterContent}
      </button>
    );
    const headerContent = tooltip && tooltipTarget === "full-header" ? (
      <Tooltip content={`点击${action}排序`} trigger={["hover", "focus"]}>
        {button}
      </Tooltip>
    ) : button;
    return (
      <th
        key={column.key}
        {...headerEvents(column)}
        aria-sort={current === "ascend"
          ? "ascending"
          : current === "descend"
            ? "descending"
            : "none"}
        className={cx("qizhi-table__th", "is-sortable", fixedClass(column))}
        data-align={column.align}
        style={columnStyle(columnIndex)}
      >
        {headerTools(column, columnIndex, headerContent)}
      </th>
    );
  });
  const selectable = allRecords.filter((record) => !rowSelection?.getCheckboxProps?.(record).disabled);
  const allChecked = selectable.length > 0 && selectable.every((record) => selected.includes(keyOf(record)));
  const someChecked = selectable.some((record) => selected.includes(keyOf(record))) && !allChecked;
  const renderRows = (records: RecordType[], level = 0): ReactNode[] => records.flatMap((record, index) => {
    const key = keyOf(record); const children = record[childrenColumnName] as RecordType[] | undefined;
    const selectionProps = rowSelection?.getCheckboxProps?.(record);
    const selectionDisabled = selectionProps?.disabled === true;
    const expandedContent = expandable?.expandedRowRender?.(record, index);
    const canExpand = Boolean(children?.length || (expandedContent != null && (expandable?.rowExpandable?.(record) ?? true)));
    const isOpen = expanded.includes(key);
    const row = <tr key={key} data-row-key={key} draggable={draggable || undefined} className={cx("qizhi-table__tr", selected.includes(key) && !selectionDisabled && "is-selected")} onDragStart={() => { dragKey.current = key; }} onDragOver={(event) => { if (draggable) event.preventDefault(); }} onDrop={() => { if (!draggable || dragKey.current == null || dragKey.current === key) return; const fromIndex = dataSource.findIndex((item) => keyOf(item) === dragKey.current); const toIndex = dataSource.findIndex((item) => keyOf(item) === key); if (fromIndex < 0 || toIndex < 0) return; const next = [...dataSource]; const [active] = next.splice(fromIndex, 1); next.splice(toIndex, 0, active); onRowOrderChange?.(next, { active: dragKey.current, target: key, fromIndex, toIndex }); dragKey.current = null; }}>
      {rowSelection ? <td className="qizhi-table__selection">{rowSelection.type === "radio" ? <Radio name="qizhi-table-selection" aria-label={`选择${rowLabel(record)}`} checked={selected.includes(key)} disabled={selectionDisabled} onChange={() => toggleSelected(record)} /> : <Checkbox aria-label={`选择${rowLabel(record)}`} checked={selected.includes(key)} disabled={selectionDisabled} onChange={() => toggleSelected(record)} />}</td> : null}
      {expandable ? <td className="qizhi-table__expand">{canExpand ? <button type="button" aria-label={`${isOpen ? "收起" : "展开"}${rowLabel(record)}`} aria-expanded={isOpen} onClick={() => toggleExpanded(record)}>{isOpen ? <MinusIcon size={14} /> : <AddIcon size={14} />}</button> : null}</td> : null}
      {columns.map((column, columnIndex) => {
        const cell = column.onCell?.(record, index) ?? {};
        if (cell.rowSpan === 0 || cell.colSpan === 0) return null;
        const value = column.dataIndex == null ? undefined : record[column.dataIndex];
        const missing = !column.render && (value == null || value === "");
        const content = column.render ? column.render(value, record, index)
          : missing && emptyCell !== undefined ? emptyCell : value as ReactNode;
        const textEllipsis = typeof column.ellipsis === "object"
          && (column.ellipsis.rows !== undefined || column.ellipsis.tooltip !== undefined);
        const enhancedText = textEllipsis && !missing
          && (typeof content === "string" || typeof content === "number");
        const showEllipsisTitle = !textEllipsis && (column.ellipsis === true || (typeof column.ellipsis === "object" && column.ellipsis.showTitle !== false));
        const title = showEllipsisTitle && (typeof content === "string" || typeof content === "number") ? String(content) : undefined;
        return <td key={column.key} data-column-key={custom.active ? column.key : undefined} rowSpan={cell.rowSpan} colSpan={cell.colSpan} data-align={cell.style?.textAlign ?? column.align} className={cx("qizhi-table__td", fixedClass(column), cell.className)} style={{ ...columnStyle(columnIndex), ...cell.style }}><div className={cx("qizhi-table__cell", column.ellipsis && !textEllipsis && "is-ellipsis")} title={title} style={column.key === treeKey && level ? { paddingInlineStart: level * 24 } : undefined}>{column.key === treeKey && children?.length && !expandable ? <button type="button" className="qizhi-table__tree-toggle" aria-label={`${isOpen ? "收起" : "展开"}${String(value)}`} aria-expanded={isOpen} onClick={() => toggleExpanded(record)}>{isOpen ? <MinusIcon size={14} /> : <AddIcon size={14} />}</button> : null}{enhancedText ? <TableCellText rows={typeof column.ellipsis === "object" ? column.ellipsis.rows ?? 1 : 1} tooltip={typeof column.ellipsis === "object" && column.ellipsis.tooltip === true}>{content}</TableCellText> : content}</div></td>;
      })}
    </tr>;
    const details = isOpen && expandedContent != null ? <tr key={`${key}-expanded`} className="qizhi-table__expanded"><td colSpan={columns.length + extraColumns}>{expandedContent}</td></tr> : null;
    const childRows = isOpen && children?.length ? renderRows(children, level + 1) : [];
    return [row, details, ...childRows].filter(Boolean);
  });
  const declaredWidth = columns.reduce((sum, column) => sum + (typeof column.width === "number" ? column.width : 0), 0) + extraColumns * 48;
  const allocatedTotal = allocatedWidths ? allocatedWidths.reduce((sum, width) => sum + width, extraColumns * 48) : undefined;
  const manualTotal = hasManual ? columns.reduce((sum, _, index) => sum + (columnWidth(index) as number), extraColumns * 48) : undefined;
  const tableStyle: CSSProperties = hasManual
    ? { ...style, tableLayout: "fixed", width: manualTotal, minWidth: manualTotal }
    : { tableLayout: effectiveLayout, width: allocatedTotal ?? (layoutMode === "compact" ? "max-content" : "100%"), minWidth: allocatedTotal ?? scrollX ?? (declaredWidth > 0 ? declaredWidth : undefined), ...style };
  restoreWidths.current = () => {
    const table = tableRef.current;
    if (!table) return;
    const cssSize = (value: string | number | undefined) => typeof value === "number" ? `${value}px` : value ?? "";
    table.style.tableLayout = String(tableStyle.tableLayout ?? "fixed");
    table.style.width = cssSize(tableStyle.width);
    table.style.minWidth = cssSize(tableStyle.minWidth);
    const cols = table.querySelectorAll<HTMLTableColElement>(":scope > colgroup > col");
    columns.forEach((column, index) => {
      const col = cols[index + extraColumns];
      if (col) col.style.width = cssSize(columnWidth(index));
    });
    table.querySelectorAll<HTMLElement>("[data-column-key]").forEach((cell) => {
      const index = columns.findIndex((column) => column.key === cell.dataset.columnKey);
      if (index < 0) return;
      const column = columns[index];
      if (column.fixed) cell.style[column.fixed] = fixedEnabled ? `${fixedOffsets[index]}px` : "";
    });
  };
  const settingsControl = custom.active && columnCustomization?.settings ? <ColumnSettings
    items={custom.state.columnOrder.map((key) => {
      const column = sourceColumns.find((item) => item.key === key)!;
      const cannotHide = column.hideable === false || protectedKeys.includes(key);
      const onlyData = column.layoutRole !== "action" && custom.state.columnVisibility[key] !== false
        && sourceColumns.filter((item) => item.layoutRole !== "action" && custom.state.columnVisibility[item.key] !== false).length <= 1;
      return { key, label: labelOf(column), visible: custom.state.columnVisibility[key] !== false,
        hideable: !cannotHide && !onlyData,
        visibilityDisabledReason: cannotHide ? columnCustomization.locale?.required ?? "必需列"
          : onlyData ? columnCustomization.locale?.minimumVisible ?? "至少保留一列数据" : undefined };
    })}
    visibility={canHide}
    locale={{ reset: "恢复默认布局", ...columnCustomization.locale }} renderTrigger={columnCustomization.renderSettings}
    onVisibility={custom.setVisibility} onVisibilityAll={custom.setAllVisibility} /> : null;
  const emptyContent = bodyLoading && spinning ? <div className="qizhi-table__loading-placeholder" />
    : emptyPadding != null && Number.isFinite(emptyPadding) && emptyPadding >= 0
      ? <div className="qizhi-table__empty-content" style={{ paddingBlock: emptyPadding }}>{empty ?? <Empty />}</div>
      : empty ?? <Empty />;
  return <div {...rest} className={cx("qizhi-table", `qizhi-table--${size}`, border && "is-bordered", borderCell && "has-cell-border", hover && "is-hoverable", stripe && "is-striped", fixedEnabled && fixedShadows.left && "has-left-fixed-shadow", fixedEnabled && fixedShadows.right && "has-right-fixed-shadow", spinning && "is-loading", className)} aria-busy={spinning || undefined}>
    {settingsControl ? columnCustomization?.renderSettings ? settingsControl
      : <div className="qizhi-table__column-settings-bar">{settingsControl}</div> : null}
    <div ref={scrollRef} className="qizhi-table__scroll" onScroll={(event) => { const node = event.currentTarget; const left = node.scrollLeft > 1; const right = left && node.scrollLeft + node.clientWidth < node.scrollWidth - 1; setFixedShadows({ left, right }); }}><table ref={tableRef} aria-label={ariaLabel} style={tableStyle}>
      <colgroup>{rowSelection ? <col style={{ width: 48 }} /> : null}{expandable ? <col style={{ width: 48 }} /> : null}{columns.map((column, index) => <col key={column.key} style={{ width: columnWidth(index), minWidth: effectiveLayout === "auto" ? column.minWidth : undefined }} />)}</colgroup>
      {showHeader ? <thead><tr>{rowSelection ? <th className="qizhi-table__th qizhi-table__selection">{rowSelection.type !== "radio" ? <Checkbox aria-label="全选当前数据" checked={allChecked} indeterminate={someChecked} onChange={() => updateSelection(allChecked ? selected.filter((key) => !selectable.some((record) => keyOf(record) === key)) : Array.from(new Set([...selected, ...selectable.map(keyOf)])))} /> : null}</th> : null}{expandable ? <th className="qizhi-table__th qizhi-table__expand" aria-label="展开操作" /> : null}{headerCells}</tr></thead> : null}
      <tbody>{visible.length ? renderRows(visible) : <tr><td className={emptyPadding != null || bodyLoading ? "qizhi-table__empty-cell" : undefined} colSpan={columns.length + extraColumns}>{emptyContent}</td></tr>}</tbody>
    </table>{spinning && !bodyLoading ? <div className="qizhi-table__loading" role="status">{loadingTip}</div> : null}</div>
    {spinning && bodyLoading ? <div className="qizhi-table__loading" data-scope="body" role="status" style={{ top: loadingBox.top, height: loadingBox.height, bottom: "auto" }}>{loadingTip}</div> : null}
    {pagination ? <div className={cx("qizhi-table__pagination", `is-${pagination.position ?? "bottomRight"}`)}><Pagination {...pagination} className={cx(pagination.className, `is-${pagination.position ?? "bottomRight"}`)} total={pagination.total ?? dataSource.length} current={pagination.current ?? page} aria-label="表格分页" onChange={(next, nextSize) => { if (pagination.current === undefined) setPage(next); pagination.onChange?.(next, nextSize); }} /></div> : null}
  </div>;
}
