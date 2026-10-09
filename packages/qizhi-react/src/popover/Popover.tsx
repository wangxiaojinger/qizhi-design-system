import {
  Children, cloneElement, forwardRef, isValidElement, useCallback, useEffect,
  useId, useImperativeHandle, useLayoutEffect, useRef, useState,
} from "react";
import type { CSSProperties, FocusEvent, MouseEvent, ReactElement } from "react";
import { createPortal } from "react-dom";
import { getFloatingOverlayLayout } from "../overlay/floatingPosition";
import { getTabbableElements } from "../overlay/focus";
import type { PopoverHandle, PopoverProps, PopoverTrigger } from "./Popover.types";
import "./popover.css";

const DEFAULT_TRIGGERS: PopoverTrigger[] = ["hover", "focus"];
const DEFAULT_LEAVE_DELAY = 0.08;
const VIEWPORT_MARGIN = 8;

const mergeRef = (element: ReactElement, node: HTMLElement | null) => {
  const ref = (element.props as { ref?: unknown }).ref;
  if (typeof ref === "function") ref(node);
  else if (ref && typeof ref === "object" && "current" in ref) {
    (ref as { current: HTMLElement | null }).current = node;
  }
};

const hasHiddenAncestor = (element: HTMLElement) => {
  let current: HTMLElement | null = element;
  while (current) {
    const style = window.getComputedStyle(current);
    if (style.display === "none" || style.visibility === "hidden") return true;
    current = current.parentElement;
  }
  return false;
};

const joinClassNames = (...values: Array<string | undefined>) => values.filter(Boolean).join(" ");

export const Popover = forwardRef<PopoverHandle, PopoverProps>(function Popover({
  children,
  title,
  content,
  trigger = DEFAULT_TRIGGERS,
  position = "top",
  popupVisible,
  defaultPopupVisible = false,
  onVisibleChange,
  getPopupContainer,
  role = "dialog",
  ariaLabel,
  mouseEnterDelay = 0,
  mouseLeaveDelay = DEFAULT_LEAVE_DELAY,
  arrow = true,
  zIndex,
  classNames,
  styles,
  variant = "light",
}, forwardedRef) {
  const controlled = popupVisible !== undefined;
  const [innerVisible, setInnerVisible] = useState(defaultPopupVisible);
  const [coordinates, setCoordinates] = useState({
    left: -10000, top: -10000, ready: false, position, arrowOffset: 0,
  });
  const triggerRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const dismissibleRef = useRef(false);
  const triggerHoveredRef = useRef(false);
  const triggerFocusedRef = useRef(false);
  const popupHoveredRef = useRef(false);
  const popupFocusedRef = useRef(false);
  const id = useId().replace(/:/g, "");
  const popupId = `qizhi-popover-${id}`;
  const titleId = `qizhi-popover-title-${id}`;
  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  const hasContent = content != null && content !== "";
  const requestedVisible = controlled ? popupVisible : innerVisible;
  const visible = requestedVisible && hasContent;

  const clearOpenTimer = () => {
    if (openTimerRef.current === null) return;
    window.clearTimeout(openTimerRef.current);
    openTimerRef.current = null;
  };
  const clearCloseTimer = () => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };
  const setVisible = (next: boolean) => {
    if (next && !hasContent) return;
    if (next === visible) return;
    if (!controlled) setInnerVisible(next);
    onVisibleChange?.(next);
  };
  const open = (delay = 0) => {
    dismissibleRef.current = true;
    clearCloseTimer();
    clearOpenTimer();
    if (delay <= 0) {
      setVisible(true);
      return;
    }
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      setVisible(true);
    }, delay * 1000);
  };
  const close = (restoreFocus = false) => {
    clearOpenTimer();
    clearCloseTimer();
    dismissibleRef.current = false;
    setVisible(false);
    if (restoreFocus) window.setTimeout(() => triggerRef.current?.focus(), 0);
  };
  const scheduleClose = () => {
    clearOpenTimer();
    clearCloseTimer();
    const canClose = () => !triggerHoveredRef.current && !triggerFocusedRef.current
      && !popupHoveredRef.current && !popupFocusedRef.current;
    if (!canClose()) return;
    if (mouseLeaveDelay <= 0) {
      dismissibleRef.current = false;
      setVisible(false);
      return;
    }
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      if (!canClose()) return;
      dismissibleRef.current = false;
      setVisible(false);
    }, mouseLeaveDelay * 1000);
  };
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !popupRef.current) return;
    if (hasHiddenAncestor(triggerRef.current)) {
      setCoordinates((current) => current.ready ? { ...current, ready: false } : current);
      return;
    }
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();
    const hasLayout = triggerRect.width > 0 || triggerRect.height > 0;
    const outsideViewport = hasLayout && (
      triggerRect.bottom < VIEWPORT_MARGIN
      || triggerRect.top > window.innerHeight - VIEWPORT_MARGIN
      || triggerRect.right < VIEWPORT_MARGIN
      || triggerRect.left > window.innerWidth - VIEWPORT_MARGIN
    );
    if (outsideViewport) {
      setCoordinates((current) => ({ ...current, ready: false }));
      return;
    }
    const next = getFloatingOverlayLayout(triggerRect, popupRect, position, {
      gap: 12,
    });
    setCoordinates({ ...next, ready: true });
  }, [position]);

  const setPopupNode = useCallback((node: HTMLDivElement | null) => {
    popupRef.current = node;
    if (node) updatePosition();
  }, [updatePosition]);

  useImperativeHandle(forwardedRef, () => ({ forceAlign: updatePosition }), [updatePosition]);

  useLayoutEffect(() => {
    if (!visible) {
      setCoordinates((current) => current.ready ? { ...current, ready: false } : current);
      return;
    }
    updatePosition();
  }, [visible, position, title, content, updatePosition]);

  useEffect(() => {
    if (!visible) return;
    const handleViewportChange = () => updatePosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    document.addEventListener("qizhi:route-rendered", handleViewportChange);
    window.addEventListener("qizhi:react-island-ready", handleViewportChange);
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(handleViewportChange);
    if (triggerRef.current) resizeObserver?.observe(triggerRef.current);
    if (popupRef.current) resizeObserver?.observe(popupRef.current);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      document.removeEventListener("qizhi:route-rendered", handleViewportChange);
      window.removeEventListener("qizhi:react-island-ready", handleViewportChange);
      resizeObserver?.disconnect();
    };
  }, [visible, updatePosition]);

  useEffect(() => {
    if (!visible) return;
    const closesOnOutsidePointer = triggers.includes("click") || triggers.includes("contextMenu");
    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!closesOnOutsidePointer) return;
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !popupRef.current?.contains(target)) close();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || !dismissibleRef.current) return;
      event.preventDefault();
      close(closesOnOutsidePointer);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, triggers.includes("click"), triggers.includes("contextMenu")]);

  useEffect(() => () => {
    clearOpenTimer();
    clearCloseTimer();
  }, []);

  const child = Children.only(children);
  if (!isValidElement<Record<string, unknown>>(child)) {
    throw new Error("Popover requires one valid trigger element");
  }
  const unavailable = child.props.disabled === true || child.props["aria-disabled"] === true;
  const originalClick = child.props.onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const originalContextMenu = child.props.onContextMenu as ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const originalMouseEnter = child.props.onMouseEnter as ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const originalMouseLeave = child.props.onMouseLeave as ((event: MouseEvent<HTMLElement>) => void) | undefined;
  const originalFocus = child.props.onFocus as ((event: FocusEvent<HTMLElement>) => void) | undefined;
  const originalBlur = child.props.onBlur as ((event: FocusEvent<HTMLElement>) => void) | undefined;
  const originalKeyDown = child.props.onKeyDown as ((event: React.KeyboardEvent<HTMLElement>) => void) | undefined;
  const triggerNode = cloneElement(child, {
    ref: (node: HTMLElement | null) => { triggerRef.current = node; mergeRef(child, node); },
    "aria-expanded": visible,
    "aria-controls": visible ? popupId : undefined,
    "aria-haspopup": role === "tooltip" ? undefined : role,
    "aria-describedby": role === "tooltip" && visible ? popupId : undefined,
    onClick: (event: MouseEvent<HTMLElement>) => {
      originalClick?.(event);
      if (unavailable || !hasContent || !triggers.includes("click")) return;
      dismissibleRef.current = !visible;
      setVisible(!visible);
    },
    onContextMenu: (event: MouseEvent<HTMLElement>) => {
      originalContextMenu?.(event);
      if (unavailable || !hasContent || !triggers.includes("contextMenu")) return;
      event.preventDefault();
      dismissibleRef.current = !visible;
      setVisible(!visible);
    },
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      originalMouseEnter?.(event);
      triggerHoveredRef.current = true;
      if (!unavailable && triggers.includes("hover")) open(mouseEnterDelay);
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      originalMouseLeave?.(event);
      triggerHoveredRef.current = false;
      if (triggers.includes("hover")) scheduleClose();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      originalFocus?.(event);
      triggerFocusedRef.current = true;
      if (!unavailable && triggers.includes("focus")) open();
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      originalBlur?.(event);
      triggerFocusedRef.current = false;
      if (triggers.includes("focus")) scheduleClose();
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      originalKeyDown?.(event);
      if (event.defaultPrevented || event.key !== "Tab" || event.shiftKey || !visible || role === "tooltip") return;
      const first = popupRef.current ? getTabbableElements(popupRef.current)[0] : undefined;
      if (!first) return;
      event.preventDefault();
      first.focus();
    },
  });
  const popupContainer = getPopupContainer && triggerRef.current ? getPopupContainer(triggerRef.current) : document.body;
  const primitiveLabel = typeof content === "string" || typeof content === "number" ? String(content) : undefined;
  const rootStyle = {
    ...styles?.root,
    left: coordinates.left,
    top: coordinates.top,
    visibility: coordinates.ready ? "visible" : "hidden",
    ...(zIndex === undefined ? null : { zIndex }),
    "--qizhi-popover-arrow-offset": `${coordinates.arrowOffset}px`,
  } as CSSProperties;
  const arrowStyle = styles?.arrow as CSSProperties | undefined;

  const popup = visible ? createPortal(
    <div
      ref={setPopupNode}
      id={popupId}
      className={joinClassNames(
        "qizhi-popover",
        `qizhi-popover--${variant}`,
        classNames?.root,
      )}
      data-popover-position={coordinates.position}
      role={role}
      aria-labelledby={title != null ? titleId : undefined}
      aria-label={title == null ? ariaLabel ?? primitiveLabel : undefined}
      style={rootStyle}
      onMouseEnter={() => { popupHoveredRef.current = true; if (triggers.includes("hover")) clearCloseTimer(); }}
      onMouseLeave={() => { popupHoveredRef.current = false; if (triggers.includes("hover")) scheduleClose(); }}
      onFocus={() => { popupFocusedRef.current = true; if (triggers.includes("focus")) clearCloseTimer(); }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) popupFocusedRef.current = false;
        if (triggers.includes("focus") && !event.currentTarget.contains(event.relatedTarget)) scheduleClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab" || !event.shiftKey) return;
        const first = getTabbableElements(event.currentTarget)[0];
        if (document.activeElement !== first) return;
        event.preventDefault();
        triggerRef.current?.focus();
      }}
    >
      {title != null ? (
        <div id={titleId} className={joinClassNames("qizhi-popover__title", classNames?.title)} style={styles?.title}>{title}</div>
      ) : null}
      <div
        className={joinClassNames("qizhi-popover__content", classNames?.content)}
        style={{ ...(variant === "dark" ? { color: "inherit" } : null), ...styles?.content }}
      >
        {content}
      </div>
      {arrow ? <span className={joinClassNames("qizhi-popover__arrow", classNames?.arrow)} style={arrowStyle} aria-hidden="true" /> : null}
    </div>,
    popupContainer,
  ) : null;

  return <>{triggerNode}{popup}</>;
});
