import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { FocusEvent, MouseEvent, ReactElement } from "react";
import { createPortal } from "react-dom";
import {
  constrainFloatingCoordinates,
  getFloatingCoordinates,
} from "../overlay/floatingPosition";
import type { TooltipProps, TooltipTrigger } from "./Tooltip.types";
import "./tooltip.css";

const DEFAULT_TRIGGERS: TooltipTrigger[] = ["hover", "focus", "click"];
const CLOSE_DELAY = 80;

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
    if (style.display === "none" || style.visibility === "hidden") {
      return true;
    }
    current = current.parentElement;
  }
  return false;
};

export function Tooltip({
  children,
  content,
  position = "top",
  trigger = DEFAULT_TRIGGERS,
  mini = false,
  color,
  popupVisible,
  defaultPopupVisible = false,
  onVisibleChange,
  getPopupContainer,
}: TooltipProps) {
  const controlled = popupVisible !== undefined;
  const [innerVisible, setInnerVisible] = useState(defaultPopupVisible);
  const [pinned, setPinned] = useState(false);
  const [coordinates, setCoordinates] = useState({
    left: -10000,
    top: -10000,
    ready: false,
  });
  const triggerRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const popupId = `qizhi-tooltip-${useId().replace(/:/g, "")}`;
  const triggers = Array.isArray(trigger) ? trigger : [trigger];
  const visible = controlled ? popupVisible : innerVisible;

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
  const close = (restoreFocus = false) => {
    clearCloseTimer();
    setPinned(false);
    setVisible(false);
    if (restoreFocus) {
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    }
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      if (!pinned) setVisible(false);
    }, CLOSE_DELAY);
  };
  const updatePosition = () => {
    if (!triggerRef.current || !popupRef.current) return;
    if (hasHiddenAncestor(triggerRef.current)) {
      setCoordinates((current) => current.ready
        ? { ...current, ready: false }
        : current);
      return;
    }
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();
    const hasLayout = triggerRect.width > 0 || triggerRect.height > 0;
    const triggerIsOutsideViewport = hasLayout && (
      triggerRect.bottom < 8
      || triggerRect.top > window.innerHeight - 8
      || triggerRect.right < 8
      || triggerRect.left > window.innerWidth - 8
    );
    if (triggerIsOutsideViewport) {
      setCoordinates((current) => ({ ...current, ready: false }));
      return;
    }
    const next = constrainFloatingCoordinates(
      getFloatingCoordinates(
        triggerRect,
        popupRect,
        position,
        10,
      ),
      popupRect,
    );
    setCoordinates({ ...next, ready: true });
  };
  const setPopupNode = useCallback((node: HTMLDivElement | null) => {
    popupRef.current = node;
    if (node) updatePosition();
  }, [position]);

  useLayoutEffect(() => {
    if (!visible) {
      setCoordinates((current) => current.ready
        ? { ...current, ready: false }
        : current);
      return;
    }
    updatePosition();
  }, [visible, position, content, mini, color]);

  useEffect(() => {
    if (!visible) return;
    const handleViewportChange = () => updatePosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    document.addEventListener("qizhi:route-rendered", handleViewportChange);
    window.addEventListener("qizhi:react-island-ready", handleViewportChange);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      document.removeEventListener("qizhi:route-rendered", handleViewportChange);
      window.removeEventListener("qizhi:react-island-ready", handleViewportChange);
    };
  }, [visible, position]);

  useEffect(() => {
    if (!visible || !triggers.includes("click")) return;
    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target)
        && !popupRef.current?.contains(target)
      ) close();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, triggers.includes("click")]);

  useEffect(() => () => clearCloseTimer(), []);

  const child = Children.only(children);
  if (!isValidElement<Record<string, unknown>>(child)) {
    throw new Error("Tooltip requires one valid trigger element");
  }
  const unavailable = child.props.disabled === true
    || child.props["aria-disabled"] === true;
  const originalClick = child.props.onClick as
    | ((event: MouseEvent<HTMLElement>) => void)
    | undefined;
  const originalMouseEnter = child.props.onMouseEnter as
    | ((event: MouseEvent<HTMLElement>) => void)
    | undefined;
  const originalMouseLeave = child.props.onMouseLeave as
    | ((event: MouseEvent<HTMLElement>) => void)
    | undefined;
  const originalFocus = child.props.onFocus as
    | ((event: FocusEvent<HTMLElement>) => void)
    | undefined;
  const originalBlur = child.props.onBlur as
    | ((event: FocusEvent<HTMLElement>) => void)
    | undefined;
  const triggerNode = cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      mergeRef(child, node);
    },
    "aria-expanded": visible,
    "aria-describedby": visible ? popupId : undefined,
    onClick: (event: MouseEvent<HTMLElement>) => {
      originalClick?.(event);
      if (unavailable || !triggers.includes("click")) return;
      const next = !pinned;
      setPinned(next);
      setVisible(next);
    },
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      originalMouseEnter?.(event);
      if (!unavailable && triggers.includes("hover")) {
        clearCloseTimer();
        setVisible(true);
      }
    },
    onMouseLeave: (event: MouseEvent<HTMLElement>) => {
      originalMouseLeave?.(event);
      if (triggers.includes("hover")) scheduleClose();
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      originalFocus?.(event);
      if (!unavailable && triggers.includes("focus")) {
        clearCloseTimer();
        setVisible(true);
      }
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      originalBlur?.(event);
      if (triggers.includes("focus")) scheduleClose();
    },
  });
  const popupContainer = getPopupContainer && triggerRef.current
    ? getPopupContainer(triggerRef.current)
    : document.body;

  const popup = visible ? createPortal(
    <div
      ref={setPopupNode}
      id={popupId}
      className={`qizhi-tooltip${mini ? " qizhi-tooltip-mini" : ""}`}
      data-tooltip-position={position}
      role="tooltip"
      style={{
        left: coordinates.left,
        top: coordinates.top,
        visibility: coordinates.ready ? "visible" : "hidden",
        ...(color ? { backgroundColor: color, "--qizhi-tooltip-bg": color } : null),
      }}
    >
      {content}
      <span className="qizhi-tooltip__arrow" aria-hidden="true" />
    </div>,
    popupContainer,
  ) : null;

  return <>{triggerNode}{popup}</>;
}
