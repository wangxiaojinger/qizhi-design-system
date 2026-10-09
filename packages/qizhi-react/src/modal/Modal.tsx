import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import { Button } from "../button/Button";
import { CloseIcon } from "../icon/CloseIcon";
import { WarningFilledIcon } from "../icon/generated/prompt/WarningFilledIcon";
import { FOCUSABLE_SELECTOR, getTabbableElements } from "../overlay/focus";
import type {
  ModalComponent,
  ModalConfirmConfig,
  ModalConfirmHandle,
  ModalHookApi,
  ModalProps,
} from "./Modal.types";
import "./modal.css";

let openModalCount = 0;
let previousBodyOverflow = "";
const modalStack: symbol[] = [];
type ModalViewProps = ModalProps & {
  variant?: "default" | "confirm";
  confirmIcon?: ModalConfirmConfig["icon"];
  onDialogMount?: () => void;
};

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
  destroyOnHidden = false,
  afterClose,
  getContainer,
  closable = true,
  maskClosable = true,
  escToExit = true,
  hideCancel = false,
  className,
  bodyClassName,
  style,
  variant = "default",
  confirmIcon,
  onDialogMount,
}: ModalViewProps) {
  const titleId = `qizhi-modal-title-${useId().replace(/:/g, "")}`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const hasOpenedRef = useRef(open);
  const modalTokenRef = useRef(Symbol("qizhi-modal"));
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const onCancelRef = useRef(onCancel);
  const escToExitRef = useRef(escToExit);
  const afterCloseRef = useRef(afterClose);
  const destroyOnHiddenRef = useRef(destroyOnHidden);
  const previousOpenRef = useRef(open);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closePendingRef = useRef(false);
  const [promiseLoading, setPromiseLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [rendered, setRendered] = useState(open);
  const loading = confirmLoading || promiseLoading;
  const isConfirm = variant === "confirm";
  if (open) hasOpenedRef.current = true;
  onCancelRef.current = onCancel;
  escToExitRef.current = escToExit;
  afterCloseRef.current = afterClose;
  destroyOnHiddenRef.current = destroyOnHidden;

  const finishClose = useCallback(() => {
    if (!closePendingRef.current) return;
    closePendingRef.current = false;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
    setLeaving(false);
    if (destroyOnHiddenRef.current) setRendered(false);
    afterCloseRef.current?.();
  }, []);

  useEffect(() => {
    const wasOpen = previousOpenRef.current;
    previousOpenRef.current = open;
    if (open) {
      closePendingRef.current = false;
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
      setRendered(true);
      setLeaving(false);
      return;
    }
    if (!hasOpenedRef.current || !rendered) return;
    if (!wasOpen) {
      if (destroyOnHidden && !closePendingRef.current) setRendered(false);
      return;
    }
    closePendingRef.current = true;
    setLeaving(true);
    closeTimerRef.current = setTimeout(finishClose, 240);
  }, [destroyOnHidden, finishClose, open, rendered]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!leaving || !dialog) return;
    const handleAnimationEnd = (event: AnimationEvent) => {
      if (event.target === dialog) finishClose();
    };
    dialog.addEventListener("animationend", handleAnimationEnd);
    return () => dialog.removeEventListener("animationend", handleAnimationEnd);
  }, [finishClose, leaving]);

  useEffect(() => {
    if (!open) return;
    const modalToken = modalTokenRef.current;
    modalStack.push(modalToken);
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    if (openModalCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openModalCount += 1;
    const frame = requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      const target = dialog?.querySelector<HTMLElement>(".qizhi-modal__ok:not([disabled])")
        ?? (dialog ? getTabbableElements(dialog)[0] : undefined)
        ?? dialog;
      target?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (modalStack.at(-1) !== modalToken) return;
      const dialog = dialogRef.current;
      if (event.key === "Escape" && escToExitRef.current) {
        if (event.defaultPrevented) return;
        const expandedOverlayTrigger = dialog?.querySelector<HTMLElement>(
          '[aria-expanded="true"][aria-controls]',
        );
        const controlledId = expandedOverlayTrigger?.getAttribute("aria-controls");
        if (controlledId && document.getElementById(controlledId)) return;
        event.preventDefault();
        onCancelRef.current?.();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const ownedPopupIds = [...dialog.querySelectorAll<HTMLElement>("[aria-controls]")]
        .flatMap((trigger) => trigger.getAttribute("aria-controls")?.split(/\s+/) ?? []);
      const focusable = [
        ...getTabbableElements(dialog),
        ...ownedPopupIds.flatMap((id) => {
          const popup = document.getElementById(id);
          return popup ? getTabbableElements(popup) : [];
        }),
      ];
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      const wasTopmost = modalStack.at(-1) === modalToken;
      const stackIndex = modalStack.lastIndexOf(modalToken);
      if (stackIndex >= 0) modalStack.splice(stackIndex, 1);
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) document.body.style.overflow = previousBodyOverflow;
      if (wasTopmost) requestAnimationFrame(() => previousActiveRef.current?.focus());
    };
  }, [open]);

  if ((!open && (!rendered || !hasOpenedRef.current)) || typeof document === "undefined") {
    return null;
  }

  const portalContainer = typeof getContainer === "function"
    ? getContainer()
    : typeof getContainer === "string"
      ? document.querySelector<HTMLElement>(getContainer) ?? document.body
      : getContainer || document.body;

  const submit = () => {
    if (loading) return;
    const result = onOk?.();
    if (!result || typeof result.then !== "function") return;
    setPromiseLoading(true);
    void result.then(
      () => setPromiseLoading(false),
      () => setPromiseLoading(false),
    );
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

  const modalNode = (
    <div
      hidden={!open && !leaving}
      aria-hidden={!open || undefined}
      className={["qizhi-modal__mask", leaving && "is-leaving"].filter(Boolean).join(" ")}
      role="presentation"
      onMouseDown={() => { if (maskClosable && open) onCancel?.(); }}
    >
      <div
        ref={(node) => {
          dialogRef.current = node;
          if (node) onDialogMount?.();
        }}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          "qizhi-modal",
          isConfirm && "qizhi-modal--confirm",
          isConfirm && closable && "qizhi-modal--confirm-closable",
          className,
        ].filter(Boolean).join(" ")}
        style={{ ...style, width }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {!isConfirm ? (
          <header className="qizhi-modal__header">
            <h3 id={titleId} className="qizhi-modal__title">{title}</h3>
            {closable ? (
              <Button className="qizhi-modal__close" type="text" icon={<CloseIcon />} iconOnly aria-label="关闭对话框" onClick={onCancel} />
            ) : null}
          </header>
        ) : null}
        {isConfirm && closable ? (
          <Button className="qizhi-modal__close qizhi-modal__confirm-close" type="text" icon={<CloseIcon />} iconOnly aria-label="关闭对话框" onClick={onCancel} />
        ) : null}
        {isConfirm ? (
          <div className={["qizhi-modal__body", bodyClassName].filter(Boolean).join(" ")}>
            <div className={["qizhi-modal__confirm", confirmIcon === null && "is-iconless"].filter(Boolean).join(" ")}>
              {confirmIcon !== null ? (
                <span className="qizhi-modal__confirm-icon" aria-hidden="true">
                  {confirmIcon ?? <WarningFilledIcon />}
                </span>
              ) : null}
              <div className="qizhi-modal__confirm-main">
                <h3 id={titleId} className="qizhi-modal__confirm-title">{title}</h3>
                {children !== null && children !== undefined ? <div className="qizhi-modal__confirm-content">{children}</div> : null}
              </div>
            </div>
          </div>
        ) : children !== null && children !== undefined ? (
          <div className={["qizhi-modal__body", bodyClassName].filter(Boolean).join(" ")}>{children}</div>
        ) : null}
        {footer !== null ? (
          <footer className="qizhi-modal__footer">{footer === undefined ? defaultFooter : footer}</footer>
        ) : null}
      </div>
    </div>
  );
  return getContainer === false ? modalNode : createPortal(modalNode, portalContainer);
}

function confirm(initial: ModalConfirmConfig) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  let config = initial;
  let closed = false;
  let open = true;
  let mounted = false;
  const finalizeClose = () => {
    if (closed) return;
    closed = true;
    root.unmount();
    host.remove();
  };
  const close = () => {
    if (closed || !open) return;
    open = false;
    if (!mounted) {
      try {
        config.afterClose?.();
      } finally {
        finalizeClose();
      }
      return;
    }
    render();
  };
  const render = () => {
    root.render(
      <ModalView
        open={open}
        variant="confirm"
        title={config.title}
        confirmIcon={config.icon}
        footer={config.footer}
        width={config.width ?? 416}
        okText={config.okText}
        cancelText={config.cancelText}
        okButtonProps={config.okButtonProps}
        cancelButtonProps={config.cancelButtonProps}
        closable={config.closable ?? false}
        maskClosable={config.maskClosable ?? false}
        escToExit={config.escToExit}
        hideCancel={config.hideCancel}
        getContainer={config.getContainer}
        onDialogMount={() => { mounted = true; }}
        afterClose={() => {
          try {
            config.afterClose?.();
          } finally {
            finalizeClose();
          }
        }}
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

type HookModalEntry = {
  key: number;
  config: ModalConfirmConfig;
  open: boolean;
};

function useModal(): readonly [ModalHookApi, ReactNode] {
  const [entries, setEntries] = useState<HookModalEntry[]>([]);
  const nextKeyRef = useRef(0);
  const apiRef = useRef<ModalHookApi | null>(null);
  const mountedKeysRef = useRef(new Set<number>());
  const configsRef = useRef(new Map<number, ModalConfirmConfig>());

  if (!apiRef.current) {
    apiRef.current = {
      confirm(initial) {
        const key = nextKeyRef.current++;
        configsRef.current.set(key, initial);
        setEntries((current) => [...current, { key, config: initial, open: true }]);
        const close = () => {
          if (!mountedKeysRef.current.has(key)) {
            const currentConfig = configsRef.current.get(key);
            try {
              currentConfig?.afterClose?.();
            } finally {
              configsRef.current.delete(key);
              setEntries((current) => current.filter((entry) => entry.key !== key));
            }
            return;
          }
          setEntries((current) => current.map((entry) => (
            entry.key === key ? { ...entry, open: false } : entry
          )));
        };
        const handle: ModalConfirmHandle = {
          update(next) {
            const currentConfig = configsRef.current.get(key);
            if (currentConfig) configsRef.current.set(key, { ...currentConfig, ...next });
            setEntries((current) => current.map((entry) => (
              entry.key === key
                ? { ...entry, config: { ...entry.config, ...next } }
                : entry
            )));
          },
          close,
        };
        return handle;
      },
    };
  }

  const holder = entries.map((entry) => {
    const { config } = entry;
    const close = () => {
      setEntries((current) => current.map((item) => (
        item.key === entry.key ? { ...item, open: false } : item
      )));
    };
    return (
      <ModalView
        key={entry.key}
        open={entry.open}
        variant="confirm"
        title={config.title}
        confirmIcon={config.icon}
        footer={config.footer}
        width={config.width ?? 416}
        okText={config.okText}
        cancelText={config.cancelText}
        okButtonProps={config.okButtonProps}
        cancelButtonProps={config.cancelButtonProps}
        closable={config.closable ?? false}
        maskClosable={config.maskClosable ?? false}
        escToExit={config.escToExit}
        hideCancel={config.hideCancel}
        getContainer={config.getContainer}
        onDialogMount={() => { mountedKeysRef.current.add(entry.key); }}
        afterClose={() => {
          try {
            config.afterClose?.();
          } finally {
            mountedKeysRef.current.delete(entry.key);
            configsRef.current.delete(entry.key);
            setEntries((current) => current.filter((item) => item.key !== entry.key));
          }
        }}
        onCancel={() => { config.onCancel?.(); close(); }}
        onOk={async () => { await config.onOk?.(); close(); }}
      >
        {config.content}
      </ModalView>
    );
  });

  return [apiRef.current, holder] as const;
}

export const Modal = Object.assign(ModalView, { confirm, useModal }) as ModalComponent;
