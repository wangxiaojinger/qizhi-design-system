# Table 用户列布局与业务 Demo 验证回执

日期：2026-10-27。源码基线：`0483d1e`；交付范围仅本地提交本次 Table 相关改动，不推送、发布包或部署文档。

状态：本轮独立验收通过。首次候选阶段的 pending 已由 IA3 独立过程覆盖：独立执行器重新运行完整浏览器矩阵并审查源码、截图，主模型核对原始日志、退出码及实际页面后确认通过。

## 交付范围

- 可选列移动、独立调宽、显隐、可组合设置入口，以及受控／非受控可序列化布局状态。默认关闭，未替换 Table 或增加依赖。
- 稳定列键、固定区与锁列屏障、隐藏顺序保留、最少业务数据列、当前列定义优先的恢复规范化。
- 手动宽度优先于自动预算和父组件重建的 width，允许留白与内部滚动。auto/% 首次调宽使用实际像素；reset 清理原生宽度缓存。
- 设置面板复用正式组件，提供键盘移动、数值调宽与 Escape 焦点恢复；树入口按稳定键定位，横向合并暂禁移动／显隐。
- Qways 模型目录 Demo：模拟模型／报价、筛选与详情、四个独立能力开关、按作用域隔离的 localStorage 保存／刷新恢复／清缓存。存储不进入核心组件。
- 类型／导出、API manifest、契约、修订工程规范和可复制 Demo 同步。原始 Downloads 规范未修改；原有 12 组 Demo 保留。

## 已执行验证

1. 全仓去重单测：224 files、1193 tests 通过，另 tokens 的 24 项 Node 测试通过。
   `pnpm_config_verify_deps_before_run=false pnpm test --maxWorkers=4 --exclude '**/node_modules/**' --exclude 'tests/e2e/**' --exclude 'dist/**' --exclude 'generated-react-pages/**'`
2. 最终修复后的 Table 源码与文档定向回归：10 files、87 tests 通过。
   `node_modules/.bin/vitest run --maxWorkers=2 packages/qizhi-react/src/table apps/qizhi-docs/src/table`
3. `pnpm typecheck`、`pnpm build`、`node scripts/build-component-api.mjs --check` 通过；构建有分块大小提示，无构建失败。
4. 原有 Table 浏览器回归：31 通过，2 项因 1920 专用测试在另两视口按条件跳过。
   `playwright test tests/e2e/table-column-layout.spec.ts tests/e2e/table-engineering.spec.ts tests/e2e/table-react-island.spec.ts --workers=3`
5. 最终版本新增浏览器回归：1440／1024／375，共 33/33 通过。
   `playwright test tests/e2e/table-customization.spec.ts tests/e2e/table-business-customization.spec.ts --workers=3`
   覆盖真实首末指针调宽、取消、min/max、单次回调、表头／单元格几何、固定偏移、内部滚动、移动屏障、键盘、受控拒绝、auto/% 像素、reset 后文本变化、Modal／Drawer、持久化与账号隔离及失败回退。
6. 主模型检查真实页面截图与几何：页面不横向溢出；模型目录的更新时间左对齐；能力标签与 +N 不裁字且保持一行。

浏览器服务：`http://127.0.0.1:5185/#component-table`，右侧目录选择「Qways 模型目录与用户列布局」。

## 兼容与限制

旧消费者不需要改动；启用新能力才需要稳定唯一列 key。核心不承担业务持久化、身份、表格 ID、请求或权限。

当前没有分组表头／虚拟化能力扩展；检测到可见数据的横向 colSpan 合并时，保留源列完整顺序与显隐，禁用冲突操作。示例报价与模型均为模拟，试用为明确禁用的未接入占位。

构建会触发开发服务器依赖及模块热更新；最终浏览器验收在构建完成并重启服务之后运行。没有将构建中的临时页面错误作为验收结果。

## 再次独立验收 IA3

- 独立执行器在 1440、1024、375 三档运行本报告上述全部 5 个 Table E2E 文件：退出码 0，64 passed、2 skipped（2.1m）。跳过项为 1920 专用用例在另外两个视口按测试条件跳过；该用例在 desktop 项目实际通过。
- 重新检查列移动及固定区／锁列屏障、首尾手动调宽及取消、显隐／重新显示、完整布局快照、受控拒绝、保存／刷新恢复／重置、账号隔离和损坏配置回退。排序、行选择、行拖动、分页、树、合并、弹窗与抽屉兼容回归通过。
- 原先 reset 后 auto/% 缓存问题的修复由本轮独立三视口回归覆盖，无遗留验收阻断项。
- 主模型重新运行定向 87 项、全仓 224 files／1193 tests（另 tokens 24 项）、typecheck、build、API 校验与 script.js 语法检查，均通过。
- 主模型核对当前打开态截图和真实几何：375px 视口下设置面板 x=8、right=367、bottom=804，位于 375×812 视口内；页面宽度 375，表格内部横向滚动，固定列按业务断点取消。
- 提交范围按文件和共享文件中的 Table 部分单独暂存；保留工作区 Chart、AutoComplete 及其他无关改动，不纳入本次提交。截图、构建产物和临时日志不提交。

环境记录：执行器一度将普通沙箱 curl 的连接拒绝误判为预览服务故障。主模型在获准的本地网络环境读回 HTTP 200，原 Chrome 测试进程始终继续；没有重跑替换原日志，最终原进程退出码为 0。
