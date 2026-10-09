import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, FocusEvent, MouseEvent, ReactElement } from "react";
import { createPortal } from "react-dom";
import {
  getFloatingOverlayLayout,
} from "../overlay/floatingPosition";
import type {
  TooltipHandle,
  TooltipProps,
  TooltipTrigger,
} from "./Tooltip.types";
import "./tooltip.css";

const DEFAULT_TRIGGERS: TooltipTrigger[] = ["hover", "focus"];
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

const isEmptyContent = (content: TooltipProps["content"]) => (
  content == null || content === ""
);

const joinClassNames = (...values: Array<string | undefined>) => (
  values.filter(Boolean).join(" ")
);

export const Tooltip = forwardRef<TooltipHandle, TooltipProps>(
  function Tooltip({
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
    mouseEnterDelay = 0,
    mouseLeaveDelay = DEFAULT_LEAVE_DELAY,
    arrow = true,
    zIndex,
    classNames,
    styles,
  }, forwardedRef) {
    const controlled = popupVisible !== undefined;
    const [innerVisible, setInnerVisible] = useState(defaultPopupVisible);
    const [pinned, setPinned] = useState(false);
    const [coordinates, setCoordinates] = useState({
      left: -10000,
      top: -10000,
      ready: false,
      position,
      arrowOffset: 0,
    });
    const triggerRef = useRef<HTMLElement | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const openTimerRef = useRef<number | null>(null);
    const closeTimerRef = useRef<number | null>(null);
    const dismissibleRef = useRef(false);
    const triggerHoveredRef = useRef(false);
    const triggerFocusedRef = useRef(false);
    const popupId = `qizhi-tooltip-${useId().replace(/:/g, "")}`;
    const triggers = Array.isArray(trigger) ? trigger : [trigger];
    const hasContent = !isEmptyContent(content);
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
      setPinned(false);
      dismissibleRef.current = false;
      setVisible(false);
      if (restoreFocus) window.setTimeout(() => triggerRef.current?.focus(), 0);
    };
    const scheduleClose = () => {
      clearOpenTimer();
      clearCloseTimer();
      const canClose = () => !triggerHoveredRef.current && !triggerFocusedRef.current;
      if (!canClose()) return;
      if (mouseLeaveDelay <= 0) {
        if (!pinned) {
          dismissibleRef.current = false;
          setVisible(false);
        }
        return;
      }
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        if (!canClose()) return;
        if (!pinned) {
          dismissibleRef.current = false;
          setVisible(false);
        }
      }, mouseLeaveDelay * 1000);
    };
    const updatePosition = useCallback(() => {
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
        triggerRect.bottom < VIEWPORT_MARGIN
        || triggerRect.top > window.innerHeight - VIEWPORT_MARGIN
        || triggerRect.right < VIEWPORT_MARGIN
        || triggerRect.left > window.innerWidth - VIEWPORT_MARGIN
      );
      if (triggerIsOutsideViewport) {
        setCoordinates((current) => ({ ...current, ready: false }));
        return;
      }
      const next = getFloatingOverlayLayout(
        triggerRect,
        popupRect,
        position,
        { gap: 10 },
      );
      setCoordinates({ ...next, ready: true });
    }, [position]);

    const setPopupNode = useCallback((node: HTMLDivElement | null) => {
      popupRef.current = node;
      if (node) updatePosition();
    }, [updatePosition]);

    useImperativeHandle(forwardedRef, () => ({ forceAlign: updatePosition }), [
      updatePosition,
    ]);

    useLayoutEffect(() => {
      if (!visible) {
        setCoordinates((current) => current.ready
          ? { ...current, ready: false }
          : current);
        return;
      }
      updatePosition();
    }, [visible, position, content, mini, color, updatePosition]);

    useEffect(() => {
      if (!visible) return;
      const handleViewportChange = () => updatePosition();
      window.addEventListener("resize", handleViewportChange);
      window.addEventListener("scroll", handleViewportChange, true);
      document.addEventListener("qizhi:route-rendered", handleViewportChange);
      window.addEventListener("qizhi:react-island-ready", handleViewportChange);
      const resizeObserver = typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(handleViewportChange);
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
      const closesOnOutsidePointer = triggers.includes("click");
      const handlePointerDown = (event: globalThis.MouseEvent) => {
        if (!closesOnOutsidePointer) return;
        const target = event.target as Node;
        if (
          !triggerRef.current?.contains(target)
          && !popupRef.current?.contains(target)
        ) close();
      };
      const handleKeyDown = (event: globalThis.KeyboardEvent) => {
        if (event.key !== "Escape" || !dismissibleRef.current) return;
        event.preventDefault();
        close(pinned);
      };
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [visible, pinned, triggers.includes("click")]);

    useEffect(() => () => {
      clearOpenTimer();
      clearCloseTimer();
    }, []);

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
        if (unavailable || !hasContent || !triggers.includes("click")) return;
        const next = !pinned;
        dismissibleRef.current = next;
        setPinned(next);
        setVisible(next);
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
    });
    const popupContainer = getPopupContainer && triggerRef.current
      ? getPopupContainer(triggerRef.current)
      : document.body;
    const rootStyle = {
      ...(color ? {
        "--qizhi-tooltip-bg": color,
      } : null),
      ...styles?.root,
      left: coordinates.left,
      top: coordinates.top,
      visibility: coordinates.ready ? "visible" : "hidden",
      ...(zIndex === undefined ? null : { zIndex }),
      "--qizhi-tooltip-arrow-offset": `${coordinates.arrowOffset}px`,
    } as CSSProperties;

    const popup = visible ? createPortal(
      <div
        ref={setPopupNode}
        id={popupId}
        className={joinClassNames(
          "qizhi-tooltip",
          mini ? "qizhi-tooltip-mini" : undefined,
          classNames?.root,
        )}
        data-tooltip-position={coordinates.position}
        role="tooltip"
        style={rootStyle}
      >
        <div
          className={joinClassNames(
            "qizhi-tooltip__container",
            classNames?.container,
          )}
          style={{ ...(color ? { backgroundColor: color } : null), ...styles?.container }}
        >
          {content}
        </div>
        {arrow ? (
          <span
            className={joinClassNames(
              "qizhi-tooltip__arrow",
              classNames?.arrow,
            )}
            style={styles?.arrow}
            aria-hidden="true"
          />
        ) : null}
      </div>,
      popupContainer,
    ) : null;

    return <>{triggerNode}{popup}</>;
  },
);
