import { forwardRef } from "react";
import emptyImageUrl from "./qizhi-empty.svg";
import type { EmptyProps } from "./Empty.types";
import "./empty.css";

export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { description = "暂无数据", className, role = "status", ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref} role={role} className={["qizhi-empty", className].filter(Boolean).join(" ")}>
      <img className="qizhi-empty__image" src={emptyImageUrl} width="64" height="40" alt="" aria-hidden="true" />
      {description != null ? <div className="qizhi-empty__description">{description}</div> : null}
    </div>
  );
});
