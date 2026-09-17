# QIZHI MarkdownViewer API 契约 v1

状态：已审定  
负责人：QIZHI Design System  
证据日期：2026-09-07

## 1. 目标与边界

`MarkdownViewer`（Markdown 阅读器）用于安全渲染说明文档、使用手册和详情介绍。
v1 支持常规 Markdown、GFM 表格、任务列表、删除线和代码围栏；不提供编辑，
也不解析 Markdown 内嵌 HTML。

## 2. 公共 API 与状态

公共属性以 `MarkdownViewerProps` 为唯一类型来源。状态优先级为加载、空内容、
正文。`showOutline` 默认关闭，只收集二级与三级标题；重复标题生成稳定且唯一的
锚点。`openLinksInNewTab` 开启时，链接同时具备安全 `rel` 属性。

## 3. 安全与复用

- Markdown AST 中的 HTML 节点转换成文字节点，不创建真实 HTML 元素。
- 不使用 `dangerouslySetInnerHTML`、`rehype-raw` 或脚本执行能力。
- 围栏代码复用 `CodePreview`（代码预览）；未知语言回退为纯文本。
- 表格只在组件内部横向滚动，不让页面产生横向溢出。

## 4. 测试矩阵

- 标题、段落、列表、引用、表格、任务列表、删除线和链接；
- 代码围栏与 CodePreview 复用；
- HTML 文字显示与真实元素缺失；
- 安全外链、目录锚点、加载和空状态；
- 1440、1024、375 三档排版、滚动、键盘、控制台和截图。
