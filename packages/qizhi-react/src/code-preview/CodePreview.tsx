import { useEffect, useState } from "react";
import { Highlight } from "prism-react-renderer";
import type { Language } from "prism-react-renderer";
import { Button } from "../button/Button";
import { Empty } from "../empty/Empty";
import { CopyIcon } from "../icon/CopyIcon";
import { Spin } from "../spin/Spin";
import { TextViewport } from "../content-viewer/TextViewport";
import type {
  CodePreviewLanguage,
  CodePreviewProps,
} from "./CodePreview.types";
import "./codePreview.css";

const prismLanguages: Partial<Record<CodePreviewLanguage, Language>> = {
  javascript: "javascript",
  typescript: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  json: "json",
  yaml: "yaml",
  markdown: "markdown",
  shell: "bash",
  python: "python",
};

const plainLines = (value: string) => value.split("\n");

export function CodePreview({
  value,
  language = "text",
  showLineNumbers = true,
  wrap = false,
  copyable = true,
  downloadable = false,
  fileName = "code.txt",
  maxHeight,
  loading = false,
  emptyText = "暂无代码",
  className,
  "aria-label": ariaLabel = "代码预览",
}: CodePreviewProps) {
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    if (!copyStatus) return;
    const timer = window.setTimeout(() => setCopyStatus(""), 1600);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus("已复制");
    } catch {
      setCopyStatus("复制失败");
    }
  };

  const renderLines = (lines: Array<{ content: string; types: string[] }[]>) => (
    <code className="qizhi-code-preview__code">
      {lines.map((line, lineIndex) => (
        <span className="qizhi-code-preview__line" key={lineIndex}>
          {showLineNumbers ? (
            <span className="qizhi-code-preview__line-number" data-testid="code-line-number" aria-hidden="true">
              {lineIndex + 1}
            </span>
          ) : null}
          <span className="qizhi-code-preview__line-content">
            {line.length ? line.map((token, tokenIndex) => (
              <span className={["token", ...token.types].join(" ")} key={tokenIndex}>
                {token.content}
              </span>
            )) : "\n"}
          </span>
        </span>
      ))}
    </code>
  );

  const renderPlain = () => renderLines(
    plainLines(value).map((content) => [{ content, types: ["plain"] }]),
  );

  return (
    <section className={["qizhi-code-preview", className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      {copyable || downloadable ? (
        <div className="qizhi-code-preview__toolbar">
          <span className="qizhi-code-preview__status" role="status">{copyStatus}</span>
          {copyable ? (
            <Button type="text" size="small" icon={<CopyIcon />} onClick={copy}>
              复制代码
            </Button>
          ) : null}
          {downloadable ? (
            <Button
              type="text"
              size="small"
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(value)}`}
              download={fileName}
            >
              下载代码
            </Button>
          ) : null}
        </div>
      ) : null}
      {loading ? (
        <div className="qizhi-code-preview__state">
          <Spin aria-label="正在加载代码" />
        </div>
      ) : value.length === 0 ? (
        <div className="qizhi-code-preview__state">
          <Empty description={emptyText} />
        </div>
      ) : (
        <TextViewport
          className="qizhi-code-preview__viewport"
          maxHeight={maxHeight}
          wrap={wrap}
          aria-label={`${ariaLabel}内容`}
        >
          {prismLanguages[language] ? (
            <Highlight code={value} language={prismLanguages[language] as Language}>
              {({ tokens }) => renderLines(tokens)}
            </Highlight>
          ) : renderPlain()}
        </TextViewport>
      )}
    </section>
  );
}
