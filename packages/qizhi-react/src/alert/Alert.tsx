import { useState } from "react";
import { CloseIcon } from "../icon/CloseIcon";
import {
  CheckboxCircleFilledIcon,
  CloseCircleFilledIcon,
  ErrorWarningFilledIcon,
  InformationFilledIcon,
} from "../icon/AlertStatusIcons";
import type { AlertProps, AlertType } from "./Alert.types";
import "./alert.css";

const defaultIcon = (type: AlertType) => {
  if (type === "success") return <CheckboxCircleFilledIcon />;
  if (type === "error") return <CloseCircleFilledIcon />;
  if (type === "warning" || type === "neutral") return <ErrorWarningFilledIcon />;
  return <InformationFilledIcon />;
};

export function Alert({
  content,
  title,
  type = "info",
  size = "default",
  inline = false,
  banner = false,
  closable = false,
  showIcon = true,
  icon,
  closeElement,
  onClose,
  className,
  role = "alert",
  ...nativeProps
}: AlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const close = () => {
    setVisible(false);
    onClose?.();
  };
  const customClose = typeof closeElement === "function"
    ? closeElement(close)
    : closeElement;
  const rootClassName = [
    "qizhi-alert",
    `qizhi-alert--${type}`,
    `qizhi-alert--${size}`,
    title !== undefined && "qizhi-alert--with-title",
    inline && "qizhi-alert--inline",
    banner && "qizhi-alert--banner",
    className,
  ].filter(Boolean).join(" ");

  return <div {...nativeProps} className={rootClassName} role={role}>
    {showIcon ? <span className="qizhi-alert__icon" aria-hidden="true">
      {icon ?? defaultIcon(type)}
    </span> : null}
    <div className="qizhi-alert__body">
      {title === undefined ? null : <div className="qizhi-alert__title">{title}</div>}
      <div className="qizhi-alert__content">{content}</div>
    </div>
    {customClose ?? (closable ? (
      <button className="qizhi-alert__close" type="button"
        aria-label="关闭提示" onClick={close}>
        <CloseIcon />
      </button>
    ) : null)}
  </div>;
}
