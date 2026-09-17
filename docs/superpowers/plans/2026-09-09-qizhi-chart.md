# 启智图表实施计划

> 执行方式：当前主模型按 executing-plans（执行计划）技能推进；文档子任务依模型协作技能并行执行。

**目标：** 实现已确认的两种公共图表与 12 个同源示例。
**架构：** 数据模型、引擎适配、React（界面）组件分离；引擎动态加载，业务只消费启智导出。
**技术：** 现有 React、TypeScript（类型系统）、Vite（构建）、Vitest（单元测试）、Playwright（浏览器测试），首选 G2 引擎。
**规格：** `docs/specs/qizhi-chart-design-v1.md` 与 `qizhi-chart-contract-v1.md`。

## 固定约束

不改已确认文案和数据，不覆盖已有改动，不发布或提交；12 个示例保持顺序，默认绘图区 280 像素，间距 8／12 像素，三视口 1440／1024／375。新增变量登记，不暴露引擎类型。

## 1. 引擎与数据模型

文件：`packages/qizhi-react/src/chart/chartModel.ts`、`chartModel.test.ts`、`chartEngine.ts`。
- [x] 安装指定 G2 5.4.8，读取实际类型。
- [x] 写失败测试：`expect(normalizeChart(data, series).categories).toEqual(["b", "a"])`，重复点应返回错误，缺失点为 null，原始输入不变。
- [x] 执行 `pnpm exec vitest run packages/qizhi-react/src/chart/chartModel.test.ts`，确认功能缺失导致失败。
- [x] 实现模型并通过测试；先在本地临时验证页绘制五种形态，检查缺失、零与负值。

## 2. 正式组件

文件：图表目录的类型、组件、样式、行为测试，以及公共入口和设计变量清单。
- [x] 写失败测试，验证公共导出存在、加载压过错误、图例恢复、不可全隐藏、数据表及格式化。
- [x] 实现 LineChart（折线图）、BarChart（柱状图）、内部 ChartView（共享视图），复用 Button、Spin、Empty、Alert、Table。
- [x] 实现独立顶层提示、键盘导航及尺寸观察；快速数据更新取消过期渲染，卸载清理。
- [x] 运行针对性单元测试并核对所有属性有运行语义。

## 3. 文档与导航

文件：`apps/qizhi-docs/src/chart/`、`index.html`、进度条分类文字；文档子任务独占。
- [x] 先写缺失门禁，再从规格逐字生成 12 个完整源示例及接口元数据。
- [x] 复用按钮示例操作区；导航只到图表，进度条移动不改锚点。
- [x] `pnpm api:build` 与 `pnpm api:validate` 同步清单。

## 4. 验收

文件：`tests/e2e/chart-react-island.spec.ts`、图表验收报告。
- [x] 执行类型检查、单元测试、构建；新旧失败分别记录。
- [x] 真实浏览器测试 12 示例、图例、悬停、键盘、复制、状态恢复与路由，检查三视口尺寸和裁切链并查看截图。
- [x] 构建后以消费应用验证公共包与样式入口；记录 G2 引擎体积、生命周期和性能测试。
- [x] 核对最终文件与需求；交付候选结果，独立人工验收保持待验收。

实施证据与未通过项见[验证记录](../../verification/qizhi-chart-v1.md)。独立最终验收保持待完成。
