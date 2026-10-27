import { useEffect, useRef } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import "./columnResizeHandle.css";

export interface ColumnResizeHandleProps {
  label: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  gestureKey: string;
  disabled?: boolean;
  onPreview: (width: number | null) => void;
  onCommit: (width: number) => void;
  onCancel?: () => void;
}

type ResizeBounds = {
  min: number;
  max: number;
};

type ActiveGesture = {
  pointerId: number;
  startX: number;
  startWidth: number;
  lastWidth: number;
  direction: number;
  element: HTMLSpanElement;
};

type WindowListeners = {
  move: (event: PointerEvent) => void;
  up: (event: PointerEvent) => void;
  cancel: (event: PointerEvent) => void;
  escape: (event: KeyboardEvent) => void;
  lostCapture: (event: Event) => void;
};

const isFiniteNumber = (value: number) => Number.isFinite(value);

const getBounds = (minWidth: number, maxWidth: number): ResizeBounds | null => {
  if (!isFiniteNumber(minWidth) || (!isFiniteNumber(maxWidth) && maxWidth !== Infinity)) return null;
  return { min: minWidth, max: Math.max(minWidth, maxWidth) };
};

const clamp = (value: number, bounds: ResizeBounds) => Math.min(bounds.max, Math.max(bounds.min, value));

export function ColumnResizeHandle({
  label,
  width,
  minWidth,
  maxWidth,
  gestureKey,
  disabled = false,
  onPreview,
  onCommit,
  onCancel,
}: ColumnResizeHandleProps) {
  const handleRef = useRef<HTMLSpanElement>(null);
  const activeGestureRef = useRef<ActiveGesture | null>(null);
  const listenersRef = useRef<WindowListeners | null>(null);
  const finishGestureRef = useRef<(mode: "commit" | "cancel") => void>(() => undefined);
  const previousGestureKeyRef = useRef<string | undefined>(undefined);
  const propsRef = useRef({ width, minWidth, maxWidth, disabled, onPreview, onCommit, onCancel });
  propsRef.current = { width, minWidth, maxWidth, disabled, onPreview, onCommit, onCancel };

  const removeWindowListeners = () => {
    const listeners = listenersRef.current;
    const active = activeGestureRef.current;
    if (!listeners) return;
    window.removeEventListener("pointermove", listeners.move);
    window.removeEventListener("pointerup", listeners.up);
    window.removeEventListener("pointercancel", listeners.cancel);
    window.removeEventListener("keydown", listeners.escape, true);
    window.removeEventListener("lostpointercapture", listeners.lostCapture);
    active?.element.removeEventListener("lostpointercapture", listeners.lostCapture);
    listenersRef.current = null;
  };

  const finishGesture = (mode: "commit" | "cancel") => {
    const active = activeGestureRef.current;
    if (!active) return;
    removeWindowListeners();
    activeGestureRef.current = null;
    delete active.element.dataset.resizing;
    try {
      active.element.releasePointerCapture?.(active.pointerId);
    } catch {
      // Pointer capture is optional and may already have been released outside the table.
    }
    propsRef.current.onPreview(null);
    if (mode === "commit") {
      if (active.lastWidth !== active.startWidth) propsRef.current.onCommit(active.lastWidth);
      return;
    }
    propsRef.current.onCancel?.();
  };
  finishGestureRef.current = finishGesture;

  const updateGesture = (event: Pick<PointerEvent, "pointerId" | "clientX">) => {
    const active = activeGestureRef.current;
    if (!active || (typeof event.pointerId === "number" && event.pointerId !== active.pointerId)) return;
    if (!Number.isFinite(event.clientX)) return;
    const bounds = getBounds(propsRef.current.minWidth, propsRef.current.maxWidth);
    if (!bounds) return;
    const next = clamp(active.startWidth + (event.clientX - active.startX) * active.direction, bounds);
    if (next === active.lastWidth) return;
    active.lastWidth = next;
    propsRef.current.onPreview(next);
  };

  const beginGesture = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (disabled || event.button !== 0 || !isFiniteNumber(width)) return;
    const bounds = getBounds(minWidth, maxWidth);
    if (!bounds) return;
    event.preventDefault();
    event.stopPropagation();
    finishGesture("cancel");
    const element = event.currentTarget;
    const pointerId = event.pointerId;
    const direction = typeof window !== "undefined" && window.getComputedStyle(element).direction === "rtl" ? -1 : 1;
    const active: ActiveGesture = {
      pointerId,
      startX: event.clientX,
      startWidth: clamp(width, bounds),
      lastWidth: clamp(width, bounds),
      direction,
      element,
    };
    activeGestureRef.current = active;
    element.dataset.resizing = "true";
    try {
      element.setPointerCapture?.(pointerId);
    } catch {
      // Some browsers and test environments do not support pointer capture on table headers.
    }
    const belongsToActivePointer = (pointerEvent: PointerEvent | Event) => {
      const eventPointerId = (pointerEvent as PointerEvent).pointerId;
      return typeof eventPointerId !== "number" || eventPointerId === active.pointerId;
    };
    const listeners: WindowListeners = {
      move: (pointerEvent) => updateGesture(pointerEvent),
      up: (pointerEvent) => {
        if (!belongsToActivePointer(pointerEvent)) return;
        updateGesture(pointerEvent);
        finishGestureRef.current("commit");
      },
      cancel: (pointerEvent) => {
        if (belongsToActivePointer(pointerEvent)) finishGestureRef.current("cancel");
      },
      escape: (keyboardEvent) => {
        if (keyboardEvent.key !== "Escape") return;
        keyboardEvent.preventDefault();
        keyboardEvent.stopPropagation();
        finishGestureRef.current("cancel");
      },
      lostCapture: (lostCaptureEvent) => {
        if (belongsToActivePointer(lostCaptureEvent)) finishGestureRef.current("cancel");
      },
    };
    listenersRef.current = listeners;
    window.addEventListener("pointermove", listeners.move);
    window.addEventListener("pointerup", listeners.up);
    window.addEventListener("pointercancel", listeners.cancel);
    window.addEventListener("keydown", listeners.escape, true);
    window.addEventListener("lostpointercapture", listeners.lostCapture);
    element.addEventListener("lostpointercapture", listeners.lostCapture);
  };

  const commitKeyboardWidth = (event: ReactKeyboardEvent<HTMLSpanElement>, next: number | null) => {
    if (next == null || disabled) return;
    event.preventDefault();
    event.stopPropagation();
    const currentWidth = propsRef.current.width;
    if (!isFiniteNumber(currentWidth) || next === currentWidth) return;
    propsRef.current.onPreview(next);
    propsRef.current.onCommit(next);
    propsRef.current.onPreview(null);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return;
    const bounds = getBounds(minWidth, maxWidth);
    if (!bounds || !isFiniteNumber(width)) return;
    const direction = typeof window !== "undefined" && handleRef.current && window.getComputedStyle(handleRef.current).direction === "rtl" ? -1 : 1;
    const step = event.shiftKey ? 1 : 8;
    if (event.key === "ArrowLeft") return commitKeyboardWidth(event, clamp(width - step * direction, bounds));
    if (event.key === "ArrowRight") return commitKeyboardWidth(event, clamp(width + step * direction, bounds));
    if (event.key === "Home") return commitKeyboardWidth(event, bounds.min);
    if (event.key === "End" && Number.isFinite(bounds.max)) return commitKeyboardWidth(event, bounds.max);
  };

  useEffect(() => {
    const previousGestureKey = previousGestureKeyRef.current;
    if (previousGestureKey !== undefined && previousGestureKey !== gestureKey) finishGestureRef.current("cancel");
    previousGestureKeyRef.current = gestureKey;
  }, [gestureKey]);

  useEffect(() => () => finishGestureRef.current("cancel"), []);

  const bounds = getBounds(minWidth, maxWidth);
  const ariaValueNow = isFiniteNumber(width) ? width : undefined;

  return (
    <span
      ref={handleRef}
      role="separator"
      aria-label={label}
      aria-orientation="vertical"
      aria-valuenow={ariaValueNow}
      aria-valuemin={bounds?.min}
      aria-valuemax={bounds && Number.isFinite(bounds.max) ? bounds.max : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      className="qizhi-table__resize-handle"
      onPointerDown={beginGesture}
      onKeyDown={handleKeyDown}
    />
  );
}
