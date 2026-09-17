# QIZHI 商标类与通用类图标验证记录

日期：2026-08-20  
结论：`candidate_pass`  
独立人工确认：`pending`

## 实际完成

- 旧站 28 个商标类节点和 185 个通用类节点已建立唯一 manifest 映射。
- 商标类为线性 13、面性 15；通用类在校正 3 项旧站元数据冲突后为线性 124、面性 61。
- 两类共 213 个 React 组件，统一使用 `QizhiIconProps`、`currentColor`、ARIA 规则和 `@wangxiaojinger/qizhi-react/icon` 子路径导出。
- 图标文档已接入六类共 415 个图标；搜索、筛选、点击/键盘复制、44.8px hover 放大和全局 Message 反馈继续共用 manifest。
- 为避免破坏既有消费组件，旧站通用日历和设置分别命名为 `CalendarGeneralIcon`、`SettingsGeneralIcon`，未覆盖已有 `CalendarIcon` 等公共出口。

## 旧站冲突处理

- `icon-时间-面性`：旧分类 `outline` 与名称及 `fill=on` 冲突，校正为 `fill`。
- `icon-时间`：旧分类 `fill` 与名称及 `fill=off` 冲突，校正为 `outline`。
- `icon-博客-面性`：旧分类 `outline` 与名称及 `fill=fill` 冲突，校正为 `fill`。
- 源 SVG 中的 `#818181`、`#8C8C8C` 统一规范化为 `currentColor`；未发现脚本、外链或 `foreignObject`。

## 已执行验证

| 验证 | 结果 |
|---|---|
| TDD 红灯 | 通过；新增 manifest 与文档数量测试分别因数组不存在、页面仍为 202 枚而按预期失败 |
| SVG 批量转换测试 | 通过；335 个 catalog 源文件均通过受控标签、事件、外部资源、颜色与 `currentColor` 转换检查 |
| `pnpm verify` | 通过；110 个测试文件、526 项测试通过；类型检查、文档构建、React 包构建和 smoke 构建通过 |
| Playwright 1440/1024/375 | 最终 12/12 通过；六类数量、筛选、搜索、剪贴板、Toast、hover、等宽网格、溢出与控制台均已检查 |
| 商标类局部截图 | 已人工查看 1440/1024/375；4 枚机器人变体完整、对齐一致 |
| 通用类局部截图 | 已人工查看 1440/1024/375；云下载线性/面性变体完整、对齐一致 |

## 验收过程说明与限制

- Playwright 首轮有 1024/375 两项在逐格读取 415 个单元尺寸时超过默认 30 秒；没有尺寸或交互断言失败。将该大清单用例单独调整为 90 秒后，不放宽断言重跑，最终 12/12 通过。
- 当前结论为执行者 `candidate_pass`，独立人工确认仍为 `pending`。
- 文档站、React 图标子包和 smoke 构建报告超过 500 kB 的 chunk 性能警告；构建成功，本次未扩大到按需加载与拆包架构调整。
