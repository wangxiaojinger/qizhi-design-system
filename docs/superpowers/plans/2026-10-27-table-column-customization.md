# Table 用户列布局定制实施计划

**Goal:** 用户已确认开发列移动、独立调宽、列显隐及可序列化布局；业务规则可选启用，默认完全兼容。后续已授权独立验收通过后仅提交本次 Table 相关改动，不推送或发布。

**Architecture:** 保留原生 Table，不替换底层、不增加依赖。纯规范化模型与状态控制、表头手势、可组合设置面板分层；核心不读写存储。只改 Table 及其文档、规范、Demo、测试，保留现有 Chart/AutoComplete 改动。

**Spec:** 用户确认的推荐方案：手动宽度优先，允许必要留白／内部滚动；新增 Demo 采用 Qways 模型目录业务场景，原兼容示例保留。

## 接口与固定约束

- 现有 TableLayout=fixed|auto 不变。新增 TableColumnLayoutState {schemaVersion:1,columnOrder,columnWidths,columnVisibility}，Table props: columnCustomization、columnLayout、defaultColumnLayout、onColumnLayoutChange、treeColumnKey。
- columnCustomization 的 reorder/resize/visibility/settings 独立开启且默认false；renderSettings接收完整入口，可Portal到现有工具栏；locale支持文案替换。
- 列级 movable/resizable/hideable 默认true（仅对应功能开启时）；defaultVisible默认true，settingsLabel供ReactNode标题使用；layoutRole默认data，action不计最少数据列。布局状态显式传入时即启用只读布局，不强制开启交互。
- 受控提交由columnLayout决定，default仅首轮；外部回传／规范化不回调。真正有效提交一次一个全量独立快照，reason=order/width/visibility/reset；无变化或取消不提交。
- 顺序包含隐藏列，固定区域及不可移动列形成不可跨越的连续段；当前有效列定义／权限优先，旧key清除，新增列在所属段按定义顺序追加。重复或空key的列定义禁用定制，不通过下标补key。
- 手动尺寸仅改变目标列，按当前min/max钳制；无显式min时拖拽下限64px，不能把当前width作为下限。原始自动预算先按容器计算，再以manual px覆盖（不让grow/shrink二次改写）；其余自动列沿用原预算。只要有manual尺寸，固定算法及明确总宽避免浏览器分摊；全表auto/%列首次拖拽冻结本次实际像素基准，但不把未手动列保存为用户尺寸。
- 调宽预览使用DOM colgroup和fixed offset更新，不每个pointermove重渲染全部行；mouseup提交一次，cancel/unmount/列权限或外部布局变更取消，普通等价columns重建不取消或重置。
- 树形入口锚定stable key并保留可见；横向colSpan冲突时保留原完整列顺序与可见性，禁用移动/显隐，调宽保留。rowSpan或仅onCell样式不一刀切禁用。不新增分组／虚拟滚动能力。
- 恢复默认来自当前列定义，不来自defaultColumnLayout缓存；同时清manual/order/visibility，合法规范化后一次reset事件。

## 文件责任及任务

- [ ] A. `columnLayoutModel.ts/test.ts`：先RED，后实现 normalizeColumnLayout、moveColumnLayout、setColumnLayoutWidth、setColumnLayoutVisibility、defaultColumnLayout、columnLayoutEqual、columnResizeBounds。纯函数不变异参数，防unknown/重复/key特殊值，保护固定段、锁列、最少数据列。
- [ ] B. `ColumnResizeHandle.tsx/test.tsx/css`：先RED；独立右边界手柄，pointer capture/window外mouseup/cancel/unmount、键盘箭头8px/Shift1px/Home/End，不误触数据排序和行拖拽。
- [ ] C. `ColumnSettings.tsx/test.tsx/css`：先RED；复用Popover/Checkbox/Button/InputNumber，显隐、全选、前后移、数值宽度、恢复默认；焦点管理和Esc；可Portal入口，不读存储。
- [ ] D. 主模型 `useColumnLayout.ts` 和 Table 集成／类型导出／回归：控制、动态列规范化、手动预算、预览、拖动插入反馈、树／合并限制；选择排序分页等行为不重置。
- [ ] E. 单个模型目录业务Demo＋可运行作用域隔离localStorage受控示例；演示数据非真实报价，公开ID不包含secret。文档与API manifest、工程规范同步默认优先级及业务边界。
- [ ] F. 单测、类型、构建、去重全量测试；Chrome1440/1024/375/1920实测拖动、首尾调宽、几何、固定偏移、面板、独立开启、恢复、损坏配置与权限变更；独立复核后交付预览和范围声明。

## Review focus

1. 手动宽度不得被新columns数组、刷新或容器变化冲掉；raw column.width不是用户布局重置指令。
2. colSpan与树入口的物理下标依赖不能误位，内部选择／展开列不进入持久化。
3. 初始化、外部恢复和取消不产生保存事件；受控未回传不先假装提交成功。
4. scope切换和StrictMode不把旧布局写到新key；localStorage不可用和JSON损坏不影响操作。
5. 拖动只从独立手柄启动，首尾resize区域在裁切边界内可达，面板Esc仅关闭本层。

执行：用户已明确要求按推荐方案直接落地。主模型负责设计、Table集成与验收；三个独立实现阶段按编排技能委派，责任文件不重叠。最终按追加授权完成独立验收，仅提交本次 Table 改动，不推送、发布包或部署文档。

## 实施完成与独立验收

A–F 已完成。2026-10-27 的再次独立浏览器验收覆盖列移动、手动调宽、显隐、保存恢复和三档响应式，并回归原有交互；完整回执见 [验收报告](../reports/2026-10-27-table-column-customization.md)。以上清单保留为最初计划记录。
