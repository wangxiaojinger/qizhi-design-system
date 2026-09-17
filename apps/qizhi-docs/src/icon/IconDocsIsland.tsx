import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Input, SearchIcon } from "@wangxiaojinger/qizhi-react";
import {
  CheckCircleIcon,
  findIcons,
  MultiplyIcon,
  type IconStyle,
} from "@wangxiaojinger/qizhi-react/icon";
import {
  getIconUsageCode,
  iconDocsRegistry,
  type IconDocsItem,
} from "./iconDocs.registry";
import { IconApiTable } from "./IconApiTable";
import "./iconDocs.css";

type StyleFilter = "all" | IconStyle;
type CopyToast = {
  status: "copying" | "success" | "error";
  jsxCode: string;
};

const styleFilters: readonly { value: StyleFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "outline", label: "线性图标" },
  { value: "fill", label: "面性图标" },
  { value: "color", label: "多色图标" },
];

const copyWithSelection = (text: string) => {
  if (typeof document.execCommand !== "function") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.readOnly = true;
  textarea.dataset.qizhiCopyFallback = "";
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  const activeElement = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  document.body.append(textarea);
  textarea.focus({ preventScroll: true });
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  const copied = document.execCommand("copy");
  textarea.remove();
  activeElement?.focus({ preventScroll: true });
  return copied;
};

const writeClipboardText = async (text: string) => {
  let clipboardWrite: Promise<void> | undefined;
  try {
    clipboardWrite = navigator.clipboard?.writeText(text);
  } catch {
    clipboardWrite = undefined;
  }

  const copiedWithSelection = copyWithSelection(text);
  if (copiedWithSelection) {
    void clipboardWrite?.catch(() => undefined);
    return true;
  }
  if (!clipboardWrite) return false;

  try {
    await clipboardWrite;
    return true;
  } catch {
    return false;
  }
};

export function IconDocsIsland() {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<StyleFilter>("all");
  const [copyToast, setCopyToast] = useState<CopyToast | null>(null);

  const visibleIcons = useMemo(() => {
    const matches = findIcons({
      query: query.trim() || undefined,
      style: style === "all" ? undefined : style,
    });
    const matchIds = new Set(matches.map((item) => item.id));
    return iconDocsRegistry.filter((item) => matchIds.has(item.id));
  }, [query, style]);
  const visibleDirectionIcons = visibleIcons.filter((item) => item.semantic === "direction");
  const visiblePromptIcons = visibleIcons.filter((item) => item.semantic === "prompt");
  const visibleInteractionIcons = visibleIcons.filter((item) => item.semantic === "interaction");
  const visibleEditIcons = visibleIcons.filter((item) => item.semantic === "edit");
  const visibleTrademarkIcons = visibleIcons.filter((item) => item.semantic === "trademark");
  const visibleGeneralIcons = visibleIcons.filter((item) => item.semantic === "general");
  const hasSearchQuery = query.trim().length > 0;
  const showEmptySections = !hasSearchQuery && style !== "color";

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);

  useEffect(() => {
    if (!copyToast || copyToast.status === "copying") return;
    const currentToast = copyToast;
    const timeout = window.setTimeout(() => {
      setCopyToast((toast) => toast === currentToast ? null : toast);
    }, copyToast.status === "success" ? 2200 : 3000);
    return () => window.clearTimeout(timeout);
  }, [copyToast]);

  const copyUsage = async (item: IconDocsItem) => {
    const code = getIconUsageCode(item);
    setCopyToast({ status: "copying", jsxCode: code.jsxCode });
    try {
      const copied = await writeClipboardText(code.jsxCode);
      if (!copied) throw new Error("Copy command was rejected");
      setCopyToast({ status: "success", jsxCode: code.jsxCode });
    } catch {
      setCopyToast({ status: "error", jsxCode: code.jsxCode });
    }
  };

  return (
    <>
      <div className="component-intro">
        <div className="component-intro-meta">组件 / 通用</div>
        <div className="component-intro-head">
          <div className="component-intro-copy">
            <h3>图标 Icon</h3>
            <p>提供方向指示、提示建议、交互按钮、编辑、商标和通用类 React 图标，支持结构化检索、独立导入与颜色契约。</p>
          </div>
        </div>
      </div>

      <div className="qizhi-icon-docs">
        <div className="qizhi-icon-docs__toolbar">
          <div className="qizhi-segmented qizhi-segmented-lg" role="radiogroup" aria-label="筛选图标类型">
            {styleFilters.map((filter) => (
              <button
                key={filter.value}
                className={`qizhi-segmented-item${style === filter.value ? " is-active" : ""}`}
                type="button"
                role="radio"
                aria-checked={style === filter.value}
                tabIndex={style === filter.value ? 0 : -1}
                onClick={() => setStyle(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <Input
            className="qizhi-icon-docs__search"
            type="text"
            role="searchbox"
            aria-label="搜索图标"
            value={query}
            allowClear
            prefix={<SearchIcon />}
            placeholder="搜索中文名称、组件名或别名"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {hasSearchQuery && !visibleIcons.length ? (
          <div className="qizhi-icon-docs__empty">没有匹配的图标</div>
        ) : null}

        {showEmptySections || visibleDirectionIcons.length ? <section aria-labelledby="方向指示类图标">
          <h2 className="iconlist-title" id="方向指示类图标">
            方向指示类图标 <span className="iconlist-count">{visibleDirectionIcons.length} 个 React 组件</span>
          </h2>
          {visibleDirectionIcons.length ? (
            <ul className="qizhi-icon-docs__grid">
              {visibleDirectionIcons.map((item) => (
                <li key={item.id}>
                  <button
                    className="qizhi-icon-docs__cell"
                    type="button"
                    aria-label={`复制${item.displayName}组件代码`}
                    onClick={() => void copyUsage(item)}
                  >
                    <item.Component size={32} />
                    <span>{item.displayName}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="qizhi-icon-docs__empty">没有匹配的方向图标</div>
          )}
        </section> : null}

        {showEmptySections || visiblePromptIcons.length ? <section aria-labelledby="提示建议类图标">
          <h2 className="iconlist-title" id="提示建议类图标">
            提示建议类图标 <span className="iconlist-count">{visiblePromptIcons.length} 个 React 组件</span>
          </h2>
          {visiblePromptIcons.length ? (
            <ul className="qizhi-icon-docs__grid">
              {visiblePromptIcons.map((item) => (
                <li key={item.id}>
                  <button
                    className="qizhi-icon-docs__cell"
                    type="button"
                    aria-label={`复制${item.displayName}组件代码`}
                    onClick={() => void copyUsage(item)}
                  >
                    <item.Component size={32} />
                    <span>{item.displayName}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="qizhi-icon-docs__empty">没有匹配的提示建议图标</div>
          )}
        </section> : null}

        {showEmptySections || visibleInteractionIcons.length ? <section aria-labelledby="交互按钮类图标">
          <h2 className="iconlist-title" id="交互按钮类图标">
            交互按钮类图标 <span className="iconlist-count">{visibleInteractionIcons.length} 个 React 组件</span>
          </h2>
          {visibleInteractionIcons.length ? (
            <ul className="qizhi-icon-docs__grid">
              {visibleInteractionIcons.map((item) => (
                <li key={item.id}>
                  <button className="qizhi-icon-docs__cell" type="button" aria-label={`复制${item.displayName}组件代码`} onClick={() => void copyUsage(item)}>
                    <item.Component size={32} />
                    <span>{item.displayName}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <div className="qizhi-icon-docs__empty">没有匹配的交互按钮图标</div>}
        </section> : null}

        {showEmptySections || visibleEditIcons.length ? <section aria-labelledby="编辑类图标">
          <h2 className="iconlist-title" id="编辑类图标">
            编辑类图标 <span className="iconlist-count">{visibleEditIcons.length} 个 React 组件</span>
          </h2>
          {visibleEditIcons.length ? (
            <ul className="qizhi-icon-docs__grid">
              {visibleEditIcons.map((item) => (
                <li key={item.id}>
                  <button className="qizhi-icon-docs__cell" type="button" aria-label={`复制${item.displayName}组件代码`} onClick={() => void copyUsage(item)}>
                    <item.Component size={32} />
                    <span>{item.displayName}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <div className="qizhi-icon-docs__empty">没有匹配的编辑图标</div>}
        </section> : null}

        {showEmptySections || visibleTrademarkIcons.length ? <section aria-labelledby="商标类图标">
          <h2 className="iconlist-title" id="商标类图标">
            商标类图标 <span className="iconlist-count">{visibleTrademarkIcons.length} 个 React 组件</span>
          </h2>
          {visibleTrademarkIcons.length ? (
            <ul className="qizhi-icon-docs__grid">
              {visibleTrademarkIcons.map((item) => (
                <li key={item.id}>
                  <button className="qizhi-icon-docs__cell" type="button" aria-label={`复制${item.displayName}组件代码`} onClick={() => void copyUsage(item)}>
                    <item.Component size={32} />
                    <span>{item.displayName}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <div className="qizhi-icon-docs__empty">没有匹配的商标图标</div>}
        </section> : null}

        {showEmptySections || visibleGeneralIcons.length ? <section aria-labelledby="通用类图标">
          <h2 className="iconlist-title" id="通用类图标">
            通用类图标 <span className="iconlist-count">{visibleGeneralIcons.length} 个 React 组件</span>
          </h2>
          {visibleGeneralIcons.length ? (
            <ul className="qizhi-icon-docs__grid">
              {visibleGeneralIcons.map((item) => (
                <li key={item.id}>
                  <button className="qizhi-icon-docs__cell" type="button" aria-label={`复制${item.displayName}组件代码`} onClick={() => void copyUsage(item)}>
                    <item.Component size={32} />
                    <span>{item.displayName}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <div className="qizhi-icon-docs__empty">没有匹配的通用图标</div>}
        </section> : null}

        <IconApiTable />

      </div>
      {copyToast ? createPortal(
        <div className="qizhi-message-layer" aria-live="polite">
          <div
            className={`qizhi-message qizhi-icon-docs__copy-toast qizhi-message--${copyToast.status === "error" ? "error" : copyToast.status === "success" ? "success" : "normal"} is-visible`}
            role={copyToast.status === "error" ? "alert" : "status"}
          >
            {copyToast.status === "success" ? (
              <CheckCircleIcon className="qizhi-message__icon" />
            ) : copyToast.status === "error" ? (
              <MultiplyIcon className="qizhi-message__icon" />
            ) : null}
            <span className="qizhi-message__content">
              {copyToast.status === "success"
                ? "复制成功!"
                : copyToast.status === "error"
                  ? "复制失败，请检查浏览器剪贴板权限"
                  : "正在复制"}
            </span>
            {copyToast.status === "error" ? null : (
              <code className="qizhi-icon-docs__copy-code">{copyToast.jsxCode}</code>
            )}
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
