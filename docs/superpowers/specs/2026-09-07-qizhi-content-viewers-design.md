# QIZHI 内容查看组件设计

## 目标

在 `@wangxiaojinger/qizhi-react` 的“基础组件 / 数据展示”类目新增三个正式公开组件：

- `CodePreview`（代码预览）；
- `MarkdownViewer`（Markdown 阅读器）；
- `LogViewer`（日志查看器）。

三个组件必须沿用现有 QIZHI React 文档站的 UI、Demo 外壳、代码展开、复制
反馈和 API 表结构，不重新设计文档站。首个真实消费者是“启智平台系统”的
Skill.md 文件预览；平台原有手写预览在公共组件可用后替换为
`CodePreview`。

本阶段不新增运行日志业务页面，不让组件请求接口，也不提供编辑或执行代码的
能力。

## 已确认决策

- 对外保留三个职责清晰的组件，不合并为带 `mode` 的万能查看器。
- 三个组件可以共享不导出的内部文本视口、滚动、复制、下载和状态能力。
- 允许新增 `react-markdown`、`remark-gfm` 和轻量代码高亮依赖。
- `MarkdownViewer` 首版不支持 Markdown 内嵌 HTML，不启用
  `rehype-raw`。
- `LogViewer` 只消费调用方传入的日志与状态；轮询、SSE、WebSocket 和接口请求
  均由业务层负责。
- `@wangxiaojinger/qizhi-tokens` 增加正式的等宽字体语义 Token，平台不得继续私自声明
  `--font-mono`。

## 架构

### 公开组件

三个公开组件分别位于 `packages/qizhi-react/src/code-preview`、
`packages/qizhi-react/src/markdown-viewer` 和
`packages/qizhi-react/src/log-viewer`，通过 `@wangxiaojinger/qizhi-react` 根入口导出类型与实现。

### 内部共享能力

内部共享能力只服务于三个查看组件，不作为公共 API 导出。它可以承担：

- 等宽字体和文本视口基线；
- 行号与内容行布局；
- 长内容滚动和自动换行；
- 复制、下载和操作反馈；
- 加载、空内容和错误展示的结构复用。

内部复用不得迫使三个公开组件共享不符合各自语义的 API。Markdown 正文排版
与日志持续追加行为仍分别实现。

## CodePreview（代码预览）

### 文档标题与描述

标题：`代码预览 CodePreview`

描述：用于只读展示代码和结构化文本，支持语法高亮、行号、自动换行、复制与
下载，适用于配置文件、接口响应和 Skill 源文件等内容。

### 公共 API

```ts
type CodePreviewLanguage =
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "json"
  | "yaml"
  | "markdown"
  | "shell"
  | "python"
  | "text";

interface CodePreviewProps {
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

默认展示行号和复制入口；默认不换行、不展示下载入口。未知语言不得导致渲染
失败，应安全回退为纯文本。

### Demo

1. 基础用法：TypeScript、行号和复制。
2. 多种语言：使用 QIZHI `Select`（选择器）切换已支持语言。
3. 长内容：自动换行、内部滚动和下载。
4. 加载与空状态。

## MarkdownViewer（Markdown 阅读器）

### 文档标题与描述

标题：`Markdown 阅读器 MarkdownViewer`

描述：用于安全地将 Markdown 内容渲染为易读的标题、段落、列表、表格、
引用、链接和代码块，适用于说明文档、使用手册和详情介绍。

### 公共 API

```ts
interface MarkdownViewerProps {
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

首版支持常规 Markdown 与 GFM 表格、任务列表和删除线。内嵌 HTML 不解析为
真实节点，不执行脚本；代码围栏内部复用 `CodePreview`。新窗口链接必须带安全
的 `rel` 属性。`showOutline` 首版默认关闭。

### Demo

1. 基础文档：标题、段落、列表和引用。
2. 扩展语法：表格、任务列表、删除线和链接。
3. 代码块：多语言代码与复制。
4. 安全与状态：HTML 文本、加载和空内容。

## LogViewer（日志查看器）

### 文档标题与描述

标题：`日志查看器 LogViewer`

描述：用于观察持续变化的运行日志，支持日志等级、搜索筛选、手动刷新、暂停
跟随和长日志浏览。组件只负责展示和交互，不负责请求接口。

### 数据结构与公共 API

```ts
interface LogEntry {
  id: string;
  timestamp?: string;
  level?: "debug" | "info" | "warning" | "error";
  message: string;
}

interface LogViewerProps {
  logs: LogEntry[];
  status?: "idle" | "running" | "paused" | "success" | "error";
  loading?: boolean;
  refreshing?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
  autoFollow?: boolean;
  onAutoFollowChange?: (autoFollow: boolean) => void;
  searchable?: boolean;
  levelFilter?: LogEntry["level"][];
  showLineNumbers?: boolean;
  maxHeight?: number | string;
  emptyText?: ReactNode;
  className?: string;
  "aria-label"?: string;
}
```

搜索和等级筛选只处理已传入的数据。用户向上滚动查看历史日志后暂停自动跟随；
主动回到底部或点击继续跟随后恢复。`refreshing=true` 时刷新入口显示加载并禁用，
避免重复触发。

### Demo

1. 基础日志：时间、等级与行号。
2. 实时日志：本地 Mock 每两秒追加，支持暂停与继续跟随。
3. 手动刷新：本地模拟 800ms 刷新，覆盖加载、禁用和 Tooltip（文字提示）。
4. 搜索与等级筛选。
5. 空状态与错误状态。

Demo 的计时器只用于展示组件如何接收外部数据和状态，不代表组件内部会建立
请求或订阅。

## 视觉与组件边界

- `CodePreview` 使用浅色代码背景、等宽字体、工具区和正文滚动区。
- `MarkdownViewer` 默认不增加额外卡片外壳，正文容器由消费页面决定。
- `LogViewer` 使用深色日志视口；放入 `Modal`（弹窗）时由业务页面完成组合，
  `LogViewer` 不包含白色弹窗外壳。
- 颜色、字号、圆角、边框、间距和状态均使用现有 QIZHI 语义 Token。
- 按钮、输入框、选择器、Tooltip、加载和空状态必须复用公开的
  `@wangxiaojinger/qizhi-react` 组件，不使用原生交互控件或自写 SVG。
- Demo CSS 只负责布局，不能选择公共组件的私有 `__*` 后代节点。
- 三个组件只读，不提供编辑、保存、执行代码或写回数据能力。

## 文档与导航

三个组件登记在“基础组件 / 数据展示”类目中，使用现有 React 文档 Island、API
表和 Demo 注册方式。每个 Demo 必须完整复用 Button Demo 的公共操作区：

- `component-example-actions`；
- QIZHI `Button`、`CodeIcon`、`CopyIcon`；
- 两个 `qizhi-code-action`；
- 公共复制反馈、代码展开结构和高亮组件；
- 预览到操作区间距 12px，操作区右内边距 0px。

实际 Demo TSX 是预览、展示和复制的唯一代码源。

## 启智平台系统接入

“启智平台系统”的 Skill.md 文件预览改为真实消费：

```tsx
<CodePreview
  value={skillContent}
  language="markdown"
  showLineNumbers
  wrap
/>
```

平台继续负责 Skill 内容获取、错误处理和详情页布局。接入完成后删除该区域的
手写代码预览 DOM、私有组件选择器及平台私有 `--font-mono` 声明，不扩大到
其他业务页面。

## 依赖与安全

- `react-markdown` 负责 Markdown 到 React 节点的解析与渲染。
- `remark-gfm` 提供 GFM 表格、任务列表和删除线。
- `prism-react-renderer` 只负责代码语法着色，不引入编辑器。
- 不安装或启用 `rehype-raw`。
- 动态内容不通过 `dangerouslySetInnerHTML` 注入。
- 外链、下载和复制入口必须具备可访问名称、键盘焦点和结果反馈。

## 测试与验收

实现前必须增加并确认旧实现会失败的门禁，至少覆盖：

- 三个组件尚未从 `@wangxiaojinger/qizhi-react` 导出；
- 类型、实现、API 表、Demo 与展示代码不一致；
- Demo 使用原生交互标签、内联布局或跨组件私有选择器；
- 平台 Skill.md 仍使用手写预览或私有 `--font-mono`；
- Markdown 内嵌 HTML 被解析为真实元素。

实现后验证：

- CodePreview 的语言回退、行号、换行、滚动、复制、下载、加载和空状态；
- MarkdownViewer 的常规 Markdown、GFM、代码块、链接安全、HTML 文本、加载
  和空状态；
- LogViewer 的等级、搜索、刷新、刷新防重、追加、暂停跟随、恢复跟随、空状态
  和错误状态；
- `@wangxiaojinger/qizhi-tokens` 的等宽字体语义 Token 已登记并由组件与平台消费；
- API 表、类型、实现、公共导出、Demo、展示代码和复制代码同源；
- 启智平台 Skill.md 页面完成一次真实组件消费验证；
- 1440px、1024px、375px 三档下的直接子项几何、长文本、内部滚动、页面
  overflow、键盘、焦点、控制台和目标状态截图。

自动化与当前执行者验证通过后最高声明 `candidate_pass`；独立最终验收保持
`pending`。

## 不在本阶段处理

- 代码编辑器、Markdown 编辑器或日志命令行输入；
- 代码执行、保存、上传或写回；
- 日志接口、轮询、SSE、WebSocket 或后端协议；
- 运行日志业务页面和日志弹窗；
- Markdown 内嵌 HTML；
- 对既有文档站 UI 或其他业务页面进行重新设计。
