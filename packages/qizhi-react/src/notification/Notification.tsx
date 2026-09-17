import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { CheckCircleIcon } from "../icon/CheckCircleIcon";
import { CloseIcon } from "../icon/CloseIcon";
import { InfoIcon } from "../icon/InfoIcon";
import { NotificationFilledIcon } from "../icon/generated/prompt/NotificationFilledIcon";
import { StatusFailureIcon } from "../icon/generated/prompt/StatusFailureIcon";
import { WarningFilledIcon } from "../icon/generated/prompt/WarningFilledIcon";
import { clearNoticeTimers, getOrCreateNoticeLayer } from "../overlay/noticeLifecycle";
import type {
  NotificationApi,
  NotificationConfig,
  NotificationGlobalConfig,
  NotificationPosition,
  NotificationStaticApi,
  NotificationType,
} from "./Notification.types";
import "./notification.css";

interface NotificationRecord {
  id: string;
  node: HTMLDivElement;
  root: Root;
  config: NotificationConfig;
  timer?: number;
  closeTimer?: number;
  closed: boolean;
}

const defaultIcon = (type: NotificationType) => {
  if (type === "success") return <CheckCircleIcon />;
  if (type === "warning") return <WarningFilledIcon />;
  if (type === "error") return <StatusFailureIcon />;
  if (type === "normal") return <NotificationFilledIcon />;
  return <InfoIcon />;
};

function NotificationView({ type, config, close }: {
  type: NotificationType;
  config: NotificationConfig;
  close: () => void;
}) {
  return <>
    {config.showIcon === false ? null : (
      <span className="qizhi-notification__icon" aria-hidden="true">
        {config.icon ?? defaultIcon(type)}
      </span>
    )}
    <div className="qizhi-notification__body">
      <div className="qizhi-notification__title">{config.title}</div>
      {config.content === undefined ? null : (
        <div className="qizhi-notification__content">{config.content}</div>
      )}
    </div>
    {config.closable ? (
      <button className="qizhi-notification__close" type="button"
        aria-label="关闭通知" onClick={close}>
        {config.closeIcon ?? <CloseIcon />}
      </button>
    ) : null}
    {config.btn ? <div className="qizhi-notification__actions" onClick={close}>
      {config.btn}
    </div> : null}
  </>;
}

class NotificationController {
  private records = new Map<string, NotificationRecord>();
  private layers = new Map<NotificationPosition, HTMLElement>();
  private sequence = 0;
  private holder: HTMLElement | null = null;
  private options: NotificationGlobalConfig;

  constructor(options: NotificationGlobalConfig = {}) { this.options = options; }
  setHolder = (holder: HTMLElement | null) => { this.holder = holder; };
  config = (options: NotificationGlobalConfig) => {
    this.options = { ...this.options, ...options };
  };

  private getLayer(position: NotificationPosition) {
    return getOrCreateNoticeLayer({ holder: this.holder, layers: this.layers,
      position, className: "qizhi-notification-layer", relevant: "all",
      getContainer: () => this.options.getContainer?.() ?? document.body });
  }

  private destroy(record: NotificationRecord, callOnClose: boolean) {
    clearNoticeTimers(record);
    this.records.delete(record.id);
    const parent = record.node.parentElement;
    flushSync(() => record.root.unmount());
    record.node.remove();
    if (callOnClose && !record.closed) record.config.onClose?.();
    record.closed = true;
    if (parent && !parent.children.length && !this.holder) parent.remove();
  }

  private closeRecord = (record: NotificationRecord) => {
    if (record.closed || record.node.classList.contains("is-leaving")) return;
    if (record.timer) window.clearTimeout(record.timer);
    record.node.classList.add("is-leaving");
    record.closeTimer = window.setTimeout(() => this.destroy(record, true), 180);
  };

  show = (type: NotificationType, incoming: NotificationConfig) => {
    const config: NotificationConfig = {
      duration: this.options.duration ?? 4500,
      position: "topRight",
      closable: true,
      showIcon: true,
      ...incoming,
    };
    const id = config.id || `qizhi-notification-${++this.sequence}`;
    let record = this.records.get(id);
    if (!record) {
      const maxCount = this.options.maxCount;
      if (maxCount && maxCount > 0 && this.records.size >= maxCount) {
        const oldest = this.records.values().next().value as NotificationRecord | undefined;
        if (oldest) this.destroy(oldest, true);
      }
      const node = document.createElement("div");
      record = { id, node, root: createRoot(node), config, closed: false };
      this.records.set(id, record);
      this.getLayer(config.position ?? "topRight").prepend(node);
      requestAnimationFrame(() => node.classList.add("is-visible"));
    } else {
      if (record.timer) window.clearTimeout(record.timer);
      record.config = config;
      record.node.classList.remove("is-leaving");
      record.node.classList.add("is-visible");
    }
    const className = Array.isArray(config.className) ? config.className.join(" ") : config.className;
    record.node.className = ["qizhi-notification", `qizhi-notification--${type}`,
      config.closable && "is-closable",
      record.node.classList.contains("is-visible") && "is-visible", className]
      .filter(Boolean).join(" ");
    record.node.setAttribute("role", type === "error" ? "alert" : "status");
    record.node.dataset.notificationId = id;
    Object.assign(record.node.style, config.style);
    const current = record;
    flushSync(() => current.root.render(
      <NotificationView type={type} config={config}
        close={() => this.closeRecord(current)} />,
    ));
    if ((config.duration ?? 0) > 0) {
      record.timer = window.setTimeout(() => this.closeRecord(current), config.duration);
    }
    return () => this.closeRecord(current);
  };

  remove = (id: string) => {
    const record = this.records.get(id);
    if (record) this.destroy(record, true);
  };
  clear = () => [...this.records.values()].forEach((record) => this.destroy(record, true));
  api = (): NotificationApi => ({
    info: (config) => this.show("info", config),
    success: (config) => this.show("success", config),
    warning: (config) => this.show("warning", config),
    error: (config) => this.show("error", config),
    normal: (config) => this.show("normal", config),
    remove: this.remove,
    clear: this.clear,
  });
}

const globalController = new NotificationController({ duration: 4500,
  getContainer: () => document.body });
export const Notification: NotificationStaticApi = {
  ...globalController.api(), config: globalController.config,
};

export function useNotification(): readonly [NotificationApi, ReactNode] {
  const controller = useMemo(() => new NotificationController({ duration: 4500 }), []);
  const api = useMemo(() => controller.api(), [controller]);
  useEffect(() => () => controller.clear(), [controller]);
  const holder = <div className="qizhi-notification-context-layer"
    aria-live="polite" aria-relevant="all"
    ref={controller.setHolder} />;
  return [api, holder] as const;
}
