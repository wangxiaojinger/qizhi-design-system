import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { CheckCircleIcon } from "../icon/CheckCircleIcon";
import { CloseIcon } from "../icon/CloseIcon";
import { InfoIcon } from "../icon/InfoIcon";
import { LoadingIcon } from "../icon/LoadingIcon";
import { WarningFilledIcon } from "../icon/generated/prompt/WarningFilledIcon";
import { clearNoticeTimers, getOrCreateNoticeLayer } from "../overlay/noticeLifecycle";
import type {
  MessageApi,
  MessageConfig,
  MessageGlobalConfig,
  MessageInput,
  MessagePosition,
  MessageStaticApi,
  MessageType,
} from "./Message.types";
import "./message.css";

interface MessageRecord {
  key: string;
  node: HTMLDivElement;
  root: Root;
  config: MessageConfig;
  timer?: number;
  closeTimer?: number;
  closed: boolean;
}

const defaultIcon = (type: MessageType) => {
  if (type === "success") return <CheckCircleIcon />;
  if (type === "warning" || type === "error") return <WarningFilledIcon />;
  if (type === "loading") return <LoadingIcon />;
  return <InfoIcon />;
};

function MessageView({ type, config, close }: {
  type: MessageType;
  config: MessageConfig;
  close: () => void;
}) {
  return <>
    {config.showIcon === false ? null : (
      <span className="qizhi-message__icon" aria-hidden="true">
        {config.icon ?? defaultIcon(type)}
      </span>
    )}
    <span className="qizhi-message__content">{config.content}</span>
    {config.closable ? (
      <button className="qizhi-message__close" type="button" aria-label="关闭全局提示" onClick={close}>
        {config.closeIcon ?? <CloseIcon />}
      </button>
    ) : null}
  </>;
}

const normalize = (input: MessageInput): MessageConfig => (
  typeof input === "object" && input !== null && "content" in input
    ? input as MessageConfig
    : { content: input as ReactNode }
);

class MessageController {
  private records = new Map<string, MessageRecord>();
  private sequence = 0;
  private options: MessageGlobalConfig;
  private holder: HTMLElement | null = null;
  private layers = new Map<MessagePosition, HTMLElement>();

  constructor(options: MessageGlobalConfig = {}) {
    this.options = options;
  }

  setHolder = (holder: HTMLElement | null) => {
    this.holder = holder;
  };

  config = (options: MessageGlobalConfig) => {
    this.options = { ...this.options, ...options };
  };

  private getLayer(position: MessagePosition) {
    return getOrCreateNoticeLayer({ holder: this.holder, layers: this.layers,
      position, className: "qizhi-message-layer",
      getContainer: () => this.options.getContainer?.() ?? document.body });
  }

  private destroy(record: MessageRecord, callOnClose: boolean) {
    clearNoticeTimers(record);
    this.records.delete(record.key);
    flushSync(() => record.root.unmount());
    record.node.remove();
    if (callOnClose && !record.closed) record.config.onClose?.();
    record.closed = true;
  }

  private closeRecord = (record: MessageRecord) => {
    if (record.closed || record.node.classList.contains("is-leaving")) return;
    if (record.timer) window.clearTimeout(record.timer);
    record.node.classList.add("is-leaving");
    record.closeTimer = window.setTimeout(() => this.destroy(record, true), 180);
  };

  show = (type: MessageType, input: MessageInput) => {
    const incoming = normalize(input);
    const config: MessageConfig = {
      closable: false,
      showIcon: true,
      duration: this.options.duration ?? 3000,
      position: "top",
      ...incoming,
    };
    const key = config.id || `qizhi-message-${++this.sequence}`;
    let record = this.records.get(key);

    if (!record) {
      const maxCount = this.options.maxCount;
      if (maxCount && maxCount > 0 && this.records.size >= maxCount) {
        const oldest = this.records.values().next().value as MessageRecord | undefined;
        if (oldest) this.destroy(oldest, true);
      }
      const node = document.createElement("div");
      const root = createRoot(node);
      record = { key, node, root, config, closed: false };
      this.records.set(key, record);
      this.getLayer(config.position ?? "top").append(node);
      requestAnimationFrame(() => node.classList.add("is-visible"));
    } else {
      if (record.timer) window.clearTimeout(record.timer);
      record.config = config;
      record.node.classList.remove("is-leaving");
      record.node.classList.add("is-visible");
    }

    const className = Array.isArray(config.className) ? config.className.join(" ") : config.className;
    record.node.className = [
      "qizhi-message",
      `qizhi-message--${type}`,
      record.node.classList.contains("is-visible") && "is-visible",
      className,
    ].filter(Boolean).join(" ");
    record.node.setAttribute("role", type === "error" ? "alert" : "status");
    Object.assign(record.node.style, config.style);
    const current = record;
    flushSync(() => current.root.render(
      <MessageView type={type} config={config} close={() => this.closeRecord(current)} />,
    ));
    if ((config.duration ?? 0) > 0) {
      record.timer = window.setTimeout(() => this.closeRecord(current), config.duration);
    }
    return () => this.closeRecord(current);
  };

  clear = () => {
    [...this.records.values()].forEach((record) => this.closeRecord(record));
  };

  api = (): MessageApi => ({
    info: (input) => this.show("info", input),
    success: (input) => this.show("success", input),
    warning: (input) => this.show("warning", input),
    error: (input) => this.show("error", input),
    normal: (input) => this.show("normal", input),
    loading: (input) => this.show("loading", input),
    clear: this.clear,
  });
}

const globalController = new MessageController({ duration: 3000, getContainer: () => document.body });
export const Message: MessageStaticApi = {
  ...globalController.api(),
  config: globalController.config,
};

export function useMessage(): readonly [MessageApi, ReactNode] {
  const controller = useMemo(() => new MessageController({ duration: 3000 }), []);
  const api = useMemo(() => controller.api(), [controller]);
  useEffect(() => () => controller.clear(), [controller]);
  const holder = <div
    className="qizhi-message-context-layer"
    aria-live="polite"
    aria-relevant="additions text"
    ref={controller.setHolder}
  />;
  return [api, holder] as const;
}
