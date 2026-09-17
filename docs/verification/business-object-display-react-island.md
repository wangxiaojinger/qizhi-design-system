# 对象展示 React Island 验证记录

- 状态：`candidate_pass`
- 独立最终验收：`pending`
- 验证日期：2026-08-31

## 本轮组件边界

对象展示现在由七个平级 Demo 直接调用七个正式业务组件：

1. `TaskCard`：任务卡；
2. `MarketplaceModelCard`：模型广场模型卡片；
3. `FinancialModelCard`：金融启智模型卡片；
4. `SkillServiceCard`：Skill 服务卡；
5. `ProjectCard`：项目卡；
6. `ResourceSpecificationCard`：资源规格确认；
7. `BillingBudgetCard`：计费规则费用预算卡片。

已删除“AI 资产与能力”“模型卡”“资源对象卡”三个组合层级及其说明。
模型广场、金融启智、Skill 服务、资源规格、计费与预算均使用独立 Demo TSX；
预览、展示代码和复制内容继续同源。

`ModelCard`、`ConfirmationSummary` 和 `ConfirmationSummaryGroup` 暂保留兼容
导出，但不再作为以上完整业务卡片的文档入口。Page Builder 已要求命中这些
场景时直接调用完整业务组件，不能重新选择变体或拆分组合。

## 自动验证

- 新组件 RED：组件包 TypeScript 最初以四个公共成员不存在而退出 1；
- 新组件 GREEN：根项目与组件包 TypeScript 均退出 0；
- `node scripts/build-component-api.mjs --check`：通过，92 个 API 组；
- Page Builder Skill 单元检查：11 项通过；
- 样式所有权确定性检查：正式卡片根样式位于组件包，旧静态站与 Demo CSS
  不再持有这些组件的私有后代样式；
- 根文档站 Vite 构建：通过，1597 modules transformed；
- `@wangxiaojinger/qizhi-react` Vite 构建：通过，587 modules transformed；
- `@wangxiaojinger/qizhi-react` 声明生成：通过；
- 对象展示 Playwright：1440、1024、375 三档共 3 项通过；
- 聚焦 Vitest 在 `threads` 与 `vmThreads` 两种 pool 下均停在 worker 启动，
  未进入测试用例后人工中止；不能计为测试通过或产品失败。
- `pnpm typecheck` / `pnpm exec playwright` 包装命令因 pnpm 联网元数据失败且
  无 TTY 时拒绝清理依赖而中止；未使用可能清空依赖的 `CI=true`。改用仓库
  已安装的 `tsc`、Vite 与 Playwright 直接入口完成同等检查。
- 根 TypeScript 在组件包声明产物未重建时曾报告 `@wangxiaojinger/qizhi-react/icon` 声明
  缺失；按正式顺序重建图标、组件包和声明后，根与组件包 TypeScript 均退出 0。

## 浏览器与视觉验证

- 文档标题已由“模型广场模型卡片”调整为“模型卡片”；模型卡桌面宽度由
  299px 调整为 320px，操作文案保持单行，窄屏按可用宽度自动改单列；
- 项目卡资源风险不再模拟 Alert 结构，已直接调用公共 `Alert` 的
  `type="warning" size="small" inline` 紧凑型警告提示；危险态对应
  `type="error"`；
- 计费规则确认的信息主体恢复 `color-fill-1` 公开变量背景，并保持 12px
  内边距和公共中圆角；
- 七个 Demo、七张 API 表和右侧八项锚点（含 API）顺序一致；
- 模型广场仍展示两张卡，固定操作顺序为“查看详情、快速体验、在线推理”；
- 金融启智保持默认标签与聚焦后“查看详情、去使用”操作；
- Skill 服务 Popover 在三档真实键盘聚焦打开，浮层位于视口内；逐级检查到 `body`
  未发现会裁切当前浮层越界部分的祖先；
- 项目卡四组状态、成员入口、风险提示和反馈路径保持不变；
- 资源规格卡保持 558px 桌面宽度、152px 主体高度、12px 内边距与间距；
- 计费规则和费用预算保持同一个 360px 业务卡片，内部两个区块宽 312px；
- 三档目标章节均满足 `scrollWidth <= clientWidth`，控制台无新增错误；
- 已人工查看三档完整章节、三档资源规格卡、三档计费预算卡和三档 Skill 服务
  打开态截图；未发现文字、阴影、圆角、箭头或卡片内容被裁切。

## 证据边界

- 当前为未提交的共享脏工作区，本记录只能证明当前文件与运行结果，不能用
  Git 提交范围证明历史归因。
- 自动化与执行者视觉检查最多声明 `candidate_pass`；独立最终验收仍为
  `pending`。
