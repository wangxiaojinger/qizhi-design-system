import { useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Checkbox } from "../checkbox/Checkbox";
import { Empty } from "../empty/Empty";
import { AddIcon } from "../icon/AddIcon";
import { ArrowDownFilledIcon } from "../icon/generated/ArrowDownFilledIcon";
import { ArrowUpFilledIcon } from "../icon/generated/ArrowUpFilledIcon";
import { MinusIcon } from "../icon/generated/catalog/MinusIcon";
import { Pagination } from "../pagination/Pagination";
import { Radio } from "../radio/Radio";
import type { TableColumn, TableProps, TableRowKey, TableSortOrder } from "./Table.types";
import "./table.css";

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(" ");

export function Table<RecordType extends object>({ columns, dataSource, rowKey, size = "default", border = false, borderCell = false, hover = true, stripe = false, showHeader = true, loading = false, scrollX, rowSelection, expandable, childrenColumnName = "children" as keyof RecordType, pagination = false, empty, draggable = false, onSortChange, onRowOrderChange, className, style, "aria-label": ariaLabel = "表格", ...rest }: TableProps<RecordType>) {
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
    const next: TableSortOrder = current === null ? "ascend" : current === "ascend" ? "descend" : null;
    setSort({ key: column.key, order: next }); onSortChange?.(next, column);
  };
  const rowLabel = (record: RecordType) => String(columns[0]?.dataIndex == null ? keyOf(record) : record[columns[0].dataIndex]);
  const headerCells = columns.map((column) => <th key={column.key} aria-sort={column.sorter ? (sort.key === column.key ? sort.order === "ascend" ? "ascending" : sort.order === "descend" ? "descending" : "none" : "none") : undefined} className={cx("qizhi-table__th", column.fixed && `is-fixed-${column.fixed}`)} style={{ width: column.width }}>{column.sorter ? <button type="button" className="qizhi-table__sort" aria-label={`按${String(column.title)}${sort.key === column.key && sort.order === "ascend" ? "降序" : sort.key === column.key && sort.order === "descend" ? "取消" : "升序"}排序`} onClick={() => changeSort(column)}>{column.title}<span className={cx("qizhi-table__sorter", sort.key === column.key && sort.order === "ascend" && "is-ascend", sort.key === column.key && sort.order === "descend" && "is-descend")} aria-hidden="true"><ArrowUpFilledIcon className="qizhi-table__sorter-icon is-ascend" size={12} /><ArrowDownFilledIcon className="qizhi-table__sorter-icon is-descend" size={12} /></span></button> : column.title}</th>);
  const selectable = allRecords.filter((record) => !rowSelection?.getCheckboxProps?.(record).disabled);
  const allChecked = selectable.length > 0 && selectable.every((record) => selected.includes(keyOf(record)));
  const someChecked = selectable.some((record) => selected.includes(keyOf(record))) && !allChecked;
  const extraColumns = (rowSelection ? 1 : 0) + (expandable ? 1 : 0);
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
      {columns.map((column, columnIndex) => { const cell = column.onCell?.(record, index) ?? {}; if (cell.rowSpan === 0 || cell.colSpan === 0) return null; const value = column.dataIndex == null ? undefined : record[column.dataIndex]; return <td key={column.key} rowSpan={cell.rowSpan} colSpan={cell.colSpan} className={cx("qizhi-table__td", column.fixed && `is-fixed-${column.fixed}`, cell.className)} style={cell.style}><div className="qizhi-table__cell" style={columnIndex === 0 && level ? { paddingInlineStart: level * 24 } : undefined}>{columnIndex === 0 && children?.length && !expandable ? <button type="button" className="qizhi-table__tree-toggle" aria-label={`${isOpen ? "收起" : "展开"}${String(value)}`} aria-expanded={isOpen} onClick={() => toggleExpanded(record)}>{isOpen ? <MinusIcon size={14} /> : <AddIcon size={14} />}</button> : null}{column.render ? column.render(value, record, index) : value as ReactNode}</div></td>; })}
    </tr>;
    const details = isOpen && expandedContent != null ? <tr key={`${key}-expanded`} className="qizhi-table__expanded"><td colSpan={columns.length + extraColumns}>{expandedContent}</td></tr> : null;
    const childRows = isOpen && children?.length ? renderRows(children, level + 1) : [];
    return [row, details, ...childRows].filter(Boolean);
  });
  const declaredWidth = columns.reduce((sum, column) => sum + (typeof column.width === "number" ? column.width : 0), 0) + extraColumns * 48;
  const tableStyle: CSSProperties = { minWidth: scrollX ?? (declaredWidth > 0 ? declaredWidth : undefined), ...style };
  return <div {...rest} className={cx("qizhi-table", `qizhi-table--${size}`, border && "is-bordered", borderCell && "has-cell-border", hover && "is-hoverable", stripe && "is-striped", fixedShadows.left && "has-left-fixed-shadow", fixedShadows.right && "has-right-fixed-shadow", loading && "is-loading", className)} aria-busy={loading || undefined}>
    <div className="qizhi-table__scroll" onScroll={(event) => { const node = event.currentTarget; const left = node.scrollLeft > 1; const right = left && node.scrollLeft + node.clientWidth < node.scrollWidth - 1; setFixedShadows({ left, right }); }}><table aria-label={ariaLabel} style={tableStyle}>
      {showHeader ? <thead><tr>{rowSelection ? <th className="qizhi-table__th qizhi-table__selection">{rowSelection.type !== "radio" ? <Checkbox aria-label="全选当前数据" checked={allChecked} indeterminate={someChecked} onChange={() => updateSelection(allChecked ? selected.filter((key) => !selectable.some((record) => keyOf(record) === key)) : Array.from(new Set([...selected, ...selectable.map(keyOf)])))} /> : null}</th> : null}{expandable ? <th className="qizhi-table__th qizhi-table__expand" aria-label="展开操作" /> : null}{headerCells}</tr></thead> : null}
      <tbody>{visible.length ? renderRows(visible) : <tr><td colSpan={columns.length + extraColumns}>{empty ?? <Empty />}</td></tr>}</tbody>
    </table>{loading ? <div className="qizhi-table__loading" role="status">加载中...</div> : null}</div>
    {pagination ? <div className={cx("qizhi-table__pagination", `is-${pagination.position ?? "bottomRight"}`)}><Pagination {...pagination} className={cx(pagination.className, `is-${pagination.position ?? "bottomRight"}`)} total={pagination.total ?? dataSource.length} current={pagination.current ?? page} aria-label="表格分页" onChange={(next, nextSize) => { if (pagination.current === undefined) setPage(next); pagination.onChange?.(next, nextSize); }} /></div> : null}
  </div>;
}
