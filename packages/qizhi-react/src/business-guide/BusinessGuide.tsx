import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../button/Button";
import { CloseIcon } from "../icon/CloseIcon";
import { Link } from "../link/Link";
import { useLocale } from "../locale/LocaleProvider";
import type { BusinessGuideProps } from "./BusinessGuide.types";
import "./businessGuide.css";

export function BusinessGuide({
  title,
  highlight,
  subtitle,
  steps,
  closedText,
  onClose,
  onRestore,
  className,
  ...rest
}: BusinessGuideProps) {
  const { t } = useLocale();
  const [visible, setVisible] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLButtonElement>(null);
  const initialized = useRef(false);
  const titleId = `qizhi-business-guide-${useId()}`;

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    (visible ? closeRef : restoreRef).current?.focus();
  }, [visible]);

  if (!visible) {
    return (
      <div className="qizhi-business-guide__closed" role="status">
        <span>{closedText ?? t("businessGuide.closed")}</span>
        <Button
          ref={restoreRef}
          type="secondary"
          onClick={() => {
            setVisible(true);
            onRestore?.();
          }}
        >
          {t("common.restore")}
        </Button>
      </div>
    );
  }

  return (
    <section
      {...rest}
      className={["qizhi-business-guide", className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      <header className="qizhi-business-guide__header">
        <div className="qizhi-business-guide__heading">
          <h2 id={titleId}>{title} <strong>{highlight}</strong></h2>
          <p>{subtitle}</p>
        </div>
        <Button
          ref={closeRef}
          type="text"
          icon={<CloseIcon />}
          iconPosition="after"
          aria-label={t("businessGuide.closeAriaLabel")}
          className="qizhi-business-guide__close"
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
        >
          {t("common.close")}
        </Button>
      </header>
      <ol className="qizhi-business-guide__steps">
        {steps.map((item, index) => (
          <li key={index} className="qizhi-business-guide__card">
            <div className="qizhi-business-guide__card-head">
              <img src={item.image} alt="" aria-hidden="true" />
              <div><span>{item.step}</span><h3>{item.title}</h3></div>
            </div>
            <ul className="qizhi-business-guide__actions">
              {item.actions.map((action, actionIndex) => (
                <li
                  key={actionIndex}
                  className={action.disabled
                    ? "qizhi-business-guide__disabled"
                    : undefined}
                  aria-disabled={action.disabled || undefined}
                >
                  {action.href && !action.disabled
                    ? <Link href={action.href}>{action.content}</Link>
                    : action.content}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
