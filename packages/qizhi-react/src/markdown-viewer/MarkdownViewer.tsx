import type { CSSProperties, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodePreview } from "../code-preview/CodePreview";
import type { CodePreviewLanguage } from "../code-preview/CodePreview.types";
import { Empty } from "../empty/Empty";
import { Spin } from "../spin/Spin";
import type { MarkdownViewerProps } from "./MarkdownViewer.types";
import "./markdownViewer.css";

interface MarkdownNode {
  type?: string;
  value?: string;
  children?: MarkdownNode[];
}

const remarkHtmlAsText = () => (tree: MarkdownNode) => {
  const visit = (node: MarkdownNode) => {
    node.children?.forEach((child, index) => {
      if (child.type === "html") {
        node.children![index] = { type: "text", value: child.value ?? "" };
        return;
      }
      visit(child);
    });
  };
  visit(tree);
};

const supportedLanguages = new Set<CodePreviewLanguage>([
  "javascript", "typescript", "jsx", "tsx", "json", "yaml",
  "markdown", "shell", "python", "text",
]);

const languageAliases: Record<string, CodePreviewLanguage> = {
  js: "javascript",
  ts: "typescript",
  bash: "shell",
  sh: "shell",
  md: "markdown",
  py: "python",
};

const toCodeLanguage = (language: string): CodePreviewLanguage => {
  const normalized = language.toLowerCase();
  if (supportedLanguages.has(normalized as CodePreviewLanguage)) {
    return normalized as CodePreviewLanguage;
  }
  return languageAliases[normalized] ?? "text";
};

const toCssSize = (value: number | string | undefined) => {
  if (typeof value === "number") return `${value}px`;
  return value ?? "none";
};

const textFromChildren = (children: ReactNode): string => {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) return children.map(textFromChildren).join("");
  return "";
};

const createSlugger = () => {
  const counts = new Map<string, number>();
  return (text: string) => {
    const base = text.trim().toLowerCase()
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-|-$/g, "") || "section";
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
};

const collectOutline = (value: string) => {
  const slug = createSlugger();
  return value.split("\n").flatMap((line) => {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) return [];
    const title = match[2].replace(/[*_`~]/g, "").trim();
    return [{ level: match[1].length, title, id: slug(title) }];
  });
};

export function MarkdownViewer({
  value,
  loading = false,
  emptyText = "暂无文档",
  openLinksInNewTab = false,
  maxHeight,
  showOutline = false,
  className,
  "aria-label": ariaLabel = "Markdown 阅读器",
}: MarkdownViewerProps) {
  const outline = collectOutline(value);
  const headingSlug = createSlugger();
  const contentStyle = {
    "--qizhi-markdown-viewer-max-height": toCssSize(maxHeight),
  } as CSSProperties;

  return (
    <section className={["qizhi-markdown-viewer", className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      {showOutline && outline.length ? (
        <nav className="qizhi-markdown-viewer__outline" aria-label="Markdown 文档目录">
          {outline.map((item) => (
            <a
              className={`qizhi-markdown-viewer__outline-link qizhi-markdown-viewer__outline-link--level-${item.level}`}
              href={`#${item.id}`}
              key={item.id}
            >
              {item.title}
            </a>
          ))}
        </nav>
      ) : null}
      {loading ? (
        <div className="qizhi-markdown-viewer__state">
          <Spin aria-label="正在加载 Markdown" />
        </div>
      ) : value.length === 0 ? (
        <div className="qizhi-markdown-viewer__state">
          <Empty description={emptyText} />
        </div>
      ) : (
        <div className="qizhi-markdown-viewer__content" style={contentStyle}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkHtmlAsText]}
            skipHtml
            components={{
              h2({ children }) {
                const title = textFromChildren(children);
                return <h2 id={headingSlug(title)}>{children}</h2>;
              },
              h3({ children }) {
                const title = textFromChildren(children);
                return <h3 id={headingSlug(title)}>{children}</h3>;
              },
              code({ className: codeClassName, children }) {
                const language = codeClassName?.replace("language-", "");
                if (!language) return <code>{children}</code>;
                return (
                  <CodePreview
                    aria-label="Markdown 代码块"
                    value={String(children).replace(/\n$/, "")}
                    language={toCodeLanguage(language)}
                  />
                );
              },
              a({ children, ...props }) {
                return (
                  <a
                    {...props}
                    target={openLinksInNewTab ? "_blank" : undefined}
                    rel={openLinksInNewTab ? "noreferrer noopener" : undefined}
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {value}
          </ReactMarkdown>
        </div>
      )}
    </section>
  );
}
