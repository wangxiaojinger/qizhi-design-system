import { Children, cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, MouseEvent, ReactElement } from "react";
import { createPortal } from "react-dom";
import type { PopoverPosition, PopoverProps } from "./Popover.types";
import {
  constrainFloatingCoordinates,
  getFloatingCoordinates,
} from "../overlay/floatingPosition";

const mergeRef = (element: ReactElement, node: HTMLElement | null) => {
  const ref = (element.props as { ref?: unknown }).ref;
  if (typeof ref === "function") ref(node);
  else if (ref && typeof ref === "object" && "current" in ref) (ref as { current: HTMLElement | null }).current = node;
};

export function Popover({ children, title, content, trigger = "hover", position = "top", popupVisible, defaultPopupVisible = false, onVisibleChange, getPopupContainer, role = "tooltip" }: PopoverProps) {
  const controlled = popupVisible !== undefined;
  const [innerVisible, setInnerVisible] = useState(defaultPopupVisible);
  const [coordinates, setCoordinates] = useState({ left: -10000, top: -10000, ready: false });
  const visible = controlled ? popupVisible : innerVisible;
  const triggerRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const popupId = `qizhi-popover-${useId().replace(/:/g, "")}`;

  const setVisible = (next: boolean) => {
    if (next === visible) return;
    if (!controlled) setInnerVisible(next);
    onVisibleChange?.(next);
  };
  const clearCloseTimer = () => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setVisible(false);
    }, 80);
  };
  const closeAndRestoreFocus = () => {
    setVisible(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };
  const updatePosition = () => {
    if (!triggerRef.current || !popupRef.current) return;
    const popupRect = popupRef.current.getBoundingClientRect();
    const next = constrainFloatingCoordinates(
      getFloatingCoordinates(
        triggerRef.current.getBoundingClientRect(),
        popupRect,
        position,
      ),
      popupRect,
    );
    setCoordinates({ ...next, ready: true });
  };

  useLayoutEffect(() => {
    if (!visible) { setCoordinates((current) => current.ready ? { ...current, ready: false } : current); return; }
    updatePosition();
  }, [visible, position, title, content]);

  useEffect(() => {
    if (!visible) return;
    const handleViewportChange = () => updatePosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [visible, position]);

  useEffect(() => {
    if (!visible) return;
    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !popupRef.current?.contains(target)) setVisible(false);
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeAndRestoreFocus();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible]);

  useEffect(() => () => clearCloseTimer(), []);

  const child = Children.only(children);
  if (!isValidElement<Record<string, unknown>>(child)) throw new Error("Popover requires one valid trigger element");
  const originalClick = child.props.onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const originalContextMenu = child.props.onContextMenu as ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const originalMouseEnter = child.props.onMouseEnter as ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const originalMouseLeave = child.props.onMouseLeave as ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const originalFocus = child.props.onFocus as ((event: FocusEvent<HTMLElement>) => void) | undefined;
  const originalBlur = child.props.onBlur as ((event: FocusEvent<HTMLElement>) => void) | undefined;
  const unavailable = child.props.disabled === true || child.props["aria-disabled"] === true;
  const triggerNode = cloneElement(child, {
    ref: (node: HTMLElement | null) => { triggerRef.current = node; mergeRef(child, node); },
    "aria-expanded": visible,
    "aria-controls": popupId,
    "aria-haspopup": role === "tooltip" ? undefined : role,
    onClick: (event: MouseEvent<HTMLElement>) => { originalClick?.(event); if (!unavailable && trigger === "click") setVisible(!visible); },
    onContextMenu: (event: MouseEvent<HTMLElement>) => { originalContextMenu?.(event); if (!unavailable && trigger === "contextMenu") { event.preventDefault(); setVisible(!visible); } },
    onMouseEnter: (event: MouseEvent<HTMLElement>) => { originalMouseEnter?.(event); if (!unavailable && trigger === "hover") { clearCloseTimer(); setVisible(true); } },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => { originalMouseLeave?.(event); if (trigger === "hover") scheduleClose(); },
    onFocus: (event: FocusEvent<HTMLElement>) => { originalFocus?.(event); if (!unavailable && (trigger === "focus" || trigger === "hover")) { clearCloseTimer(); setVisible(true); } },
    onBlur: (event: FocusEvent<HTMLElement>) => { originalBlur?.(event); if (trigger === "focus" || trigger === "hover") scheduleClose(); },
  });
  const popupContainer = getPopupContainer && triggerRef.current ? getPopupContainer(triggerRef.current) : document.body;

  const popup = visible ? createPortal(
    <div
      ref={popupRef}
      id={popupId}
      className="qizhi-popover"
      data-popover-position={position}
      role={role}
      style={{ left: coordinates.left, top: coordinates.top, visibility: coordinates.ready ? "visible" : "hidden" }}
      onMouseEnter={() => { if (trigger === "hover") clearCloseTimer(); }}
      onMouseLeave={() => { if (trigger === "hover") scheduleClose(); }}
      onFocus={() => { if (trigger === "focus" || trigger === "hover") clearCloseTimer(); }}
      onBlur={(event) => { if ((trigger === "focus" || trigger === "hover") && !event.currentTarget.contains(event.relatedTarget)) scheduleClose(); }}
    >
      {title != null ? <div className="qizhi-popover__title">{title}</div> : null}
      <div className="qizhi-popover__content">{content}</div>
      <span className="qizhi-popover__arrow" aria-hidden="true" />
    </div>,
    popupContainer,
  ) : null;

  return <>{triggerNode}{popup}</>;
}
