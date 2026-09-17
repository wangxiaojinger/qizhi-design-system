---
name: qizhi-page-builder
description: Use when a product requirement, PRD, user story, or page brief must become a QIZHI-consistent interactive static page, especially for list-management, detail, or form pages in the native HTML/CSS/JavaScript design-system workspace.
---

# QIZHI Page Builder

## 核心原则

将需求转换为有来源证据、可交互、可验收的 QIZHI 页面候选稿。不要把“视觉相似”当成组件复用，也不要把需求缺失内容写成已确认事实。

## 工作流

1. 定位项目根目录并从头读取 `AGENTS.md`。确认 `index.html`、`styles.css`、`script.js` 均存在；盘点现有改动，不覆盖用户内容。
2. 读取 [Page Spec 规则](references/page-spec.md)、[组件映射](references/component-map.md) 和 [验收合同](references/acceptance-rules.md)。
3. 运行 `python3 <skill-dir>/scripts/inventory_qizhi.py <项目根目录> --format markdown`，用当前源文件重新建立能力清单。不要依赖过期组件列表。
4. 将 PRD 转换为 Page Spec。区分已确认事实、可逆假设、未决问题与阻塞项。只有会显著改变主流程、权限、安全或返工成本的缺口才暂停询问；其余采用可逆假设并显式记录。
5. 按顺序选择实现：现有业务组件 → 现有基础组件组合 → 能力缺口。每个复用项记录 `index.html` 章节或行号、`styles.css` 行号、正式类名、`data-*`、ARIA 和对应初始化函数。没有结构与样式来源证据时不得称为 QIZHI 组件。
6. 首版仅生成列表管理、详情、表单页面。其他页面类型先报告缺口，除非用户明确授权扩展范围。
7. 输出到 `generated-pages/<页面英文短名>/`，不得修改规范站或全局 Token。使用 [Page Spec 模板](assets/page-spec-template.md) 和 [报告模板](assets/generation-report-template.md)。至少生成 `index.html`、`page-spec.md`、`generation-report.md`；需要页面专属样式或脚本时使用同目录 `styles.css`、`script.js`。
8. 只为页面布局和受控模拟数据编写局部代码。组件 DOM、状态类、公共样式和交互协议必须来自当前 QIZHI 源；复制公共样式时记录原始行号，不重新设计声明。页面局部类使用 `<slug>-page__*`，不得伪装成 `qizhi-*` / `qz-*` 公共组件。禁止 `arco-*`、命名空间 `ac-*`、内联事件、未经授权的依赖和新组件外观。
9. 对加载、空、错误、无权限、禁用及任务相关反馈状态作出覆盖；未定义的业务规则保持模拟并标记，不暗示后端接口已实现。
10. 运行 `python3 <skill-dir>/scripts/validate_output.py <输出目录>`，再执行项目要求的语法、结构、浏览器、键盘和 1440/1024/375 视口验收。查看目标状态截图后才能记录视觉结论。

## 判断边界

- 当前仓库是 QIZHI 规范站，不是线上业务平台壳层。缺少线上页面、截图或源代码时，只能声明“符合当前 QIZHI 组件规范”，不得声明与线上平台 1:1 一致。
- 缺少线上平台壳层证据时，从页面内容画布开始生成，不创造品牌头部、侧栏、全局导航或产品名称；只有获得参考后才复用对应壳层。
- 规范站示例类不自动等于正式组件 API。先识别组件主体、变体、状态与演示容器。
- 生成结果最高声明 `candidate_pass`；`independent_verification` 保持 `pending`，直到独立验证真实完成。
- 若需求要求生产接口、鉴权、数据持久化或发布，只生成前端候选稿并报告能力边界。

## 产品交付

最终只汇报：预览入口、已确认事实、关键假设、组件来源、能力缺口、实际验收结果和未完成项。不要用长篇实现过程代替可验证产物。
