# Table compatible capabilities implementation plan

**Goal:** 以可选配置补齐 Qways 表格工程能力，保留既有默认行为；不提交、不推送、不发布。

**Architecture:** 复用原生 Table、Tooltip、Empty 与 ResizeObserver。纯数字分配继续输出确定 colgroup；文本增强仅处理显式启用且为字符串／数字的文本叶子，不裁切 render 中的控件。

**Tech Stack:** React / TypeScript / CSS / Vitest / Playwright。

**Spec:** 用户已确认的兼容方案；用户提供的《03-13-前端界面工程规范》第 4 节，修订副本见 `docs/specs/03-13-前端界面工程规范-修订版.md`。

## Constraints

- 保留全部现有未提交修改及原有 API 默认；业务 260/320px、8 条分页、游标、模型 ID/secret 不进入通用组件。
- 新增列级 shrink、shrinkPriority、growPriority：独立控制压缩权重与分配顺序；旧 grow 仍作为未指定 shrink 时的压缩权重。
- 新增 ellipsis 对象 rows: 1|2、tooltip: boolean；旧 true/showTitle 保留原生 title 语义。增强 Tooltip 仅实际截断时出现，支持 hover/focus/click/Esc。
- 新增 loading 对象 spinning/scope/tip，scope=body 保留表头；boolean 原行为不变。
- 新增 fixedBreakpoint（未设置不禁用）、emptyPadding（未设置保留原样）、emptyCell（未设置不代填）。
- 标准页面列表采用 fill；compact 保留为通用能力，但不得作为 Qways 页面级列表留白策略。所有列最大值总和不足时无法数学上同时铺满且守上限，必须指定未封顶的余量承接列。

## Review focus

1. 0/false/自定义 render 不被缺失值策略覆盖。
2. 容器而非 viewport 控制 fixedBreakpoint，动态变窄和变宽均恢复。
3. 两行字形与链接控件不被父层硬性限高；Tooltip 不泄漏已不截断的旧内容。
4. 无表头／初次加载／滚动下的数据区 loading 不覆盖表头，不冒充失败或空态。
5. 无 grow、全列封顶及空数据时不擅自改变历史列宽或业务回调。

## Tasks

- [x] 1. `tableLayout.ts/test.ts`：先失败测试独立 shrink、优先级、上限及非法输入，实施并保留历史分配测试。
- [x] 2. `TableCellText.tsx/test.tsx/css`：先失败测试纯文本 leaf、测量、重新测量和无截断不可聚焦，再实施 Tooltip 组合。
- [x] 3. `Table.types.ts/Table.tsx/table.css/Table.capabilities.test.tsx`：先失败测试 loading scope、missing values、空态 padding、容器固定列开关，实施集成；保留旧 Table.test.tsx。
- [x] 4. Table API、同源 Demo、契约、API manifest 同步；修订所提供规范的组件／业务边界，保留原文副本或提供修订版。
- [x] 5. 定向测试、类型检查、全量测试、构建；1920/1440/1024/375 浏览器测量／截图／控制台；完成验证记录并提供准确预览 URL。

执行：用户已明确要求本轮直接落地，主模型集成与验收，两个独立实现子任务按编排技能委派；不执行计划模板的 commit 步骤。

## Execution ledger

- Ruling: 在当前工作区集成，避免丢失前次 Table 尚未提交的左对齐修改；精确限制责任文件并保留 Chart／AutoComplete 的既有改动。不新建分支或复制其他业务工作。
- Task 1 candidate complete: 11/11 width tests；独立 reviewer 再运行同一组亦通过。首次 GREEN 暴露两处手算断言错误，主模型核对总预算后授权一次修正（700=200+220+280；非法 available=0 后独立 shrink 至120），算法未因此修改。
- Task 3 RED: 4/4 tests confirmed missing behavior（emptyCell、loading scope、emptyPadding、fixedBreakpoint）；实现已集成，等待文本模块共同运行 GREEN。
- Task 4 revision: 原始资料只读，生成完整规范修订副本；不写回或覆盖原附件，也不宣称业务项目已接入。
- Task 2 takeover: T1-Escape-pin correction_used=true 后复核发现跨焦点 Esc 仍会关闭父层。主模型接管，unit+真实浏览器RED复现，修正为可见期 capture Escape 并清理监听；独立review复跑12/12通过，无新可操作问题。
- Task 5 complete: 最终479文件/2802测试、24 Token测试、typecheck/build/API/diff检查通过；浏览器31通过2skip，补充动态容器和操作可达性7通过2skip。详见 docs/verification/table-engineering-capabilities-2026-10-27.md。
- Follow-up acceptance: 用户单独授权独立验收后仅本地提交。独立Chrome回归31通过2skip、15点容器探针、Modal/Drawer各2轮及23项定向单测通过；Table-only暂存快照去重后218文件/1139测试和24 Token测试、类型检查、构建均通过。共享文件只提交Table部分，其他未提交工作保留，不推送或发布。
