import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { MouseEvent, ReactElement } from "react";
import { createPortal } from "react-dom";
import { Button } from "../button/Button";
import { WarningFilledIcon } from "../icon/generated/prompt/WarningFilledIcon";
import {
  getFittedFloatingPlacement,
} from "../overlay/floatingPosition";
import type { FloatingPosition } from "../overlay/floatingPosition";
import type { PopconfirmProps } from "./Popconfirm.types";
import "./popconfirm.css";

const mergeRef = (element: ReactElement, node: HTMLElement | null) => {
  const ref = (element.props as { ref?: unknown }).ref;
  if (typeof ref === "function") ref(node);
  else if (ref && typeof ref === "object" && "current" in ref) {
    (ref as { current: HTMLElement | null }).current = node;
  }
};

const isPromise = (value: unknown): value is Promise<void> =>
  Boolean(value && typeof (value as Promise<void>).then === "function");

export function Popconfirm({
  children,
  title,
  content,
  position = "top",
  icon = <WarningFilledIcon className="qizhi-popconfirm__default-icon" />,
  disabled = false,
  okText = "确定",
  cancelText = "取消",
  okButtonProps,
  cancelButtonProps,
  onOk,
  onCancel,
  popupVisible,
  defaultPopupVisible = false,
  onVisibleChange,
  getPopupContainer,
}: PopconfirmProps) {
  const controlled = popupVisible !== undefined;
  const [innerVisible, setInnerVisible] = useState(defaultPopupVisible);
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({
    left: -10000,
    top: -10000,
    ready: false,
    position: position as FloatingPosition,
  });
  const visible = controlled ? popupVisible : innerVisible;
  const triggerRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const baseId = `qizhi-popconfirm-${useId().replace(/:/g, "")}`;
  const titleId = `${baseId}-title`;
  const contentId = `${baseId}-content`;

  const setVisible = (next: boolean) => {
    if (loading || next === visible) return;
    if (!controlled) setInnerVisible(next);
    onVisibleChange?.(next);
  };
  const closeAndRestoreFocus = () => {
    if (loading) return;
    setVisible(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };
  const updatePosition = () => {
    if (!triggerRef.current || !popupRef.current) return;
    const popupRect = popupRef.current.getBoundingClientRect();
    const next = getFittedFloatingPlacement(
      triggerRef.current.getBoundingClientRect(),
      popupRect,
      position,
    );
    setCoordinates({ ...next, ready: true });
  };

  useLayoutEffect(() => {
    if (!visible) {
      setCoordinates((current) => current.ready
        ? { ...current, ready: false }
        : current);
      return;
    }
    updatePosition();
  }, [visible, position, title, content]);

  useEffect(() => {
    if (!visible) return;
    const frame = window.requestAnimationFrame(() => cancelRef.current?.focus());
    const handleViewportChange = () => updatePosition();
    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (loading) return;
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target)
        && !popupRef.current?.contains(target)) setVisible(false);
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || loading) return;
      event.preventDefault();
      closeAndRestoreFocus();
    };
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, loading]);

  const child = Children.only(children);
  if (!isValidElement<Record<string, unknown>>(child)) {
    throw new Error("Popconfirm requires one valid trigger element");
  }
  const originalClick = child.props.onClick as
    | ((event: MouseEvent<HTMLElement>) => void)
    | undefined;
  const unavailable = disabled
    || child.props.disabled === true
    || child.props["aria-disabled"] === true;
  const triggerNode = cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      mergeRef(child, node);
    },
    "aria-expanded": visible,
    "aria-controls": baseId,
    "aria-haspopup": "dialog",
    onClick: (event: MouseEvent<HTMLElement>) => {
      originalClick?.(event);
      if (!unavailable && !loading) setVisible(!visible);
    },
  });
  const popupContainer = getPopupContainer && triggerRef.current
    ? getPopupContainer(triggerRef.current)
    : document.body;

  const handleCancel = (event: MouseEvent<HTMLButtonElement>) => {
    onCancel?.(event);
    closeAndRestoreFocus();
  };
  const handleOk = (event: MouseEvent<HTMLButtonElement>) => {
    const result = onOk?.(event);
    if (!isPromise(result)) {
      closeAndRestoreFocus();
      return;
    }
    setLoading(true);
    result.then(
      () => {
        setLoading(false);
        if (!controlled) setInnerVisible(false);
        onVisibleChange?.(false);
        window.setTimeout(() => triggerRef.current?.focus(), 0);
      },
      () => setLoading(false),
    );
  };

  const popup = visible ? createPortal(
    <div
      ref={popupRef}
      id={baseId}
      className="qizhi-popconfirm"
      data-popconfirm-position={coordinates.position}
      role="alertdialog"
      aria-labelledby={title != null ? titleId : undefined}
      aria-describedby={content != null ? contentId : undefined}
      aria-busy={loading || undefined}
      style={{
        left: coordinates.left,
        top: coordinates.top,
        visibility: coordinates.ready ? "visible" : "hidden",
      }}
    >
      <div className={`qizhi-popconfirm__main${icon == null
        ? " qizhi-popconfirm__main--no-icon"
        : ""}`}>
        {icon == null ? null : (
          <span className="qizhi-popconfirm__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className="qizhi-popconfirm__copy">
          {title != null ? (
            <div id={titleId} className="qizhi-popconfirm__title">{title}</div>
          ) : null}
          {content != null ? (
            <div id={contentId} className="qizhi-popconfirm__content">{content}</div>
          ) : null}
        </div>
      </div>
      <div className="qizhi-popconfirm__actions">
        <Button
          {...cancelButtonProps}
          ref={cancelRef}
          type={cancelButtonProps?.type ?? "secondary"}
          size={cancelButtonProps?.size ?? "small"}
          disabled={loading || cancelButtonProps?.disabled}
          onClick={handleCancel}
        >
          {cancelText}
        </Button>
        <Button
          {...okButtonProps}
          type={okButtonProps?.type ?? "primary"}
          size={okButtonProps?.size ?? "small"}
          loading={loading}
          disabled={loading || okButtonProps?.disabled}
          onClick={handleOk}
        >
          {loading ? "处理中" : okText}
        </Button>
      </div>
      <span className="qizhi-popconfirm__arrow" aria-hidden="true" />
    </div>,
    popupContainer,
  ) : null;

  return <>{triggerNode}{popup}</>;
}
