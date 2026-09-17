import { createElement, forwardRef, useCallback, useLayoutEffect, useRef, useState } from "react";
import type {
  TypographyClassName,
  TypographyCommonProps,
  TypographyEllipsisProps,
  TypographyParagraphProps,
  TypographyProps,
  TypographyTextProps,
  TypographyTitleProps,
} from "./Typography.types";

const joinClassName = (className?: TypographyClassName) =>
  Array.isArray(className) ? className.filter(Boolean).join(" ") : className;

const commonClassNames = (
  kind: "title" | "text" | "paragraph",
  props: TypographyCommonProps,
  extra?: Array<string | false | undefined>,
) => [
  "qizhi-typography",
  `qizhi-typography-${kind}`,
  props.type && `qizhi-typography--${props.type}`,
  props.disabled && "qizhi-typography--disabled",
  ...(extra ?? []),
  joinClassName(props.className),
].filter(Boolean).join(" ");

const decorate = (children: React.ReactNode, props: TypographyCommonProps) => {
  let content = children;
  if (props.code) content = <code>{content}</code>;
  if (props.delete) content = <del>{content}</del>;
  if (props.underline) content = <u>{content}</u>;
  if (props.mark) content = <mark>{content}</mark>;
  if (props.bold) content = <strong>{content}</strong>;
  return content;
};

const stripCommonProps = ({
  type: _type,
  bold: _bold,
  disabled: _disabled,
  mark: _mark,
  underline: _underline,
  delete: _delete,
  code: _code,
  className: _className,
  children: _children,
  ...nativeProps
}: TypographyCommonProps) => nativeProps;

const TypographyRoot = forwardRef<HTMLDivElement, TypographyProps>(function Typography(
  { className, children, ...props },
  ref,
) {
  return <div {...props} ref={ref} className={["qizhi-typography", joinClassName(className)].filter(Boolean).join(" ")}>{children}</div>;
});

const Title = forwardRef<HTMLHeadingElement, TypographyTitleProps>(function TypographyTitle(
  { heading = 1, children, ...props },
  ref,
) {
  return createElement(
    `h${heading}`,
    { ...stripCommonProps(props), ref, className: commonClassNames("title", props, [`qizhi-typography-title-h${heading}`]) },
    decorate(children, props),
  );
});

const Text = forwardRef<HTMLSpanElement, TypographyTextProps>(function TypographyText(
  { children, ...props },
  ref,
) {
  return <span {...stripCommonProps(props)} ref={ref} className={commonClassNames("text", props)}>{decorate(children, props)}</span>;
});

const Paragraph = forwardRef<HTMLElement, TypographyParagraphProps>(function TypographyParagraph(
  { spacing = "default", blockquote = false, cite, children, ...props },
  ref,
) {
  return createElement(
    blockquote ? "blockquote" : "p",
    {
      ...stripCommonProps(props),
      ...(blockquote && cite ? { cite } : {}),
      ref,
      className: commonClassNames("paragraph", props, [
        `qizhi-typography-paragraph-spacing-${spacing}`,
        blockquote && "qizhi-typography-blockquote",
      ]),
    },
    decorate(children, props),
  );
});

const Ellipsis = forwardRef<HTMLDivElement, TypographyEllipsisProps>(function TypographyEllipsis(
  {
    children,
    className,
    rows = 1,
    disabled = false,
    expandable = true,
    defaultExpanded = false,
    expanded,
    onEllipsis,
    onExpand,
    ...props
  },
  ref,
) {
  const contentRef = useRef<HTMLSpanElement>(null);
  const previousEllipsisRef = useRef<boolean | undefined>(undefined);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [isEllipsis, setIsEllipsis] = useState(false);
  const safeRows = Number.isFinite(rows) ? Math.max(1, Math.floor(rows)) : 1;
  const isExpanded = disabled || (expanded ?? internalExpanded);

  const measure = useCallback(() => {
    const content = contentRef.current;
    if (!content) return;

    const lineHeight = Number.parseFloat(window.getComputedStyle(content).lineHeight);
    const nextEllipsis = !disabled && Number.isFinite(lineHeight) && content.scrollHeight > lineHeight * safeRows + 1;
    setIsEllipsis(nextEllipsis);

    if (previousEllipsisRef.current !== nextEllipsis) {
      previousEllipsisRef.current = nextEllipsis;
      onEllipsis?.(nextEllipsis);
    }
  }, [children, disabled, onEllipsis, safeRows]);

  useLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === "undefined" || !contentRef.current) return undefined;

    const observer = new ResizeObserver(measure);
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div
      {...props}
      ref={ref}
      className={["qizhi-typography", "qizhi-typography-ellipsis", joinClassName(className)].filter(Boolean).join(" ")}
    >
      <span
        ref={contentRef}
        className={[
          "qizhi-typography-ellipsis__content",
          isExpanded && "qizhi-typography-ellipsis__content--expanded",
        ].filter(Boolean).join(" ")}
        style={{ "--qizhi-typography-ellipsis-rows": safeRows } as React.CSSProperties}
      >
        {children}
      </span>
      {isEllipsis && expandable && !disabled ? (
        <button
          type="button"
          className="qizhi-typography-ellipsis__action"
          aria-expanded={isExpanded}
          onClick={(event) => {
            const nextExpanded = !isExpanded;
            if (expanded === undefined) setInternalExpanded(nextExpanded);
            onExpand?.(nextExpanded, event);
          }}
        >
          {isExpanded ? "收起" : "展开"}
        </button>
      ) : null}
    </div>
  );
});

Title.displayName = "Typography.Title";
Text.displayName = "Typography.Text";
Paragraph.displayName = "Typography.Paragraph";
Ellipsis.displayName = "Typography.Ellipsis";

export const Typography = Object.assign(TypographyRoot, { Title, Text, Paragraph, Ellipsis });
