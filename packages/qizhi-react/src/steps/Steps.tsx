import { forwardRef } from "react";
import { CheckIcon } from "../icon/CheckIcon";
import { CloseIcon } from "../icon/CloseIcon";
import type { StepsProps } from "./Steps.types";
import "./steps.css";

export const Steps = forwardRef<HTMLOListElement, StepsProps>(
  function Steps(
    {
      items,
      current = 1,
      size = "default",
      status = "process",
      className,
      ...listProps
    },
    ref,
  ) {
    const safeCurrent = Math.min(
      Math.max(1, Math.floor(current)),
      Math.max(1, items.length),
    );

    return (
      <ol
        {...listProps}
        ref={ref}
        className={[
          "qizhi-steps",
          size === "small" && "qizhi-steps--small",
          className,
        ].filter(Boolean).join(" ")}
      >
        {items.map((item, index) => {
          const step = index + 1;
          const isFinished = step < safeCurrent;
          const isCurrent = step === safeCurrent;
          const isError = isCurrent && status === "error";
          const isNextError = step === safeCurrent - 1
            && status === "error";
          const state = isFinished
            ? "finish"
            : isError
              ? "error"
              : isCurrent
                ? "process"
                : "wait";

          return (
            <li
              key={index}
              className={[
                "qizhi-steps__item",
                "qizhi-steps__item--" + state,
                isNextError && "qizhi-steps__item--next-error",
              ].filter(Boolean).join(" ")}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="qizhi-steps__icon" aria-hidden="true">
                {isFinished ? (
                  <CheckIcon />
                ) : isError ? (
                  <CloseIcon />
                ) : step}
              </span>
              <span className="qizhi-steps__content">
                <span className="qizhi-steps__title">{item.title}</span>
                {item.description !== undefined ? (
                  <span className="qizhi-steps__description">
                    {item.description}
                  </span>
                ) : null}
              </span>
              {index < items.length - 1 ? (
                <span
                  className="qizhi-steps__tail"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    );
  },
);
