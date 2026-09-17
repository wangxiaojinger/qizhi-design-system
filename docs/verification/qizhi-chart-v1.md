# 启智图表首版实施与验证记录

日期：2026-09-09。状态：candidate_pass（图表专项候选通过）；independent_verification: pending（独立最终验收待完成）。全库测试未全部通过。

## 已实现范围

导航为“基础组件 → 数据展示 → 图表”，页面内含已确认的 12 个示例；进度条归入数据展示，保留原锚点。公共入口导出 LineChart（折线图）、BarChart（柱状图）及对应类型。柱状图的普通、分组、堆叠使用同一组件的模式属性。

示例覆盖请求量、费用、输入／输出用量，均为演示数据。指标计算、数据请求和时间筛选仍由业务层承担。实现图例筛选、顶层提示、坐标和单位格式化、加载／空／错误状态、零值与缺失区分、响应式、键盘和触屏操作，以及完整数据表。

AntV G2（蚂蚁可视化图表引擎）5.4.8 仅作为内部依赖；颜色、文字、间距、线宽、提示与状态由启智变量和组件管理。未暴露引擎配置、类型或实例。

## 文件清单

| 文件或目录 | 用途 |
| --- | --- |
| `packages/qizhi-react/src/chart/` | 类型、数据规范化、引擎适配、两种图表、提示、样式和单元测试 |
| `packages/qizhi-react/src/index.ts` | 正式公共导出 |
| `packages/qizhi-react/package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml` | 引擎依赖与锁定；补全上游运行时 tslib（辅助函数库）依赖声明 |
| `packages/qizhi-tokens/src/tokens.json` | 注册五项图表尺寸与字号变量 |
| `apps/qizhi-docs/src/chart/` | 12 个实际源码示例、注册表、公共操作区、接口元数据及文档门禁 |
| `apps/qizhi-docs/src/api/component-api.json` | 生成的公共接口清单 |
| `index.html`、`apps/qizhi-docs/src/progress/ProgressDocsIsland.tsx` | 图表路由和导航、进度条分类 |
| `packages/qizhi-react/tests/chart-*-probe.ts`、`tests/fixtures/chart-engine/` | 实际引擎和适配器验证页 |
| `tests/e2e/chart-engine-probe.spec.ts`、`tests/e2e/chart-react-island.spec.ts` | 三视口图形与交互验证 |
| `docs/specs/qizhi-chart-design-v1.md`、`docs/specs/qizhi-chart-contract-v1.md` | 已确认设计与公共契约 |
| `docs/superpowers/plans/2026-09-09-qizhi-chart.md` | 实施清单 |

保留工作树既有改动；未提交或发布。生成文件遵循仓库现有忽略规则，截图和临时消费应用未加入源码。

## 实际检查

| 命令或检查 | 结果 |
| --- | --- |
| `pnpm exec vitest run packages/qizhi-react/src/chart apps/qizhi-docs/src/chart` | 4 文件、28 项通过；覆盖数据、公共属性、生命周期和文档门禁 |
| `pnpm typecheck` | 类型检查通过 |
| `pnpm api:validate` | 接口清单一致 |
| `pnpm --filter @wangxiaojinger/qizhi-tokens validate` | 341 项设计变量校验通过 |
| `pnpm build` | 全站、组件库及包消费冒烟构建通过；存在大文件体积提示 |
| `pnpm --filter @wangxiaojinger/qizhi-react build` | 最后纵轴文字修正后重新构建组件包通过 |
| `QIZHI_DOCS_BASE_URL=http://127.0.0.1:5188 pnpm exec playwright test tests/e2e/chart-engine-probe.spec.ts tests/e2e/chart-react-island.spec.ts --workers=1` | 1440／1024／375 三视口共 9 项通过，无页面运行错误 |
| `node --check script.js`、`git diff --check` | 语法和差异格式通过 |
| 独立临时消费应用通过公共包入口构建并启动 | 两种图表真实绘制；引擎只在首次挂载图表时请求；连续三次卸载后画布和提示均清理；触屏点击显示零值；无页面运行错误 |

开发前曾观察到缺失数据模型、公共导出和文档门禁失败，随后实现并复验。复验中一次命令遗漏服务地址变量、误连 5173 导致连接拒绝；改为实际 5188 后九项通过，该次属于运行命令错误。

浏览器实际检查了 12 个示例的默认状态、绘图区与直接子项宽高、操作区 12 像素间距和零右内边距、页面和示例溢出、图例不可全隐藏、状态恢复、键盘首尾及方向导航、提示关闭、数据表、真实剪贴板源码、路由返回。提示位于页面顶层，检查完整祖先裁切链和视口边界。

执行者查看了截图：手机纵轴千位数完整、日期首尾不越界；蓝色实线与紫色虚线清晰；分组和堆叠位置正确；费用小数、零值与缺失断线正确；加载、空、错误及打开态提示显示完整。此为实施者核对，不代替独立视觉验收。375 像素为浏览器模拟，未在实体手机上验收。

## 性能和体积边界

正式适配器在本机浏览器、固定 560 像素绘图区、四系列条件下测试每系列 7／31／1000 点，最后一轮绘制约 33／31–32／166–181 毫秒，销毁后画布数均为零。它是本机样本，不代表真实移动设备或服务等级承诺。

独立生产消费应用的引擎动态文件约 1,305 千字节，gzip（压缩）后约 387 千字节。已验证延迟请求，但首个图表仍承担该成本。首版以当前一至两个系列场景为主要视觉验证范围，未宣称无限系列颜色均可辨识。

## 全库失败与待验收

`pnpm test` 实际为 2,516 项通过、12 项失败（包含依赖软链接重复发现的用例）。涉及：

- 平台壳层滚动样式契约。
- 服务卡文字截断契约。
- 业务组件的服务状态与版本抽屉行为。
- 业务对象市场按钮文案定位。
- 业务指引旧文案契约。
- 布局示例旧顺序和说明契约。

这些失败所在实现未由本任务修改，但没有修改前完整测试基线，不能断言其回归因果。未扩大范围修复，也未将全库标为通过。

独立最终验收、实体设备与生产业务真实数据接入仍待完成。当前交付可在本地组件库图表页审阅。
