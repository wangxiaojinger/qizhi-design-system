import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "../button/Button";
import { CloseIcon } from "../icon/CloseIcon";
import type { DrawerProps } from "./Drawer.types";
import "./drawer.css";

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function Drawer({
  open,
  title,
  children,
  footer,
  width = 760,
  closable = true,
  maskClosable = true,
  escToClose = true,
  onClose,
  className,
  style,
}: DrawerProps) {
  const titleId = `qizhi-drawer-title-${useId().replace(/:/g, "")}`;
  const panelRef = useRef<HTMLElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const escToCloseRef = useRef(escToClose);

  onCloseRef.current = onClose;
  escToCloseRef.current = escToClose;

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && escToCloseRef.current) {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)];
      if (!focusable.length) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => previousActiveRef.current?.focus());
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="qizhi-drawer-layer">
      <button
        className="qizhi-drawer-mask"
        type="button"
        aria-label="关闭抽屉遮罩"
        onClick={maskClosable ? onClose : undefined}
      />
      <aside
        ref={panelRef}
        className={["qizhi-drawer", className].filter(Boolean).join(" ")}
        style={{ ...style, width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="qizhi-drawer-header">
          <h2 id={titleId} className="qizhi-drawer-title">{title}</h2>
          {closable ? (
            <Button
              className="qizhi-drawer-close"
              type="text"
              iconOnly
              icon={<CloseIcon />}
              aria-label="关闭抽屉"
              onClick={onClose}
            />
          ) : null}
        </header>
        <div className="qizhi-drawer-body">{children}</div>
        {footer === undefined ? null : <footer className="qizhi-drawer-footer">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  );
}
