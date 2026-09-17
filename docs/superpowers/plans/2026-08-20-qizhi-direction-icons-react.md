# QIZHI Direction Icons React Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Do not use subagents unless 林猫猫 explicitly authorizes delegation.

**Goal:** 将旧规范站已确认的 38 个方向指示类 SVG 迁移为可独立导入、文档同源且可供 AI 结构化检索的 QIZHI React 图标。

**Architecture:** 从已确认的旧站方向 SVG 建立只读源副本和唯一 manifest，经严格校验与生成器输出 React 组件、索引和机器元数据；`packages/qizhi-react` 是唯一公共实现，`apps/qizhi-docs` 只消费正式包和同一 manifest。

**Tech Stack:** React 19、TypeScript、Node ESM、Vitest、Testing Library、Vite、Playwright。

**Specs:**

- `docs/specs/qizhi-direction-icon-contract-v1.md`
- `docs/superpowers/specs/2026-08-20-qizhi-direction-icons-react-design.md`

## Global Constraints

- 本期严格限定为 38 个方向图标，不迁移其他分类。
- 旧站是只读视觉证据；从根静态站已修正分类提取，不以工作树陈旧快照覆盖。
- 生成文件禁止手改；源映射、manifest、生成器、导出、文档与复制代码必须一致。
- 保留所有并行未提交修改；不得覆盖现有手写图标或扩大公共 API。
- 遵循严格 TDD：每项能力先观察测试失败，再写最小实现。
- 用户可见文案默认中文，不显示源码文件名、路径或语言徽标。
- 所有结论只按实际测试与截图声明，最高为 `candidate_pass`。

---

### Task 1: 锁定 38 个源 SVG 与兼容边界

**Files:**

- Create: `packages/qizhi-react/src/icon/source/direction/*.svg`
- Create: `packages/qizhi-react/src/icon/source/direction/source-map.test.ts`
- Create: `packages/qizhi-react/src/icon/source/direction/README.md`
- Inspect only: 根静态站 `index.html`
- Inspect only: `packages/qizhi-react/src/icon/*.tsx`

**Produces:** 38 个按旧站节点一一映射的只读 SVG 源文件，以及现有手写图标名称/导出冲突清单。

- [ ] 编写失败测试，断言方向源数量为 38、每项具有 `viewBox`、不含脚本/外部 URL，并记录唯一旧站节点 ID。
- [ ] 运行目标测试，确认在源目录尚不存在时失败。
- [ ] 从根静态站已确认的方向区块逐项提取 SVG，不改变路径、颜色、透明度和顺序。
- [ ] 记录旧名称、节点 ID、旧分类及源文件校验值，证明源副本可追溯。
- [ ] 搜索现有 `src/icon` 的组件名和公共导出；发现拟用名称冲突时停止并修订 manifest，不覆盖文件。
- [ ] 重跑源测试，确认 38 项基础证据通过。

### Task 2: Manifest、命名映射与 AI 查询契约

**Files:**

- Create: `packages/qizhi-react/src/icon/IconManifest.types.ts`
- Create: `packages/qizhi-react/src/icon/direction-icons.manifest.ts`
- Create: `packages/qizhi-react/src/icon/direction-icons.manifest.test.ts`
- Create: `packages/qizhi-react/src/icon/findIcon.ts`
- Create: `packages/qizhi-react/src/icon/findIcon.test.ts`

**Produces:** 38 项唯一 manifest、稳定机器 ID、开发者组件名、中英文别名和确定性查询函数。

- [ ] 编写失败测试，覆盖 38 项数量、ID/组件名/旧节点唯一性、分类计数、命名后缀、源文件存在和 `importPath`。
- [ ] 编写失败测试，覆盖中文/英文/别名/结构化查询、唯一结果、多个候选和无结果。
- [ ] 运行两组测试，确认 manifest 和查询实现缺失导致失败。
- [ ] 按已审定 38 个命名族建立 manifest，不新增旧站不存在的图标。
- [ ] 实现纯函数查询；结果不唯一时返回候选，不做隐式首项选择。
- [ ] 重跑测试，确认 manifest 和 AI 查询契约通过。

### Task 3: SVG 校验器与 React 生成器

**Files:**

- Create: `packages/qizhi-react/scripts/validate-direction-icons.mjs`
- Create: `packages/qizhi-react/scripts/build-direction-icons.mjs`
- Create: `packages/qizhi-react/scripts/direction-icons-generator.test.ts`
- Create: `packages/qizhi-react/src/icon/QizhiIcon.types.ts`
- Create: `packages/qizhi-react/src/icon/useIconIds.ts`
- Modify: `packages/qizhi-react/package.json`

**Produces:** 可重跑、确定性、遇到未知图形即失败的方向图标生成流程。

- [ ] 编写生成器失败测试，覆盖缺失 `viewBox`、脚本、外部资源、未知颜色、重复/失效 ID、名称冲突和非 38 项输入。
- [ ] 编写快照或重复运行测试，证明相同输入产生字节一致输出。
- [ ] 运行目标测试，确认生成器尚不存在时失败。
- [ ] 实现 SVG 解析与校验：保留几何和透明度，移除固定宽高，安全转换 `currentColor`，删除未引用 ID。
- [ ] 对仍被引用的 ID 生成运行时唯一前缀，避免同图标重复渲染冲突。
- [ ] 输出 `forwardRef` 组件，执行 `size`/宽高优先级和无障碍默认值。
- [ ] 为包增加明确的校验/生成命令，不引入另一套构建系统。
- [ ] 重跑生成器测试，确认全部通过且没有改写现有手写图标。

### Task 4: 生成 38 个组件与公共导出

**Files:**

- Create: `packages/qizhi-react/src/icon/generated/*.tsx`
- Create: `packages/qizhi-react/src/icon/generated/index.ts`
- Create: `packages/qizhi-react/src/icon/iconManifest.ts`
- Create: `packages/qizhi-react/src/icon/DirectionIcons.test.tsx`
- Create: `packages/qizhi-react/src/icon/DirectionIcons.types.test.tsx`
- Modify: `packages/qizhi-react/src/icon/index.ts`
- Modify: `packages/qizhi-react/src/index.ts`
- Modify: `packages/qizhi-react/package.json`
- Modify: `packages/qizhi-react/vite.config.ts`

**Produces:** 38 个 `XxxIcon`、共享 Props/manifest/query 导出，以及 `@wangxiaojinger/qizhi-react/icon` 子路径。

- [ ] 编写失败单元测试，覆盖默认 `1em`、`size`、单轴覆盖、`currentColor`、原生属性、class/style、ref 和禁止 children 的类型契约。
- [ ] 编写失败无障碍测试，覆盖默认隐藏、`title`、`aria-label`、`aria-labelledby`、`role="img"` 与重复 ID。
- [ ] 编写失败导出测试，覆盖根入口、图标子路径及 38 个 manifest 项均能解析到对应组件。
- [ ] 运行目标测试，确认组件/导出尚未生成时失败。
- [ ] 执行生成器，生成 38 个 TSX 与索引；人工抽查每个命名族至少一个线性和填充组件。
- [ ] 接入根入口及 `@wangxiaojinger/qizhi-react/icon` 子路径，确保不破坏现有图标导出。
- [ ] 重跑类型、组件与导出测试，确认通过。

### Task 5: React 图标文档、搜索与复制同源

**Files:**

- Create: `apps/qizhi-docs/src/icon/IconDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/icon/IconGrid.tsx`
- Create: `apps/qizhi-docs/src/icon/IconPreview.tsx`
- Create: `apps/qizhi-docs/src/icon/iconDocs.registry.ts`
- Create: `apps/qizhi-docs/src/icon/iconDocs.css`
- Create: `apps/qizhi-docs/src/icon/iconDocs.test.tsx`
- Create: `apps/qizhi-docs/src/icon/main.tsx`
- Modify: `index.html`

**Consumes:** `@wangxiaojinger/qizhi-react/icon` 的 38 个组件、manifest、查询函数，以及现有正式 Button、CodeIcon、CopyIcon 与公共反馈协议。

**Produces:** 只展示方向类图标的 React Island，支持搜索、筛选、预览与复制。

- [ ] 先建立“旧站可见元素 → React 可见元素”测试夹具，禁止引入旧站或公共文档规范之外的额外工具栏与标题。
- [ ] 编写失败文档测试，覆盖 38 项顺序、中文/英文/别名搜索、方向/样式/状态筛选、无结果和 manifest 同源。
- [ ] 编写失败复制测试，断言导入语句与 JSX 使用中的组件名、路径均来自当前项，不显示 `Demo.tsx` 或路径标题。
- [ ] 运行文档测试，确认文档岛尚不存在时失败。
- [ ] 实现文档岛并复用正式公共组件；图标容器使用旧站默认灰色，使 `currentColor` 下的预览与旧站一致。
- [ ] 挂载后触发 `qizhi:react-island-ready`，同步右侧目录，不改变文档壳层信息架构。
- [ ] 重跑文档测试，确认通过。

### Task 6: 旧站与 React 的视觉对照

**Files:**

- Create: `apps/qizhi-docs/src/icon/DirectionIconComparison.tsx`
- Create: `apps/qizhi-docs/src/icon/directionIconVisual.test.tsx`
- Create: `tests/e2e/direction-icons-visual.spec.ts`

**Produces:** 可重跑的 38 项同序对照及 16/24/32px 视觉证据。

- [ ] 编写失败测试，断言每个 manifest 项均有旧站源预览与 React 组件预览，顺序和尺寸一致。
- [ ] 在相同颜色、尺寸和容器条件下生成 16/24/32px 对照，不以 DOM 存在代替视觉检查。
- [ ] 运行视觉测试，先确认能够暴露未完成或图形差异。
- [ ] 修正 manifest 或转换规则后重新生成；禁止直接编辑生成 TSX。
- [ ] 对 38 项逐组人工检查轮廓、比例、留白、方向、透明度和填充关系。
- [ ] 记录任何无法自动判断的差异和人工结论。

### Task 7: 三视口交互、全量验证与交付记录

**Files:**

- Create: `tests/e2e/direction-icons-react-island.spec.ts`
- Create: `docs/verification/direction-icons-react-island.md`

**Produces:** 可重跑的行为、响应式、截图和 `candidate_pass` 证据。

- [ ] 编写 Playwright 测试，覆盖 1440/1024/375 的搜索、筛选、预览、复制、键盘焦点、无结果恢复、页面溢出和控制台。
- [ ] 启动 `pnpm dev`，运行目标 E2E，先确认测试能暴露未满足的浏览器契约，再修正实现。
- [ ] 执行 `node --check script.js`、方向图标目标测试、文档测试、`pnpm typecheck`、`pnpm test`、`pnpm build` 和包子路径 smoke build。
- [ ] 分别截取并实际查看 1440/1024/375 的图标网格、搜索结果、筛选结果和复制反馈截图。
- [ ] 检查每档页面与网格横向溢出、直接子项尺寸、文字截断、焦点可见性和控制台错误。
- [ ] 将命令、通过数、截图人工结论、已知限制和未执行项写入验证文档。
- [ ] 仅在所有实际门槛满足时标记 `candidate_pass`；人工确认和独立验证保持真实状态。
