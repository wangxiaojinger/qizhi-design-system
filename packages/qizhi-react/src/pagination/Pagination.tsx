import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Input } from "../input/Input";
import { Select } from "../select/Select";
import { ArrowLeftIcon } from "../icon/generated/ArrowLeftIcon";
import { ArrowRightIcon } from "../icon/generated/ArrowRightIcon";
import { MoreIcon } from "../icon/MoreIcon";
import { clampPage, getPaginationTokens } from "./paginationModel";
import type { PaginationProps } from "./Pagination.types";

const joinClassName = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(" ");
const positive = (value: number, fallback: number) => Number.isFinite(value) && value > 0 ? Math.trunc(value) : fallback;

export function Pagination({ total, current, defaultCurrent = 1, pageSize, defaultPageSize = 10, pageSizeOptions = [10, 20, 50], onChange, onPageSizeChange, size = "default", simple = false, showTotal = false, showPageSize = false, showJumper = false, disabled = false, className, "aria-label": ariaLabel = "分页", ...rest }: PaginationProps) {
  const controlledCurrent = current !== undefined;
  const controlledPageSize = pageSize !== undefined;
  const [innerCurrent, setInnerCurrent] = useState(defaultCurrent);
  const [innerPageSize, setInnerPageSize] = useState(defaultPageSize);
  const [jumper, setJumper] = useState("");
  const [simpleValue, setSimpleValue] = useState("");
  const [simpleEditing, setSimpleEditing] = useState(false);
  const jumperRef = useRef<HTMLInputElement>(null);
  const simpleRef = useRef<HTMLInputElement>(null);
  const resolvedPageSize = positive(controlledPageSize ? pageSize : innerPageSize, 10);
  const totalPages = Math.max(1, Math.ceil(Math.max(0, total) / resolvedPageSize));
  const resolvedCurrent = clampPage(controlledCurrent ? current : innerCurrent, totalPages);
  const requestPage = (next: number) => {
    if (disabled) return;
    const clamped = clampPage(next, totalPages);
    if (!controlledCurrent) setInnerCurrent(clamped);
    onChange?.(clamped, resolvedPageSize);
  };
  const commitInput = (value: string, simpleMode: boolean) => {
    const parsed = Number(value);
    if (value.trim() && Number.isFinite(parsed)) requestPage(parsed);
    if (simpleMode) { setSimpleValue(""); setSimpleEditing(false); } else setJumper("");
    queueMicrotask(() => (simpleMode ? simpleRef.current : jumperRef.current)?.focus());
  };
  const inputKeyDown = (value: string, simpleMode: boolean) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    commitInput(value, simpleMode);
  };
  const range: [number, number] = total === 0 ? [0, 0] : [(resolvedCurrent - 1) * resolvedPageSize + 1, Math.min(resolvedCurrent * resolvedPageSize, total)];
  const tokens = getPaginationTokens(resolvedCurrent, totalPages);
  const arrow = (direction: "prev" | "next") => {
    const isPrev = direction === "prev";
    const unavailable = disabled || (isPrev ? resolvedCurrent === 1 : resolvedCurrent === totalPages);
    return <button className="qizhi-pagination__item qizhi-pagination__item--arrow" type="button" aria-label={isPrev ? "上一页" : "下一页"} disabled={unavailable} onClick={() => requestPage(resolvedCurrent + (isPrev ? -1 : 1))}>{isPrev ? <ArrowLeftIcon /> : <ArrowRightIcon />}</button>;
  };
  return <nav {...rest} className={joinClassName("qizhi-pagination", `qizhi-pagination--${size}`, simple && "qizhi-pagination--simple", disabled && "is-disabled", className)} aria-label={ariaLabel} aria-disabled={disabled || undefined}>
    {showTotal ? <span className="qizhi-pagination__total">{typeof showTotal === "function" ? showTotal(total, range) : `共 ${total} 条`}</span> : null}
    {arrow("prev")}
    {simple ? <label className="qizhi-pagination__simple-pager"><span className="sr-only">当前页码</span><Input ref={simpleRef} type="number" min={1} max={totalPages} inputMode="numeric" aria-label="当前页码" size={size} allowClear={false} disabled={disabled} value={simpleEditing ? simpleValue : String(resolvedCurrent)} onChange={(event) => setSimpleValue(event.target.value)} onFocus={() => { setSimpleEditing(true); setSimpleValue(String(resolvedCurrent)); }} onBlur={() => setSimpleEditing(false)} onKeyDown={inputKeyDown(simpleValue || String(resolvedCurrent), true)} /><span aria-hidden="true">/</span><span>{totalPages}</span></label> : <div className="qizhi-pagination__pages">{tokens.map((token, index) => typeof token === "number" ? <button key={token} className={joinClassName("qizhi-pagination__item", token === resolvedCurrent && "is-active")} type="button" aria-label={`第 ${token} 页`} aria-current={token === resolvedCurrent ? "page" : undefined} disabled={disabled} onClick={() => requestPage(token)}>{token}</button> : <button key={`${token}-${index}`} className="qizhi-pagination__item qizhi-pagination__item--more" type="button" aria-label={token === "prev" ? "向前 5 页" : "向后 5 页"} disabled={disabled} onClick={() => requestPage(resolvedCurrent + (token === "prev" ? -5 : 5))}><MoreIcon /></button>)}</div>}
    {arrow("next")}
    {showPageSize ? <Select aria-label="每页条数" size={size} disabled={disabled} value={resolvedPageSize} options={pageSizeOptions.map((value) => ({ value, label: `${value} 条/页` }))} onChange={(value) => { if (typeof value !== "number") return; if (!controlledPageSize) setInnerPageSize(value); if (!controlledCurrent) setInnerCurrent(1); onPageSizeChange?.(value, 1); onChange?.(1, value); }} /> : null}
    {showJumper && !simple ? <label className="qizhi-pagination__jumper"><span>前往</span><Input ref={jumperRef} type="number" min={1} max={totalPages} inputMode="numeric" aria-label="跳转页码" size={size} allowClear={false} disabled={disabled} value={jumper} onChange={(event) => setJumper(event.target.value)} onKeyDown={inputKeyDown(jumper, false)} /><span>页</span></label> : null}
  </nav>;
}
