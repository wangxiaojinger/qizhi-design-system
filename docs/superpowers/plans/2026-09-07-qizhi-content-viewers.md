# QIZHI Content Viewers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `@wangxiaojinger/qizhi-react` 新增 CodePreview（代码预览）、MarkdownViewer（Markdown 阅读器）和 LogViewer（日志查看器），完成 React 文档与启智平台 Skill.md 的真实接入。

**Architecture:** 三个组件保持独立公开 API，共享不导出的文本视口与操作工具；Markdown 使用 `react-markdown` 和 `remark-gfm` 安全渲染，代码使用 `prism-react-renderer` 着色。所有公共能力从 `@wangxiaojinger/qizhi-react` 导出，文档 Demo 与展示/复制代码同源，启智平台只负责提供 Skill 内容。

**Tech Stack:** React 19、TypeScript 7、Vite 8、Vitest、Testing Library、Playwright、pnpm、`@wangxiaojinger/qizhi-tokens`、`react-markdown`、`remark-gfm`、`prism-react-renderer`

**Spec:** `docs/superpowers/specs/2026-09-07-qizhi-content-viewers-design.md`

## Global Constraints

- 三个组件登记在“基础组件 / 数据展示”，不改变现有 React 文档站 UI 结构。
- `MarkdownViewer` 首版不支持 Markdown 内嵌 HTML，不安装或启用 `rehype-raw`，不使用 `dangerouslySetInnerHTML`。
- `LogViewer` 不请求接口，不创建轮询、SSE 或 WebSocket；Demo 只使用本地 Mock 数据与计时器。
- `CodePreview`、`MarkdownViewer`、`LogViewer` 均为只读组件，不编辑、保存或执行内容。
- Demo 交互只使用公开 `@wangxiaojinger/qizhi-react` 组件与图标，不使用原生交互控件、自写 SVG、内联布局或公共组件私有 `__*` 选择器。
- Demo 完整复用 Button Demo 操作区：`component-example-actions`、QIZHI `Button`、`CodeIcon`、`CopyIcon`、两个 `qizhi-code-action`、公共反馈与展开结构；间距 12px，右内边距 0px。
- 实际 Demo TSX 是预览、展示和复制的唯一代码源。
- 颜色、字号、间距、边框、圆角和状态只使用已登记 QIZHI 语义 Token；新增 `font.mono` / `--font-mono` 后由组件和平台共同消费。
- 公共 API 变更同步实现、类型、根导出、契约文档、API 表、Demo、组件清单、生成 API JSON、单元测试、契约测试和 E2E。
- 先看到旧实现测试失败，再写生产代码；自动化与当前执行者结论最高为 `candidate_pass`，独立最终验收保持 `pending`。
- 保留工作区现有修改；每次 `git add` 只列出当前任务文件，不执行全量暂存。

---

### Task 1: 登记等宽字体 Token 并安装内容解析依赖

**Files:**
- Modify: `packages/qizhi-tokens/src/tokens.json`
- Modify: `packages/qizhi-tokens/tests/tokens.node.mjs`
- Regenerate: `packages/qizhi-tokens/dist/tokens.json`
- Regenerate: `packages/qizhi-tokens/dist/style.css`
- Regenerate: `packages/qizhi-tokens/dist/index.js`
- Regenerate: `packages/qizhi-tokens/dist/index.d.ts`
- Modify: `packages/qizhi-react/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: token `font.mono` with CSS variable `--font-mono`.
- Produces: runtime dependencies `react-markdown`, `remark-gfm`, `prism-react-renderer` available to `@wangxiaojinger/qizhi-react`.

- [ ] **Step 1: Write the failing token test**

Add to `packages/qizhi-tokens/tests/tokens.node.mjs`:

```js
test("publishes the shared monospace font token", async () => {
  const manifest = JSON.parse(await read(new URL("src/tokens.json", packageRoot)));
  const mono = manifest.tokens["font.mono"];

  assert.equal(mono.cssVariable, "--font-mono");
  assert.match(mono.value, /ui-monospace/);
  assert.equal(mono.category, "字体");
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: FAIL because `manifest.tokens["font.mono"]` is undefined.

- [ ] **Step 3: Add the token and dependencies**

Add this object next to `font.sans` in `packages/qizhi-tokens/src/tokens.json`:

```json
"font.mono": {
  "name": "font.mono",
  "value": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
  "cssVariable": "--font-mono",
  "category": "字体",
  "description": "代码、Markdown 源文和运行日志使用的等宽字体族"
}
```

Install the approved dependencies:

```bash
pnpm --filter @wangxiaojinger/qizhi-react add react-markdown remark-gfm prism-react-renderer
```

Regenerate token artifacts:

```bash
pnpm --filter @wangxiaojinger/qizhi-tokens build
```

- [ ] **Step 4: Verify token generation and dependency placement**

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens test`

Expected: PASS, with generated CSS containing `--font-mono` and
`packages/qizhi-react/package.json` listing all three dependencies under
`dependencies`.

- [ ] **Step 5: Commit only Task 1 files**

```bash
git add packages/qizhi-tokens/src/tokens.json packages/qizhi-tokens/tests/tokens.node.mjs packages/qizhi-tokens/dist/tokens.json packages/qizhi-tokens/dist/style.css packages/qizhi-tokens/dist/index.js packages/qizhi-tokens/dist/index.d.ts packages/qizhi-react/package.json pnpm-lock.yaml
git commit -m "feat(tokens): add shared monospace font"
```

### Task 2: 建立内部文本视口与 CodePreview（代码预览）

**Files:**
- Create: `packages/qizhi-react/src/content-viewer/TextViewport.tsx`
- Create: `packages/qizhi-react/src/content-viewer/contentViewer.css`
- Create: `packages/qizhi-react/src/code-preview/CodePreview.types.ts`
- Create: `packages/qizhi-react/src/code-preview/CodePreview.tsx`
- Create: `packages/qizhi-react/src/code-preview/codePreview.css`
- Create: `packages/qizhi-react/src/code-preview/CodePreview.test.tsx`
- Create: `docs/specs/qizhi-code-preview-contract-v1.md`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Consumes: `--font-mono`, QIZHI `Button`, `CopyIcon`, `Empty`, `Spin` and `prism-react-renderer`.
- Produces: `CodePreview`, `CodePreviewProps`, `CodePreviewLanguage` from `@wangxiaojinger/qizhi-react`.
- Produces internally: `TextViewportProps { children; maxHeight?; wrap?; showLineNumbers?; ariaLabel? }`.

- [ ] **Step 1: Write failing public-contract tests**

Create `packages/qizhi-react/src/code-preview/CodePreview.test.tsx` with focused tests:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CodePreview } from "./CodePreview";

describe("CodePreview", () => {
  it("renders highlighted read-only code with line numbers", () => {
    render(<CodePreview value={'const name = "QIZHI";\nconsole.log(name);'} language="typescript" />);
    expect(screen.getByLabelText("代码预览")).toHaveTextContent("QIZHI");
    expect(screen.getAllByTestId("code-line-number")).toHaveLength(2);
  });

  it("falls back to plain text for an unknown runtime language", () => {
    render(<CodePreview value="alpha < beta" language={"unknown" as never} />);
    expect(screen.getByText(/alpha < beta/)).toBeInTheDocument();
  });

  it("copies and downloads only when the public controls are enabled", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CodePreview value="echo QIZHI" language="shell" downloadable fileName="demo.sh" />);
    fireEvent.click(screen.getByRole("button", { name: "复制代码" }));
    expect(writeText).toHaveBeenCalledWith("echo QIZHI");
    expect(screen.getByRole("link", { name: "下载代码" })).toHaveAttribute("download", "demo.sh");
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<CodePreview value="" loading />);
    expect(screen.getByLabelText("正在加载代码")).toBeInTheDocument();
    rerender(<CodePreview value="" emptyText="暂无代码" />);
    expect(screen.getByText("暂无代码")).toBeInTheDocument();
  });
});
```

Add a root-export assertion to the same file:

```tsx
import * as QizhiReact from "../index";

it("exports CodePreview from the package root", () => {
  expect(QizhiReact.CodePreview).toBe(CodePreview);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm vitest run packages/qizhi-react/src/code-preview/CodePreview.test.tsx`

Expected: FAIL because `CodePreview.tsx` and its root export do not exist.

- [ ] **Step 3: Define the typed public API**

Create `CodePreview.types.ts` exactly from the approved contract:

```ts
import type { ReactNode } from "react";

export type CodePreviewLanguage = "javascript" | "typescript" | "jsx" | "tsx" | "json" | "yaml" | "markdown" | "shell" | "python" | "text";

export interface CodePreviewProps {
  value: string;
  language?: CodePreviewLanguage;
  showLineNumbers?: boolean;
  wrap?: boolean;
  copyable?: boolean;
  downloadable?: boolean;
  fileName?: string;
  maxHeight?: number | string;
  loading?: boolean;
  emptyText?: ReactNode;
  className?: string;
  "aria-label"?: string;
}
```

- [ ] **Step 4: Implement the minimal shared viewport and CodePreview**

Implement `TextViewport` as an internal semantic wrapper that:

```tsx
<div className={classes} style={{ "--qizhi-content-max-height": cssMaxHeight } as React.CSSProperties}>
  {children}
</div>
```

The CSS must consume `var(--font-mono)`, use `max-height: var(--qizhi-content-max-height)`,
allow internal scrolling, and switch between `white-space: pre` and `pre-wrap` through a
public root modifier. It must not export from `packages/qizhi-react/src/index.ts`.

Implement `CodePreview` with `Highlight` from `prism-react-renderer`, a controlled map from
the approved `CodePreviewLanguage` values to Prism languages, QIZHI buttons/icons for copy,
an anchor download URL created from a Blob, and `Empty`/`Spin` for states. Revoke generated
object URLs during cleanup. Defaults are:

```ts
const defaults = {
  language: "text",
  showLineNumbers: true,
  wrap: false,
  copyable: true,
  downloadable: false,
};
```

Use the public root class `.qizhi-code-preview`; do not expose internal class names as API.

- [ ] **Step 5: Export and document the contract**

Add to `packages/qizhi-react/src/index.ts`:

```ts
export { CodePreview } from "./code-preview/CodePreview";
export type { CodePreviewLanguage, CodePreviewProps } from "./code-preview/CodePreview.types";
```

Write `docs/specs/qizhi-code-preview-contract-v1.md` with the approved title, description,
defaults, supported language union, state precedence (`loading` before empty before content),
copy/download behavior, accessibility names and explicit read-only boundary.

- [ ] **Step 6: Run component tests and typecheck**

Run: `pnpm vitest run packages/qizhi-react/src/code-preview/CodePreview.test.tsx`

Run: `pnpm --filter @wangxiaojinger/qizhi-react typecheck`

Expected: both PASS.

- [ ] **Step 7: Commit only CodePreview files**

```bash
git add packages/qizhi-react/src/content-viewer packages/qizhi-react/src/code-preview packages/qizhi-react/src/index.ts docs/specs/qizhi-code-preview-contract-v1.md
git commit -m "feat(react): add code preview"
```

### Task 3: 实现 MarkdownViewer（Markdown 阅读器）

**Files:**
- Create: `packages/qizhi-react/src/markdown-viewer/MarkdownViewer.types.ts`
- Create: `packages/qizhi-react/src/markdown-viewer/MarkdownViewer.tsx`
- Create: `packages/qizhi-react/src/markdown-viewer/markdownViewer.css`
- Create: `packages/qizhi-react/src/markdown-viewer/MarkdownViewer.test.tsx`
- Create: `docs/specs/qizhi-markdown-viewer-contract-v1.md`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Consumes: `CodePreview`, `react-markdown`, `remark-gfm`, `Empty`, `Spin`.
- Produces: `MarkdownViewer`, `MarkdownViewerProps` from `@wangxiaojinger/qizhi-react`.

- [ ] **Step 1: Write the failing Markdown behavior tests**

Create `MarkdownViewer.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownViewer } from "./MarkdownViewer";

describe("MarkdownViewer", () => {
  it("renders headings, GFM tables, tasks and fenced code", () => {
    render(<MarkdownViewer value={'# Skill\n\n- [x] 完成\n\n| 名称 | 状态 |\n| --- | --- |\n| QIZHI | 可用 |\n\n```ts\nconst ready = true;\n```'} />);
    expect(screen.getByRole("heading", { name: "Skill" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("QIZHI");
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByLabelText("代码预览")).toHaveTextContent("ready");
  });

  it("does not render embedded HTML", () => {
    const { container } = render(<MarkdownViewer value={'<button onclick="alert(1)">危险</button>'} />);
    expect(container.querySelector("button")).toBeNull();
    expect(screen.getByText(/危险/)).toBeInTheDocument();
  });

  it("secures links opened in a new tab", () => {
    render(<MarkdownViewer value="[QIZHI](https://example.com)" openLinksInNewTab />);
    expect(screen.getByRole("link", { name: "QIZHI" })).toHaveAttribute("rel", "noreferrer noopener");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm vitest run packages/qizhi-react/src/markdown-viewer/MarkdownViewer.test.tsx`

Expected: FAIL because `MarkdownViewer` does not exist.

- [ ] **Step 3: Define the API and implement safe rendering**

Create the approved type:

```ts
import type { ReactNode } from "react";

export interface MarkdownViewerProps {
  value: string;
  loading?: boolean;
  emptyText?: ReactNode;
  openLinksInNewTab?: boolean;
  maxHeight?: number | string;
  showOutline?: boolean;
  className?: string;
  "aria-label"?: string;
}
```

Add an internal `remarkHtmlAsText` plugin that recursively visits the Markdown AST and replaces
every `{ type: "html", value }` node with `{ type: "text", value }`. This preserves the literal
tag text without creating a DOM element. Render with:

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm, remarkHtmlAsText]}
  skipHtml
  components={{
    code({ className, children }) {
      const language = className?.replace("language-", "") ?? "text";
      return className
        ? <CodePreview value={String(children).replace(/\n$/, "")} language={toCodeLanguage(language)} />
        : <code>{children}</code>;
    },
    a({ children, ...props }) {
      return <a {...props} target={openLinksInNewTab ? "_blank" : undefined} rel={openLinksInNewTab ? "noreferrer noopener" : undefined}>{children}</a>;
    },
  }}
>
  {value}
</ReactMarkdown>
```

Do not import `rehype-raw`. Use `.qizhi-markdown-viewer` and semantic tokens for headings,
paragraphs, lists, tables, quotes and inline code. Implement `showOutline` as a read-only
heading navigation generated from level 2 and level 3 headings, with stable slug collision
handling and QIZHI `Link`; default is false.

- [ ] **Step 4: Export and write the contract**

Add:

```ts
export { MarkdownViewer } from "./markdown-viewer/MarkdownViewer";
export type { MarkdownViewerProps } from "./markdown-viewer/MarkdownViewer.types";
```

Document supported syntax, `skipHtml`, safe links, outline behavior, state precedence and the
absence of editing/network behavior in `docs/specs/qizhi-markdown-viewer-contract-v1.md`.

- [ ] **Step 5: Verify and commit**

Run: `pnpm vitest run packages/qizhi-react/src/markdown-viewer/MarkdownViewer.test.tsx`

Run: `pnpm --filter @wangxiaojinger/qizhi-react typecheck`

Expected: both PASS.

```bash
git add packages/qizhi-react/src/markdown-viewer packages/qizhi-react/src/index.ts docs/specs/qizhi-markdown-viewer-contract-v1.md
git commit -m "feat(react): add markdown viewer"
```

### Task 4: 实现 LogViewer（日志查看器）

**Files:**
- Create: `packages/qizhi-react/src/log-viewer/LogViewer.types.ts`
- Create: `packages/qizhi-react/src/log-viewer/LogViewer.tsx`
- Create: `packages/qizhi-react/src/log-viewer/logViewer.css`
- Create: `packages/qizhi-react/src/log-viewer/LogViewer.test.tsx`
- Create: `docs/specs/qizhi-log-viewer-contract-v1.md`
- Modify: `packages/qizhi-react/src/index.ts`

**Interfaces:**
- Consumes: internal `TextViewport`, QIZHI `Button`, `Input`, `Select`, `Tooltip`, `Empty`, `Spin`, `RefreshIcon`.
- Produces: `LogViewer`, `LogViewerProps`, `LogEntry`, `LogLevel`, `LogViewerStatus` from `@wangxiaojinger/qizhi-react`.

- [ ] **Step 1: Write failing behavior tests**

Create `LogViewer.test.tsx` with these concrete cases:

```tsx
const logs = [
  { id: "1", timestamp: "10:00:00", level: "info" as const, message: "实例启动" },
  { id: "2", timestamp: "10:00:01", level: "error" as const, message: "连接失败" },
];

it("renders and filters supplied logs without fetching", async () => {
  const user = userEvent.setup();
  render(<LogViewer logs={logs} searchable />);
  await user.type(screen.getByRole("textbox", { name: "搜索日志" }), "失败");
  expect(screen.queryByText("实例启动")).not.toBeInTheDocument();
  expect(screen.getByText("连接失败")).toBeInTheDocument();
});

it("prevents duplicate refresh while refreshing", async () => {
  const onRefresh = vi.fn();
  render(<LogViewer logs={logs} refreshable refreshing onRefresh={onRefresh} />);
  const refresh = screen.getByRole("button", { name: "正在刷新日志" });
  expect(refresh).toBeDisabled();
  fireEvent.click(refresh);
  expect(onRefresh).not.toHaveBeenCalled();
});

it("pauses following after the user scrolls away from the bottom", () => {
  const onAutoFollowChange = vi.fn();
  render(<LogViewer logs={logs} autoFollow onAutoFollowChange={onAutoFollowChange} />);
  const viewport = screen.getByLabelText("运行日志内容");
  Object.defineProperties(viewport, { scrollHeight: { value: 600 }, clientHeight: { value: 200 }, scrollTop: { value: 0, writable: true } });
  fireEvent.scroll(viewport);
  expect(onAutoFollowChange).toHaveBeenCalledWith(false);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm vitest run packages/qizhi-react/src/log-viewer/LogViewer.test.tsx`

Expected: FAIL because `LogViewer` does not exist.

- [ ] **Step 3: Define public types**

```ts
import type { ReactNode } from "react";

export type LogLevel = "debug" | "info" | "warning" | "error";
export type LogViewerStatus = "idle" | "running" | "paused" | "success" | "error";

export interface LogEntry {
  id: string;
  timestamp?: string;
  level?: LogLevel;
  message: string;
}

export interface LogViewerProps {
  logs: LogEntry[];
  status?: LogViewerStatus;
  loading?: boolean;
  refreshing?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
  autoFollow?: boolean;
  onAutoFollowChange?: (autoFollow: boolean) => void;
  searchable?: boolean;
  levelFilter?: LogLevel[];
  showLineNumbers?: boolean;
  maxHeight?: number | string;
  emptyText?: ReactNode;
  className?: string;
  "aria-label"?: string;
}
```

- [ ] **Step 4: Implement local viewing interactions**

Use QIZHI `Input` for local message search and QIZHI `Select mode="multiple"` for allowed
levels. `levelFilter` defines the levels offered in the filter; absent means all four levels.
The current selected levels remain component-local because the approved API does not expose a
selected-level prop.

Treat `autoFollow` as controlled when supplied; otherwise initialize internal following to
true. On a user scroll where `scrollHeight - scrollTop - clientHeight > 24`, switch following
off and emit `onAutoFollowChange(false)`. When following is active and `logs` changes, call
`scrollTo({ top: scrollHeight })`. Render a “继续跟随” QIZHI Button when following is off.

The refresh button must use `RefreshIcon`, `disabled={refreshing}` and accessible names
“刷新日志” / “正在刷新日志”. The component only invokes `onRefresh`; it contains no
`fetch`, timer, EventSource or WebSocket code.

- [ ] **Step 5: Export, document, verify and commit**

Add root exports:

```ts
export { LogViewer } from "./log-viewer/LogViewer";
export type { LogEntry, LogLevel, LogViewerProps, LogViewerStatus } from "./log-viewer/LogViewer.types";
```

Document data ownership, filtering, controlled/uncontrolled follow behavior, refresh states,
state precedence and network boundary in `docs/specs/qizhi-log-viewer-contract-v1.md`.

Run: `pnpm vitest run packages/qizhi-react/src/log-viewer/LogViewer.test.tsx`

Run: `pnpm --filter @wangxiaojinger/qizhi-react typecheck`

Expected: both PASS.

```bash
git add packages/qizhi-react/src/log-viewer packages/qizhi-react/src/index.ts docs/specs/qizhi-log-viewer-contract-v1.md
git commit -m "feat(react): add log viewer"
```

### Task 5: 建立三个组件的 React 文档 Island 与同源 Demo

**Files:**
- Create: `apps/qizhi-docs/src/code-preview/CodePreviewDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/code-preview/CodePreviewDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/code-preview/CodePreviewApiTable.tsx`
- Create: `apps/qizhi-docs/src/code-preview/codePreviewDocs.registry.ts`
- Create: `apps/qizhi-docs/src/code-preview/codePreviewApi.ts`
- Create: `apps/qizhi-docs/src/code-preview/codePreviewDocs.css`
- Create: `apps/qizhi-docs/src/code-preview/codePreviewDocs.test.tsx`
- Create: `apps/qizhi-docs/src/code-preview/main.tsx`
- Create: `apps/qizhi-docs/src/code-preview/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/code-preview/demos/LanguagesDemo.tsx`
- Create: `apps/qizhi-docs/src/code-preview/demos/LongContentDemo.tsx`
- Create: `apps/qizhi-docs/src/code-preview/demos/StatesDemo.tsx`
- Create: `apps/qizhi-docs/src/markdown-viewer/MarkdownViewerDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/markdown-viewer/MarkdownViewerDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/markdown-viewer/MarkdownViewerApiTable.tsx`
- Create: `apps/qizhi-docs/src/markdown-viewer/markdownViewerDocs.registry.ts`
- Create: `apps/qizhi-docs/src/markdown-viewer/markdownViewerApi.ts`
- Create: `apps/qizhi-docs/src/markdown-viewer/markdownViewerDocs.css`
- Create: `apps/qizhi-docs/src/markdown-viewer/markdownViewerDocs.test.tsx`
- Create: `apps/qizhi-docs/src/markdown-viewer/main.tsx`
- Create: `apps/qizhi-docs/src/markdown-viewer/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/markdown-viewer/demos/GfmDemo.tsx`
- Create: `apps/qizhi-docs/src/markdown-viewer/demos/CodeBlockDemo.tsx`
- Create: `apps/qizhi-docs/src/markdown-viewer/demos/StatesDemo.tsx`
- Create: `apps/qizhi-docs/src/log-viewer/LogViewerDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/log-viewer/LogViewerDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/log-viewer/LogViewerApiTable.tsx`
- Create: `apps/qizhi-docs/src/log-viewer/logViewerDocs.registry.ts`
- Create: `apps/qizhi-docs/src/log-viewer/logViewerApi.ts`
- Create: `apps/qizhi-docs/src/log-viewer/logViewerDocs.css`
- Create: `apps/qizhi-docs/src/log-viewer/logViewerDocs.test.tsx`
- Create: `apps/qizhi-docs/src/log-viewer/main.tsx`
- Create: `apps/qizhi-docs/src/log-viewer/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/log-viewer/demos/LiveDemo.tsx`
- Create: `apps/qizhi-docs/src/log-viewer/demos/RefreshDemo.tsx`
- Create: `apps/qizhi-docs/src/log-viewer/demos/FilterDemo.tsx`
- Create: `apps/qizhi-docs/src/log-viewer/demos/StatesDemo.tsx`
- Modify: `apps/qizhi-docs/src/api/component-api.json`
- Create: `tests/contracts/content-viewer-docs-boundary.test.ts`

**Interfaces:**
- Consumes: all three public components and their public prop types.
- Produces: `codePreviewApi`, `markdownViewerApi`, `logViewerApi`; React mount entries for `component-code-preview`, `component-markdown-viewer`, `component-log-viewer`.

- [ ] **Step 1: Write the failing docs-boundary test**

Create `tests/contracts/content-viewer-docs-boundary.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const components = ["code-preview", "markdown-viewer", "log-viewer"];

describe("content viewer docs boundary", () => {
  it.each(components)("%s demos use the shared QIZHI action area", (name) => {
    const codebox = readFileSync(`apps/qizhi-docs/src/${name}/${name === "code-preview" ? "CodePreview" : name === "markdown-viewer" ? "MarkdownViewer" : "LogViewer"}DemoCodebox.tsx`, "utf8");
    expect(codebox).toContain("component-example-actions");
    expect(codebox).toContain("qizhi-code-action");
    expect(codebox).toContain("<CodeIcon");
    expect(codebox).toContain("<CopyIcon");
    expect(codebox).not.toMatch(/<button\b|<input\b|<select\b|<svg\b|style=\{\{/);
  });
});
```

- [ ] **Step 2: Run the boundary test and verify RED**

Run: `pnpm vitest run tests/contracts/content-viewer-docs-boundary.test.ts`

Expected: FAIL because the three documentation directories do not exist.

- [ ] **Step 3: Create CodePreview docs**

Create `CodePreviewDocsIsland.tsx`, `CodePreviewDemoCodebox.tsx`,
`codePreviewDocs.registry.ts`, `codePreviewApi.ts`, `CodePreviewApiTable.tsx`,
`codePreviewDocs.css`, `main.tsx`, `codePreviewDocs.test.tsx` and four Demo files with these
exact registry entries:

```ts
[
  { id: "code-preview-basic", title: "基础用法", description: "展示 TypeScript 代码、行号和复制操作。" },
  { id: "code-preview-languages", title: "多种语言", description: "通过选择器切换代码语言并查看对应的语法着色。" },
  { id: "code-preview-long-content", title: "长内容", description: "长内容支持自动换行、内部滚动和文件下载。" },
  { id: "code-preview-states", title: "加载与空状态", description: "展示内容加载中和无代码内容时的反馈。" },
]
```

The intro title and description must exactly match the approved spec.

- [ ] **Step 4: Create MarkdownViewer docs**

Create the parallel Island, Codebox, registry, API, CSS, main, test and four Demo files with:

```ts
[
  { id: "markdown-viewer-basic", title: "基础文档", description: "展示标题、段落、列表和引用等常用 Markdown 内容。" },
  { id: "markdown-viewer-gfm", title: "扩展语法", description: "展示表格、任务列表、删除线和链接等 GFM 语法。" },
  { id: "markdown-viewer-code", title: "代码块", description: "Markdown 代码块复用 CodePreview 代码预览组件。" },
  { id: "markdown-viewer-states", title: "安全与状态", description: "内嵌 HTML 按文本处理，并展示加载与空内容状态。" },
]
```

- [ ] **Step 5: Create LogViewer docs with local-only Mock behavior**

Create the parallel Island, Codebox, registry, API, CSS, main, test and five Demo files with:

```ts
[
  { id: "log-viewer-basic", title: "基础日志", description: "展示日志时间、等级、内容和行号。" },
  { id: "log-viewer-live", title: "实时日志", description: "使用本地 Mock 定时追加日志，并支持暂停和继续跟随。" },
  { id: "log-viewer-refresh", title: "手动刷新", description: "使用本地 Mock 模拟 800ms 刷新过程，展示加载、禁用和文字提示。" },
  { id: "log-viewer-filter", title: "搜索与等级筛选", description: "在已传入的日志中按关键词和日志等级筛选。" },
  { id: "log-viewer-states", title: "空状态与错误状态", description: "展示暂无日志和运行失败时的反馈。" },
]
```

`LiveDemo` owns `setInterval` and clears it in effect cleanup. `RefreshDemo` owns `setTimeout`,
passes `refreshing` to the component and clears the timer in cleanup. No timer or request is
added to `packages/qizhi-react/src/log-viewer`.

- [ ] **Step 6: Generate API JSON and verify docs tests**

Run: `pnpm api:build`

Run: `pnpm vitest run tests/contracts/content-viewer-docs-boundary.test.ts apps/qizhi-docs/src/code-preview apps/qizhi-docs/src/markdown-viewer apps/qizhi-docs/src/log-viewer`

Expected: PASS; `component-api.json` contains `codePreviewApi`, `markdownViewerApi` and
`logViewerApi` generated from the typed API arrays.

- [ ] **Step 7: Commit docs files**

```bash
git add apps/qizhi-docs/src/code-preview apps/qizhi-docs/src/markdown-viewer apps/qizhi-docs/src/log-viewer apps/qizhi-docs/src/api/component-api.json tests/contracts/content-viewer-docs-boundary.test.ts
git commit -m "docs: add content viewer demos"
```

### Task 6: 注册静态导航、路由面板与 E2E 入口

**Files:**
- Modify: `index.html`
- Create: `tests/e2e/code-preview-react-island.spec.ts`
- Create: `tests/e2e/markdown-viewer-react-island.spec.ts`
- Create: `tests/e2e/log-viewer-react-island.spec.ts`
- Modify: `tests/contracts/workspace.test.tsx`

**Interfaces:**
- Consumes: three docs `main.tsx` mount entries.
- Produces: hashes `#component-code-preview`, `#component-markdown-viewer`, `#component-log-viewer`.

- [ ] **Step 1: Write failing route and mount assertions**

Add to `tests/contracts/workspace.test.tsx`:

```tsx
it.each([
  ["component-code-preview", "/apps/qizhi-docs/src/code-preview/main.tsx"],
  ["component-markdown-viewer", "/apps/qizhi-docs/src/markdown-viewer/main.tsx"],
  ["component-log-viewer", "/apps/qizhi-docs/src/log-viewer/main.tsx"],
])("registers %s as a routed React Island", (id, entry) => {
  const html = readFileSync("index.html", "utf8");
  expect(html).toContain(`href="#${id}"`);
  expect(html).toContain(`<section class="doc-section" id="${id}"></section>`);
  expect(html).toContain(`src="${entry}"`);
});
```

- [ ] **Step 2: Run the route test and verify RED**

Run: `pnpm vitest run tests/contracts/workspace.test.tsx`

Expected: FAIL because navigation, empty mount sections and scripts are absent.

- [ ] **Step 3: Register the three pages in index.html**

In the existing “数据展示” subgroup add, in this order after Empty:

```html
<a href="#component-code-preview" tabindex="-1" class="menu-link nav-link nav-link-sub"><span>代码预览 CodePreview</span></a>
<a href="#component-markdown-viewer" tabindex="-1" class="menu-link nav-link nav-link-sub"><span>Markdown 阅读器 MarkdownViewer</span></a>
<a href="#component-log-viewer" tabindex="-1" class="menu-link nav-link nav-link-sub"><span>日志查看器 LogViewer</span></a>
```

Wrap each anchor in the same existing `qz-menu-item` structure as adjacent items. Add three
empty direct-child `doc-section` mount points near other data-display component pages and add:

```html
<script type="module" src="/apps/qizhi-docs/src/code-preview/main.tsx"></script>
<script type="module" src="/apps/qizhi-docs/src/markdown-viewer/main.tsx"></script>
<script type="module" src="/apps/qizhi-docs/src/log-viewer/main.tsx"></script>
```

Update the data-display catalog count from 12 to 15 and add matching catalog cards using the
approved titles and descriptions. Do not alter other navigation groups.

- [ ] **Step 4: Add one behavior-focused E2E file per page**

Each file must navigate directly to its hash, assert all approved Demo titles, operate copy or
filter/follow controls, assert `scrollWidth <= clientWidth`, collect console errors, and capture
the component section screenshot through `testInfo.outputPath`. Markdown E2E must assert no
button is created from the embedded HTML sample. Log E2E must wait for a local Mock append and
exercise pause/resume and refresh disabled/loading behavior.

- [ ] **Step 5: Verify route contracts and build**

Run: `pnpm vitest run tests/contracts/workspace.test.tsx`

Run: `pnpm build`

Expected: PASS with all three entries bundled and no duplicate IDs.

- [ ] **Step 6: Commit registration files**

```bash
git add index.html tests/contracts/workspace.test.tsx tests/e2e/code-preview-react-island.spec.ts tests/e2e/markdown-viewer-react-island.spec.ts tests/e2e/log-viewer-react-island.spec.ts
git commit -m "docs: register content viewer pages"
```

### Task 7: 将启智平台 Skill.md 预览迁移到 CodePreview

**Files:**
- Modify: `generated-react-pages/workbench-home/src/SkillsWorkshop.tsx`
- Modify: `generated-react-pages/workbench-home/src/page.css`
- Modify: `generated-react-pages/workbench-home/src/App.test.tsx`
- Modify: `generated-react-pages/workbench-home/src/pageStyleContract.test.ts`
- Modify: `tests/contracts/platform-shell-consumers.test.ts`

**Interfaces:**
- Consumes: public `CodePreview` from `@wangxiaojinger/qizhi-react` and `--font-mono` from `@wangxiaojinger/qizhi-tokens`.
- Produces: Skill 文件详情 using the public component with `language="markdown"`, line numbers and wrapping.

- [ ] **Step 1: Add failing platform-consumer tests**

Add to `generated-react-pages/workbench-home/src/App.test.tsx` after opening a Skill detail and
selecting the 文件 tab:

```tsx
expect(screen.getByLabelText("Skill.md 文件预览")).toHaveClass("qizhi-code-preview");
expect(screen.getByText(/Skill 内容/)).toBeInTheDocument();
```

Replace the old style expectation in `pageStyleContract.test.ts` with:

```ts
it("Skill 文件预览只保留页面布局，不重写 CodePreview 私有结构", () => {
  expect(pageCss).not.toContain(".skill-markdown pre");
  expect(pageCss).not.toContain("var(--font-mono)");
  expect(pageCss).not.toMatch(/\.skill-markdown\s+\.qizhi-code-preview__/);
});
```

Add a source boundary assertion to `tests/contracts/platform-shell-consumers.test.ts`:

```ts
expect(skillsWorkshopSource).toContain("<CodePreview");
expect(skillsWorkshopSource).not.toContain("<pre>{selectedSkill.markdown}</pre>");
```

- [ ] **Step 2: Run platform tests and verify RED**

Run: `pnpm --dir generated-react-pages/workbench-home test -- --run`

Run: `pnpm vitest run tests/contracts/platform-shell-consumers.test.ts`

Expected: FAIL because the page still renders the handwritten `<pre>` and private font rule.

- [ ] **Step 3: Replace only the preview implementation**

Import `CodePreview` and replace the article body with:

```tsx
<CodePreview
  aria-label="Skill.md 文件预览"
  value={selectedSkill.markdown}
  language="markdown"
  showLineNumbers
  wrap
/>
```

Keep the existing file-tree layout and existing Skill.md/source header unless the final
rendered component creates a duplicate visible header; in that case retain the page header and
do not add a second one inside `CodePreview`. Remove only `.skill-markdown pre` and any private
descendant overrides; `.skill-markdown` remains the named semantic layout container.

- [ ] **Step 4: Verify platform tests and production build**

Run: `pnpm --dir generated-react-pages/workbench-home test -- --run`

Run: `pnpm --dir generated-react-pages/workbench-home build`

Run: `pnpm vitest run tests/contracts/platform-shell-consumers.test.ts`

Expected: PASS and no handwritten Skill preview remains.

- [ ] **Step 5: Commit only the platform migration**

```bash
git add generated-react-pages/workbench-home/src/SkillsWorkshop.tsx generated-react-pages/workbench-home/src/page.css generated-react-pages/workbench-home/src/App.test.tsx generated-react-pages/workbench-home/src/pageStyleContract.test.ts tests/contracts/platform-shell-consumers.test.ts
git commit -m "refactor(platform): use code preview for Skill files"
```

### Task 8: 全量验证、三档浏览器验收与证据记录

**Files:**
- Create: `docs/verification/content-viewers-react-island.md`
- Modify only if generated stale: `apps/qizhi-docs/src/api/component-api.json`

**Interfaces:**
- Consumes: completed components, docs routes and platform integration.
- Produces: reproducible verification record and `candidate_pass` evidence.

- [ ] **Step 1: Run source and contract scans**

Run:

```bash
rg -n "dangerouslySetInnerHTML|rehype-raw|<button\\b|<input\\b|<select\\b|<svg\\b|style=\\{\\{" apps/qizhi-docs/src/code-preview apps/qizhi-docs/src/markdown-viewer apps/qizhi-docs/src/log-viewer
```

Expected: no matches in Demo files except documented string fixtures that prove HTML is escaped.

Run:

```bash
rg -n "fetch\\(|EventSource|WebSocket|setInterval|setTimeout" packages/qizhi-react/src/log-viewer
```

Expected: no matches.

- [ ] **Step 2: Run complete automated verification**

Run: `pnpm api:validate`

Run: `pnpm --filter @wangxiaojinger/qizhi-tokens validate`

Run: `pnpm typecheck`

Run: `pnpm test`

Run: `pnpm build`

Run: `pnpm --dir generated-react-pages/workbench-home test -- --run`

Run: `pnpm --dir generated-react-pages/workbench-home build`

Expected: every command exits 0. Record any unrelated pre-existing failure separately; do not
change unrelated files to force a green result.

- [ ] **Step 3: Start the documentation and platform previews**

Run documentation site: `pnpm dev --host 127.0.0.1 --port 5173`

Run platform site: `pnpm --dir generated-react-pages/workbench-home dev --host 127.0.0.1 --port 5191`

Expected: both servers report ready and their URLs return HTTP 200.

- [ ] **Step 4: Run three-viewport Playwright acceptance**

Run:

```bash
pnpm playwright test tests/e2e/code-preview-react-island.spec.ts tests/e2e/markdown-viewer-react-island.spec.ts tests/e2e/log-viewer-react-island.spec.ts --project=desktop-1440 --project=narrow-1024 --project=mobile-375
```

For each viewport inspect direct-child geometry, long-line
wrapping/scrolling, page overflow, keyboard focus, copy/download, Markdown safety, log
filter/refresh/follow interactions and console errors.

- [ ] **Step 5: Inspect screenshots manually**

Open each generated target-state screenshot and verify text is not clipped, controls do not
overlap, code/log content stays within its viewport, tables remain readable, focus is visible,
and no popover/tooltip is clipped by an ancestor. Also capture and inspect the platform Skill.md
文件 tab at 1440, 1024 and 375.

- [ ] **Step 6: Write the verification record**

Create `docs/verification/content-viewers-react-island.md` containing:

```md
# 内容查看组件 React Island 验证

## 范围
- CodePreview（代码预览）
- MarkdownViewer（Markdown 阅读器）
- LogViewer（日志查看器）
- 启智平台 Skill.md 消费路径

## 自动检查
记录每条实际命令、退出码和失败归属。

## 浏览器检查
分别记录 1440、1024、375 的几何、交互、overflow、控制台和截图人工结论。

## 验收边界
当前结论最高为 candidate_pass；独立最终验收 pending。
```

Replace the instruction sentences with actual observed results and screenshot paths before
committing; do not record unexecuted checks as passed.

- [ ] **Step 7: Commit verification evidence**

```bash
git add docs/verification/content-viewers-react-island.md apps/qizhi-docs/src/api/component-api.json
git commit -m "test: verify content viewer components"
```

## Self-Review

- Spec coverage: Token、三项公共 API、内部复用、依赖、安全、文档标题与描述、
  13 个 Demo、导航、API JSON、平台接入、测试和三档浏览器验收均有对应任务。
- Placeholder scan: plan contains no deferred implementation placeholder; verification record
  template explicitly requires replacement with observed results before commit.
- Type consistency: `CodePreviewLanguage`、`MarkdownViewerProps`、`LogEntry`、
  `LogLevel`、`LogViewerStatus` and root exports use the same names in implementation, docs and
  consumers.
