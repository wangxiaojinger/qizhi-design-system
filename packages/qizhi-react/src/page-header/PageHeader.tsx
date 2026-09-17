import { forwardRef } from "react";
import type { PageHeaderProps } from "./PageHeader.types";
import "./pageHeader.css";

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    { children, className, ...headerProps },
    ref,
  ) {
    return (
      <header
        {...headerProps}
        ref={ref}
        className={[
          "qizhi-page-header",
          className,
        ].filter(Boolean).join(" ")}
      >
        <p className="qizhi-page-header__greeting">{children}</p>
      </header>
    );
  },
);
