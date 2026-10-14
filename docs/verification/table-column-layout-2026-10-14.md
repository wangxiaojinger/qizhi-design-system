# Table 列宽与自适应验证记录

日期：2026-10-14。状态：Table 已声明支持组合且宽度预算合法的范围通过独立验收。记录针对提交前的本地源码，不代表包发布或文档站部署。首次候选结果及失败历史保留下方，本轮独立复核见末节。

## 改动范围

- `Table.types.ts` / 包入口：新增可选 minWidth、maxWidth、grow、align、tableLayout、layoutMode 及其类型导出。
- `tableLayout.ts`：确定性数字列宽分配，支持权重、上限、缩减至下限和 compact 预算；不测量当前页数据。
- `Table.tsx` / `table.css`：colgroup、无表头宽度、真实列宽累计固定偏移与对齐；保留默认 fixed/fill、换行、ellipsis、选择、展开、排序和分页。
- Table API、生成清单、契约及 Page Builder 规则：同步能力与合法组合。
- 同源第 12 个 LayoutDemo 和复制代码；BasicDemo 采用稳定列预算加姓名 grow，保留数据、标签与操作语义。
- `tableDocs.css`：Table 文档网格改为 minmax(0,1fr)，避免继承 760px 网格后在手机上被祖先裁切。
- `index.html`：新增 2026-10-14 本地候选更新日志。保留任务前已有 AutoComplete 等改动。

## 首次候选自动化结果（历史）

| 检查 | 结果 |
| --- | --- |
| Table 单元、分配算法和文档测试 | 3 文件 / 31 项通过 |
| 工作区与组件包 typecheck | 通过 |
| API 清单生成 / --check | 115 组生成，一致性通过 |
| 包导出检查 | 通过 |
| script.js 语法 / git diff --check | 通过 |
| 文档站、tokens、React 包及 smoke consumer build | 通过，保留已有大 chunk 警告 |
| Tokens 测试 | 24 项通过 |
| 最终仓库全量 Vitest | 469 文件通过、1 文件失败；2730 项通过、1 项失败 |
| 单独复跑 Popover 文件 | 18 项通过；不将它计为全量复跑通过 |
| Table 浏览器回归 | Chrome，1440/1024/375，24/24 通过 |

最终全量失败：`packages/qizhi-react/src/popover/Popover.test.tsx` 的 `opens by hover and keeps the portal content interactive`，217 行断言找不到 dialog。Popover 不在本次修改范围内；该任务较早一轮完整全量测试曾 2731/2731 通过，但最终结果仍必须记录为有 1 项失败，不能用单独复跑覆盖。

运行 pnpm 时使用 `pnpm_config_verify_deps_before_run=false`，避免当前 pnpm 11 环境自动重装已有依赖目录。没有修改依赖或锁文件。

浏览器命令：

```sh
QIZHI_DOCS_BASE_URL=http://127.0.0.1:5178 ./node_modules/.bin/playwright test tests/e2e/table-column-layout.spec.ts tests/e2e/table-react-island.spec.ts --workers=2
```

## 浏览器与截图核对

新增夹具验证：3/5/10 列、固定列包含选择与展开结构、左右各多个固定列、不同行宽预算、容器缩窄、有无表头、默认及显式对齐、分页、排序、空态、加载和异步数据更新。约束列宽在状态/数据变化中保持稳定；达到最小预算后内部滚动；同列 th/td 宽差不超过 1px；固定列累计偏移与实际宽度一致，无相互覆盖。

既有套件验证：基础操作、标签 Tooltip、排序、选择、展开、合并、树形、嵌套、指针拖拽、密度及组件 Token 覆盖。新 Demo 验证公开组件真实调用、复制源码和父子容器尺寸。

截图已逐档查看。修复前手机 Demo 为 760px、父容器为 303px，页面 scrollWidth 没有超出并不能证明内容可见；新增直接尺寸断言能捕获该问题。修复后在真实 375px 视口复核：文章与父容器均为 303px、表格滚动容器为 277px、表格宽度预算为 712px，溢出由内部滚动承载。基础 Demo 的未声明列此前会被 280px 标签列挤压，补充明确预算后手机真实点击/悬浮通过。

截图位于忽略的 `test-results/`：新布局 Demo 各档 `table-layout-demo.png` 与独立夹具 `table-layout.png`。文档长元素截图中固定头可能出现拼接叠加，因此同时查看真实手机视口画面；不把拼接伪影当作组件本身重叠。

## 能力边界与未验证项

- 数字约束仅用于 fixed 且所有 width 数字/缺省的组合；auto 原生模式不应用 maxWidth/grow。
- 左右固定列加前置辅助列的实际总宽须小于容器；辅助列自身仍随内容滚动；跨固定边界的合并单元格不在新增保证范围。
- 没有运行整个仓库的全部组件 E2E、其他浏览器或大数据性能基准。独立验收范围见末节。
- Table 默认兼容旧配置，业务使用新增约束需显式配置；没有批量修改消费项目。
- 首次候选全量测试曾有 Popover hover 失败，保留原始结果；本轮提交前检查结果以末节为准。

## 本轮独立验收与提交前复核

验收者为未参与实现的独立代理 `table_independent_acceptance`。主模型另行核对报告、实际尺寸与新截图。独立验收脚本不修改仓库，未依赖原有“通过”结论；两条自建 Chrome 检查脚本修复后均 exit 0，最终结论 pass，限实际测试范围。

独立发现并修复两项：

1. `onCell.style.textAlign="center"` 与 `column.align="right"` 混用时，td 层虽然居中，内部 Flex 仍靠右。真实文字中心断言和新增单元测试先失败；修复 data-align 的单元格覆盖优先级后，文字中点误差 0.0078125px，表头仍保持列级对齐。
2. 官网多固定列 Demo 在 375px 初始位置把前置选择列预算遗漏：业务固定 256px + 选择 48px 超过 277px 容器，重叠 27px。Demo 调整为固定 80/80/64px + 选择 48px，总 272px，取消多余 scrollX，列声明总预算自动得到 856px。公开 API、契约与生成规则同步要求计入前置辅助列。保留运行时 fixed 行为，不承诺任意超预算配置能自动避让。

独立实际尺寸：

| 案例 | 实际结果 |
| --- | --- |
| 600px 容器，固定100、grow权重1/3 | 100/175/325px |
| 同视口缩到420px | 100/130/190px |
| grow全部达到max | 100/150/200px，表格450px，容器剩150px留白 |
| 1440/1024/375官网滚动容器 | 790/554/277px；可见容器处于祖先裁切边界内 |
| 375px初始固定列 | 第二左列 x177..257，右列 x262..326，间隔5px |
| 375px滚动90及末端579px | 左列 x49..129、129..209，右列 x262..326，不重叠 |
| 300px夹具容器 | 160/96/120px，内部总宽376px |

检查覆盖 19 组独立列宽/数据/容器尺寸记录及真实文字中心断言；另有三视口×起点/中段/末端共9组固定列与祖先裁切检查。独立验收者和主模型均查看新局部截图。原始读回与截图目录名为 `qizhi-table-independent-acceptance-green`，历史失败证据保留在旧目录，不作为源码提交。

维护的回归测试已补充同一 cell 覆盖路径和官网固定列三个滚动位置：Table 单元、算法和文档测试 32/32，通过；Table Chrome 1440/1024/375 浏览器回归 24/24，通过。工作区与组件包类型检查、API 清单一致性、包导出、语法、diff 检查和构建通过，构建仍有既有大 chunk 警告。

提交前最终全量 Vitest：使用 `vitest run --maxWorkers=4`，470 个文件、2734 项全部通过；Tokens 24 项通过，类型检查与构建通过。这是当前共享工作区的实际结果，其他未提交改动不纳入本次 Table 提交；历史 Popover hover 失败没有被删除或改写。
