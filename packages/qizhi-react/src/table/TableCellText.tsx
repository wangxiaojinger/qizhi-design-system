import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Tooltip } from "../tooltip/Tooltip";
import "./tableCellText.css";

export interface TableCellTextProps {
  children: string | number;
  rows: 1 | 2;
  tooltip: boolean;
}

export function TableCellText({ children, rows, tooltip }: TableCellTextProps) {
  const contentRef = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [pinned, setPinned] = useState(false);
  const text = String(children);
  const canShowTooltip = tooltip && truncated && text.length > 0;

  const measure = useCallback(() => {
    const content = contentRef.current;
    if (!content || text.length === 0) {
      setTruncated(false);
      return;
    }

    const horizontallyTruncated = content.clientWidth > 0
      && content.scrollWidth / content.clientWidth > 1;
    const verticallyTruncated = content.clientHeight > 0
      && content.scrollHeight / content.clientHeight > 1;
    setTruncated(horizontallyTruncated || verticallyTruncated);
  }, [rows, text, tooltip]);

  useLayoutEffect(() => {
    measure();
    const content = contentRef.current;
    if (!content) return undefined;

    const parent = content.parentElement;
    const resize = () => measure();
    window.addEventListener("resize", resize);

    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(resize);
    observer?.observe(content);
    if (parent) observer?.observe(parent);

    const fonts = document.fonts;
    let active = true;
    fonts?.ready.then(() => {
      if (active) measure();
    });
    fonts?.addEventListener("loadingdone", resize);

    return () => {
      active = false;
      window.removeEventListener("resize", resize);
      observer?.disconnect();
      fonts?.removeEventListener("loadingdone", resize);
    };
  }, [measure]);

  useLayoutEffect(() => {
    if (!canShowTooltip) {
      setPopupVisible(false);
      setPinned(false);
    }
  }, [canShowTooltip]);

  useEffect(() => {
    if (!canShowTooltip || !popupVisible) return undefined;
    const dismissOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      const trigger = contentRef.current;
      const popupId = trigger?.getAttribute("aria-describedby");
      const popup = popupId ? document.getElementById(popupId) : null;
      if (trigger?.contains(target) || popup?.contains(target)) return;
      setPopupVisible(false);
      setPinned(false);
    };
    // A pinned or hovered tooltip can outlive focus on its trigger. Dismiss
    // before Modal/Drawer's bubbling Escape listener, without changing those hosts.
    const dismissOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setPopupVisible(false);
      setPinned(false);
    };
    document.addEventListener("mousedown", dismissOutside);
    document.addEventListener("keydown", dismissOnEscape, true);
    return () => {
      document.removeEventListener("mousedown", dismissOutside);
      document.removeEventListener("keydown", dismissOnEscape, true);
    };
  }, [canShowTooltip, popupVisible]);

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    const next = !pinned;
    setPinned(next);
    setPopupVisible(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Escape" && popupVisible) {
      event.preventDefault();
      event.stopPropagation();
      setPopupVisible(false);
      setPinned(false);
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.click();
  };

  const textLeaf = (
    <span
      ref={contentRef}
      className={`qizhi-table__text is-rows-${rows}`}
      {...(canShowTooltip ? {
        role: "button",
        tabIndex: 0,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
      } : null)}
    >
      {children}
    </span>
  );

  if (!canShowTooltip) return textLeaf;

  const handleTooltipVisibleChange = (visible: boolean) => {
    if (!visible && pinned) return;
    setPopupVisible(visible);
    if (!visible) setPinned(false);
  };

  return (
    <Tooltip
      content={text}
      trigger={["hover", "focus"]}
      popupVisible={popupVisible}
      onVisibleChange={handleTooltipVisibleChange}
      classNames={{ root: "qizhi-table__text-tooltip-popup", container: "qizhi-table__text-tooltip" }}
    >
      {textLeaf}
    </Tooltip>
  );
}
