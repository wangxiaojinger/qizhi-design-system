# QIZHI 提示建议类图标验证记录

日期：2026-08-20  
结论：`candidate_pass`  
独立人工确认：`pending`

## 实际完成

- 旧站 42 个提示建议类节点与用户提供的 `SkillServiceIcon` 已建立唯一
  manifest 映射：线性 20、面性 13、多色 10，共 43 个。
- 已生成 43 个 React 组件，与方向类共用 `QizhiIconProps`、ARIA 规则、
  根导出与 `@wangxiaojinger/qizhi-react/icon` 子路径导出。
- 文档页展示 80 个图标，搜索、筛选、点击/键盘复制和全局 Message 反馈共用 manifest。
- 多色图标使用 `fixedPalette`，线性/面性图标使用 `currentColor`。
- `选择模型` 与 `状态-加载-白色` 已移除 `foreignObject`，使用受控 SVG 渐变源；内部渐变 ID 按实例隔离。

## 已执行验证

| 验证 | 结果 |
|---|---|
| `pnpm verify` | 通过；101 个测试文件、496 项测试通过；类型检查、文档构建、React 包构建和 smoke 构建通过 |
| 生成器安全测试 | 通过；拒绝 `foreignObject`，验证渐变 ID 前缀和重复实例隔离 |
| React/manifest/文档测试 | 通过；42 项唯一性、公共导出、颜色模式、筛选数量与复制代码一致 |
| Playwright 1440/1024/375 | 6/6 通过；搜索、三类筛选、键盘、复制剪贴板、Toast、hover 44.8px、等宽网格、溢出和控制台均已检查 |
| 三档局部截图 | 已人工查看多色 9 枚截图；网格对齐和固定色正常；后续按产品确认移除白色加载的深色预览底板 |

## 限制与待确认

- 旧 SVG 的锥形渐变依赖 `foreignObject` 和 CSS `conic-gradient`，不能安全地直接进入 React SVG。当前使用线性 SVG 渐变重构，已保留原路径几何与固定色，但渐变算法不是字节级等价。
- 已尝试用独立 Chrome 同尺寸渲染旧/新 SVG 做像素级对照，该独立渲染进程未成功完成，因此不声称这两枚的锥形渐变已达到像素级 1:1。
- 构建仍有项目原有的超过 500 kB chunk 警告，本次没有扩大到拆包架构调整。
