# QIZHI Steps React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站五个 Steps Demo 迁移为 QIZHI 公共 React 组件和同源文档 Island，并让 Modal 复用公共 Steps。

**Architecture:** 公共包负责步骤状态、尺寸、语义和响应式视觉；文档应用通过 raw import 读取实际 Demo TSX，复用公共代码操作区与 API 表；Modal 仅消费公共组件。

**Tech Stack:** React 19、TypeScript、CSS、Vitest、Testing Library、Playwright、Vite

**Spec:** `docs/specs/qizhi-steps-contract-v1.md`

## Global Constraints

- 五个 Demo 的标题、说明、顺序、数据、文案、布局、尺寸、初始状态和交互逐项保持。
- Demo 不自制 Button、Steps 或 SVG，不选择公共组件私有后代类。
- Demo TSX 是预览、展示和复制的唯一来源。
- 公共能力同步实现、类型、导出、API、测试和 E2E。
- 自动验证最高为 `candidate_pass`，独立最终验收保持 `pending`。

### Task 1: 公共 Steps 与 Button 图标位置

- [x] 先增加组件、类型和样式所有权测试并观察旧实现失败。
- [x] 实现 Steps 状态派生、语义、尺寸、响应式样式和公共导出。
- [x] 为 Button 增加 `iconPosition` 正式 API，并同步类型、文档与行为测试。
- [x] 运行组件测试和类型检查。

### Task 2: 同源文档 Island 与 Modal 复用

- [x] 建立五个实际 Demo TSX、registry、公共 codebox、API 表和 Island。
- [x] 替换静态 Steps 区块并移除旧 CSS/JS。
- [x] 将 Modal 私有步骤实现替换为公共 small Steps。
- [x] 锁定原始契约、代码边界、展示/复制同源和 Modal 消费路径。

### Task 3: 浏览器与全量验收

- [x] 在 1440、1024、375 三档验证尺寸、状态、键盘、边界、操作区、复制、溢出和控制台。
- [x] 截取并人工查看基础、错误、切换三个关键状态。
- [x] 运行全量 Vitest、生产构建、Modal 回归、脚本语法和 diff 检查。
- [x] 写入最终验收证据与状态。
