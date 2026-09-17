import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { Button } from "../button/Button";
import { CloseIcon } from "../icon/CloseIcon";
import type { ModalComponent, ModalConfirmConfig, ModalProps } from "./Modal.types";
import "./modal.css";

let openModalCount = 0;
let previousBodyOverflow = "";

function ModalView({
  open,
  title,
  children,
  onCancel,
  onOk,
  cancelText = "取消",
  okText = "确定",
  width = 520,
  footer,
  cancelButtonProps,
  okButtonProps,
  confirmLoading = false,
  closable = true,
  maskClosable = true,
  escToExit = true,
  hideCancel = false,
  className,
  bodyClassName,
  style,
}: ModalProps) {
  const titleId = `qizhi-modal-title-${useId().replace(/:/g, "")}`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const onCancelRef = useRef(onCancel);
  const escToExitRef = useRef(escToExit);
  const [promiseLoading, setPromiseLoading] = useState(false);
  const loading = confirmLoading || promiseLoading;
  onCancelRef.current = onCancel;
  escToExitRef.current = escToExit;

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    if (openModalCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openModalCount += 1;
    const frame = requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      const target = dialog?.querySelector<HTMLElement>(".qizhi-modal__ok")
        ?? dialog?.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      target?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && escToExitRef.current) {
        event.preventDefault();
        onCancelRef.current?.();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )];
      if (!focusable.length) return;
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
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) document.body.style.overflow = previousBodyOverflow;
      requestAnimationFrame(() => previousActiveRef.current?.focus());
    };
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (loading) return;
    const result = onOk?.();
    if (!result || typeof result.then !== "function") return;
    setPromiseLoading(true);
    void result.finally(() => setPromiseLoading(false));
  };
  const defaultFooter = (
    <>
      {!hideCancel ? <Button {...cancelButtonProps} onClick={onCancel}>{cancelText}</Button> : null}
      <Button
        {...okButtonProps}
        className={["qizhi-modal__ok", typeof okButtonProps?.className === "string" ? okButtonProps.className : ""].filter(Boolean).join(" ")}
        type={okButtonProps?.type ?? "primary"}
        loading={loading}
        disabled={loading || okButtonProps?.disabled}
        onClick={submit}
      >
        {okText}
      </Button>
    </>
  );

  return createPortal(
    <div className="qizhi-modal__mask" role="presentation" onMouseDown={() => { if (maskClosable) onCancel?.(); }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={["qizhi-modal", className].filter(Boolean).join(" ")}
        style={{ ...style, width }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="qizhi-modal__header">
          <h3 id={titleId} className="qizhi-modal__title">{title}</h3>
          {closable ? (
            <Button className="qizhi-modal__close" type="text" icon={<CloseIcon />} iconOnly aria-label="关闭对话框" onClick={onCancel} />
          ) : null}
        </header>
        {children ? <div className={["qizhi-modal__body", bodyClassName].filter(Boolean).join(" ")}>{children}</div> : null}
        {footer !== null ? (
          <footer className="qizhi-modal__footer">{footer === undefined ? defaultFooter : footer}</footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

function confirm(initial: ModalConfirmConfig) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  let config = initial;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    root.unmount();
    host.remove();
  };
  const render = () => {
    root.render(
      <ModalView
        open
        title={config.title}
        footer={config.footer}
        width={config.width}
        okText={config.okText}
        cancelText={config.cancelText}
        okButtonProps={config.okButtonProps}
        cancelButtonProps={config.cancelButtonProps}
        closable={config.closable}
        maskClosable={config.maskClosable}
        escToExit={config.escToExit}
        hideCancel={config.hideCancel}
        onCancel={() => { config.onCancel?.(); close(); }}
        onOk={async () => { await config.onOk?.(); close(); }}
      >
        {config.content}
      </ModalView>,
    );
  };
  render();
  return {
    update(next: Partial<ModalConfirmConfig>) {
      if (closed) return;
      config = { ...config, ...next };
      render();
    },
    close,
  };
}

export const Modal = Object.assign(ModalView, { confirm }) as ModalComponent;
