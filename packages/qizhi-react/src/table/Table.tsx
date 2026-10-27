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

export function Table<RecordType extends object>({ columns, dataSource, rowKey, size = "default", border = false, borderCell = false, hover = true, stripe = false, showHeader = true, loading = false, scrollX, rowSelection, expandable, childrenColumnName = "children" as keyof RecordType, pagination = false, empty, emptyPadding, emptyCell, fixedBreakpoint, draggable = false, showSorterTooltip = true, tableLayout, layoutMode = "fill", onSortChange, onRowOrderChange, className, style, "aria-label": ariaLabel = "表格", ...rest }: TableProps<RecordType>) {
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
  const fixedEnabled = !(fixedBreakpoint != null && Number.isFinite(fixedBreakpoint)
    && fixedBreakpoint >= 0 && containerWidth <= fixedBreakpoint);
  const fixedClass = (column: TableColumn<RecordType>) => fixedEnabled && column.fixed && `is-fixed-${column.fixed}`;
  const constrained = effectiveLayout === "fixed" && columns.every((column) => typeof column.width !== "string") && columns.some((column) => column.minWidth != null || column.maxWidth != null || column.grow != null || column.shrink != null);
  const allocatedWidths = constrained ? allocateColumnWidths(columns, Math.max(containerWidth, typeof scrollX === "number" ? scrollX : 0) - extraColumns * 48, layoutMode === "compact") : undefined;
  const columnWidth = (index: number) => allocatedWidths?.[index] ?? columns[index].width;
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
    if (!scroller || !table || (!constrained && !hasFixed && !bodyLoading)) return;
    const measure = () => {
      const available = scroller.clientWidth;
      setContainerWidth((previous) => previous === available ? previous : available);
      if (bodyLoading) {
        const top = table.tHead?.getBoundingClientRect().height ?? 0;
        const height = Math.max(0, scroller.clientHeight - top);
        setLoadingBox((previous) => previous.top === top && previous.height === height
          ? previous : { top, height });
      }
      if (hasFixed) {
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
  }, [columns, extraColumns, effectiveLayout, layoutMode, scrollX, containerWidth, constrained, showHeader, dataSource, bodyLoading, spinning, fixedBreakpoint]);
  const keyOf = (record: RecordType): TableRowKey => typeof rowKey === "function" ? rowKey(record) : record[rowKey] as TableRowKey;
  const defaultSort = columns.find((column) => column.defaultSortOrder);
  const [sort, setSort] = useState<{ key: string; order: TableSortOrder }>({ key: defaultSort?.key ?? "", order: defaultSort?.defaultSortOrder ?? null });
  const controlledSelection = rowSelection?.selectedRowKeys !== undefined;
  const [innerSelected, setInnerSelected] = useState<TableRowKey[]>(rowSelection?.defaultSelectedRowKeys ?? []);
  const selected = controlledSelection ? rowSelection!.selectedRowKeys! : innerSelected;
  const controlledExpanded = expandable?.expandedRowKeys !== undefined;
  const [innerExpanded, setInnerExpanded] = useState<TableRowKey[]>(expandable?.defaultExpandedRowKeys ?? []);
  const expanded = controlledExpanded ? expandable!.expandedRowKeys! : innerExpanded;
  const dragKey = useRef<TableRowKey | null>(null);
  const [fixedShadows, setFixedShadows] = useState({ left: false, right: false });
  const sorted = useMemo(() => {
    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sorter || !sort.order) return [...dataSource];
    return [...dataSource].sort((a, b) => column.sorter!(a, b) * (sort.order === "ascend" ? 1 : -1));
  }, [columns, dataSource, sort]);
  const pageSize = pagination ? (pagination.pageSize ?? pagination.defaultPageSize ?? 10) : 10;
  const [page, setPage] = useState(pagination ? (pagination.current ?? pagination.defaultCurrent ?? 1) : 1);
  const visible = pagination ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;
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
  const rowLabel = (record: RecordType) => String(columns[0]?.dataIndex == null ? keyOf(record) : record[columns[0].dataIndex]);
  const headerCells = columns.map((column, columnIndex) => {
    if (!column.sorter) {
      return (
        <th
          key={column.key}
          className={cx("qizhi-table__th", fixedClass(column))}
          data-align={column.align}
          style={columnStyle(columnIndex)}
        >
          {column.title}
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
        aria-sort={current === "ascend"
          ? "ascending"
          : current === "descend"
            ? "descending"
            : "none"}
        className={cx("qizhi-table__th", "is-sortable", fixedClass(column))}
        data-align={column.align}
        style={columnStyle(columnIndex)}
      >
        {headerContent}
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
        return <td key={column.key} rowSpan={cell.rowSpan} colSpan={cell.colSpan} data-align={cell.style?.textAlign ?? column.align} className={cx("qizhi-table__td", fixedClass(column), cell.className)} style={{ ...columnStyle(columnIndex), ...cell.style }}><div className={cx("qizhi-table__cell", column.ellipsis && !textEllipsis && "is-ellipsis")} title={title} style={columnIndex === 0 && level ? { paddingInlineStart: level * 24 } : undefined}>{columnIndex === 0 && children?.length && !expandable ? <button type="button" className="qizhi-table__tree-toggle" aria-label={`${isOpen ? "收起" : "展开"}${String(value)}`} aria-expanded={isOpen} onClick={() => toggleExpanded(record)}>{isOpen ? <MinusIcon size={14} /> : <AddIcon size={14} />}</button> : null}{enhancedText ? <TableCellText rows={typeof column.ellipsis === "object" ? column.ellipsis.rows ?? 1 : 1} tooltip={typeof column.ellipsis === "object" && column.ellipsis.tooltip === true}>{content}</TableCellText> : content}</div></td>;
      })}
    </tr>;
    const details = isOpen && expandedContent != null ? <tr key={`${key}-expanded`} className="qizhi-table__expanded"><td colSpan={columns.length + extraColumns}>{expandedContent}</td></tr> : null;
    const childRows = isOpen && children?.length ? renderRows(children, level + 1) : [];
    return [row, details, ...childRows].filter(Boolean);
  });
  const declaredWidth = columns.reduce((sum, column) => sum + (typeof column.width === "number" ? column.width : 0), 0) + extraColumns * 48;
  const allocatedTotal = allocatedWidths ? allocatedWidths.reduce((sum, width) => sum + width, extraColumns * 48) : undefined;
  const tableStyle: CSSProperties = { tableLayout: effectiveLayout, width: allocatedTotal ?? (layoutMode === "compact" ? "max-content" : "100%"), minWidth: allocatedTotal ?? scrollX ?? (declaredWidth > 0 ? declaredWidth : undefined), ...style };
  const emptyContent = bodyLoading && spinning ? <div className="qizhi-table__loading-placeholder" />
    : emptyPadding != null && Number.isFinite(emptyPadding) && emptyPadding >= 0
      ? <div className="qizhi-table__empty-content" style={{ paddingBlock: emptyPadding }}>{empty ?? <Empty />}</div>
      : empty ?? <Empty />;
  return <div {...rest} className={cx("qizhi-table", `qizhi-table--${size}`, border && "is-bordered", borderCell && "has-cell-border", hover && "is-hoverable", stripe && "is-striped", fixedEnabled && fixedShadows.left && "has-left-fixed-shadow", fixedEnabled && fixedShadows.right && "has-right-fixed-shadow", spinning && "is-loading", className)} aria-busy={spinning || undefined}>
    <div ref={scrollRef} className="qizhi-table__scroll" onScroll={(event) => { const node = event.currentTarget; const left = node.scrollLeft > 1; const right = left && node.scrollLeft + node.clientWidth < node.scrollWidth - 1; setFixedShadows({ left, right }); }}><table ref={tableRef} aria-label={ariaLabel} style={tableStyle}>
      <colgroup>{rowSelection ? <col style={{ width: 48 }} /> : null}{expandable ? <col style={{ width: 48 }} /> : null}{columns.map((column, index) => <col key={column.key} style={{ width: columnWidth(index), minWidth: effectiveLayout === "auto" ? column.minWidth : undefined }} />)}</colgroup>
      {showHeader ? <thead><tr>{rowSelection ? <th className="qizhi-table__th qizhi-table__selection">{rowSelection.type !== "radio" ? <Checkbox aria-label="全选当前数据" checked={allChecked} indeterminate={someChecked} onChange={() => updateSelection(allChecked ? selected.filter((key) => !selectable.some((record) => keyOf(record) === key)) : Array.from(new Set([...selected, ...selectable.map(keyOf)])))} /> : null}</th> : null}{expandable ? <th className="qizhi-table__th qizhi-table__expand" aria-label="展开操作" /> : null}{headerCells}</tr></thead> : null}
      <tbody>{visible.length ? renderRows(visible) : <tr><td className={emptyPadding != null || bodyLoading ? "qizhi-table__empty-cell" : undefined} colSpan={columns.length + extraColumns}>{emptyContent}</td></tr>}</tbody>
    </table>{spinning && !bodyLoading ? <div className="qizhi-table__loading" role="status">{loadingTip}</div> : null}</div>
    {spinning && bodyLoading ? <div className="qizhi-table__loading" data-scope="body" role="status" style={{ top: loadingBox.top, height: loadingBox.height, bottom: "auto" }}>{loadingTip}</div> : null}
    {pagination ? <div className={cx("qizhi-table__pagination", `is-${pagination.position ?? "bottomRight"}`)}><Pagination {...pagination} className={cx(pagination.className, `is-${pagination.position ?? "bottomRight"}`)} total={pagination.total ?? dataSource.length} current={pagination.current ?? page} aria-label="表格分页" onChange={(next, nextSize) => { if (pagination.current === undefined) setPage(next); pagination.onChange?.(next, nextSize); }} /></div> : null}
  </div>;
}
