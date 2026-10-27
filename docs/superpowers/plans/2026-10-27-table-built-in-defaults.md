# Table Built-in Defaults Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

目标：将已确认的业务推荐配置变为 Table 自身默认值，业务显式属性优先，无需 preset 或逐项目封装。已发布 v0.4.0 不覆盖，本轮先交付本地候选，不自动提交、推送或发布。

设计：border=false、hover=true、showHeader=true、size=default；默认 resize=false、reorder=false、visibility=false，定制开关逐字段合并。表级 ellipsis 默认 {rows:2,tooltip:true}，列级显式 ellipsis 优先，false 自然换行，旧 true/showTitle 语义保留；仅字符串／数字启用文本叶子，保留复杂 render。fixedBreakpoint 默认640、false关闭；emptyPadding 默认36、emptyCell 默认 '-'、null可关闭；loading默认false、开启时默认body，可显式scope=table。不开分页、选择、行拖拽、列移动和列显隐，不推断业务列固定或权限。

- [x] 在 Table.defaults.test.tsx 添加默认生效、逐字段覆盖、复杂渲染、列与表省略优先级、缺失值、加载范围和容器断点测试，运行并确认失败。
- [x] 修改 Table.tsx、Table.types.ts；不改布局分配和交互核心算法。
- [x] 既有测试中需表达旧效果的场景显式关闭新默认；新增最小 Table 浏览器 fixture，覆盖三档及弹窗／抽屉。
- [x] 同步公开 API、规范、同源 Demo 和更新日志，生成 API manifest。文档执行器仅改已分配文档文件。
- [x] 定向测试／类型检查／完整测试／构建；真实浏览器检查默认列宽、两行截断、按需全文、调宽显隐移动按需、窄屏和覆盖后旧效果。
- [x] 主模型核对独立验收证据，给预览地址和未发布说明。
