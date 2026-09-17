# QIZHI Descriptions React Island 验证记录

日期：2026-08-21  
工作区：`.worktrees/button-react-island`  
分支：`feat/button-react-island`  
最终本地服务：`http://127.0.0.1:5176/`

## 交付范围

- `@wangxiaojinger/qizhi-react` 正式 `Descriptions`、`Descriptions.Item`、类型和样式。
- 旧站 2 个 Demo、3 组描述列表、12 个字段、同源 TSX、查看/复制代码和结构化 API。
- 基础 Demo 的“运行中”直接复用 `@wangxiaojinger/qizhi-react` 正式 `Tag color="green"`，未传入局部 style 或 Demo 专属 Tag 类。
- 1440、1024、375 三档布局、代码键盘展开、控制台和截图验收。

## 自动检查

| 检查 | 命令 | 结果 |
|---|---|---|
| 原生脚本语法 | `node --check script.js` | exit 0 |
| HTML 结构 | Node ID/hash/aria-controls 检查脚本 | 635 个 ID；重复 0；缺失 hash 0；缺失 aria-controls 0 |
| 全量组件与文档测试 | `pnpm test` | 129 个测试文件、644 项测试全部通过 |
| TypeScript | `pnpm typecheck` | exit 0 |
| 官网、组件包和 smoke 构建 | `pnpm build` | exit 0；包含 `dist/descriptions/Descriptions.js`、类型声明和 `dist/qizhi-react.css`；smoke bundle boundary 通过 |
| Descriptions 三视口 E2E | `QIZHI_DOCS_BASE_URL=http://127.0.0.1:5174 pnpm exec playwright test tests/e2e/descriptions-react-island.spec.ts` | 6/6 通过 |
| 全量 E2E | `QIZHI_DOCS_BASE_URL=http://127.0.0.1:5176 pnpm e2e` | 90/90 全部通过；Descriptions 6 项全部通过 |
| 差异格式 | `git diff --check` | exit 0 |

构建存在 Vite 主 chunk 大于 500kB 警告；构建仍以 exit 0 完成。Playwright 报告 `NO_COLOR` 被 `FORCE_COLOR` 覆盖的环境提示，不属于页面控制台错误。全量套件运行时 Vite 服务 stdout 还记录了图标页动态模块加载和 ResizeObserver 提示；Descriptions 两个用例独立收集到的 console error 与 page error 为 0，本次未将服务级提示误报为 Descriptions 已修复。

## Descriptions E2E 实测

- 2 个 Demo 顺序、标题和说明保持；页面共有 3 组正式 Descriptions 与 12 个 Item。
- 1440/1024 下三组字段容器均为三列；375 下均为单列。
- 三组根节点实际宽度均不超过 720px。
- 标题为 16px/24px；字段为 14px/22px。
- 右对齐实例的首列为 72px，标签最终 `text-align: right`。
- 垂直实例 Item 行间距为 6px，标签伪元素不显示冒号。
- “运行中”位于正式 `.qizhi-tag-green.qizhi-tag-size-default`，实际高度 24px。
- 查看代码按钮可通过 Tab 焦点与 Enter 展开；代码内容来自对应 TSX raw source，不显示文件名标题。
- 初始态和代码展开态三档视口均满足 `documentElement.scrollWidth <= clientWidth`。

## 截图与人工复核

完整组件页：

- `test-results/descriptions-react-island--6f31f-ns-保持两组旧站-Demo、三组列表和三档响应式几何-desktop-1440/descriptions-desktop-1440.png`
- `test-results/descriptions-react-island--6f31f-ns-保持两组旧站-Demo、三组列表和三档响应式几何-narrow-1024/descriptions-narrow-1024.png`
- `test-results/descriptions-react-island--6f31f-ns-保持两组旧站-Demo、三组列表和三档响应式几何-mobile-375/descriptions-mobile-375.png`

代码展开态：

- `test-results/descriptions-react-island-Descriptions-文档代码操作保持同源且可键盘使用-desktop-1440/descriptions-code-desktop-1440.png`
- `test-results/descriptions-react-island-Descriptions-文档代码操作保持同源且可键盘使用-narrow-1024/descriptions-code-narrow-1024.png`
- `test-results/descriptions-react-island-Descriptions-文档代码操作保持同源且可键盘使用-mobile-375/descriptions-code-mobile-375.png`

已逐张人工查看：桌面和窄屏三列结构、手机单列结构、标题和说明换行、右对齐标签、垂直标签和值、正式绿色 Tag、代码高亮、焦点边界和 API 表均可辨认；手机 API 表在自身滚动容器内横向滚动，页面没有水平溢出；未发现字段、Tag、按钮或代码区被裁切。展开态视口截图保留真实固定页头，代码区没有被页头覆盖。

## 状态与限制

```text
verification_after_implementation: candidate_pass
independent_final_verification: pending
```

- Descriptions 约定范围内的组件、Tag 复用、文档、类型、构建、三视口浏览器布局、键盘代码展开和截图均有通过证据。
- v1 按审定契约不提供任意列数、跨列、数据数组、边框、尺寸、冒号开关、加载、编辑或折叠能力。
- 未执行独立审查；本记录由实现执行者生成。
