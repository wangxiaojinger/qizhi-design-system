# Notification React Island 验收记录

- 日期：2026-08-25
- 执行状态：`candidate_pass`
- 独立最终验收：`pending`

## 原始契约

- 旧站 7 个 Demo、19 个触发入口按原始标题、说明、顺序、文案、类型、计时、初始状态和交互迁移。
- 默认关闭时间 4500ms；同 `id` 更新保持同一节点并重置计时。
- 默认右上角定位：桌面顶部 80px、右侧 24px、宽 360px；375px 顶部 72px、右侧 16px、宽 343px。
- React 实现、TypeScript 类型、API 表格、展示代码和复制代码使用同一公共契约及 Demo TSX 来源。

## 八项防错复验

1. 复用公共 Button、Space、Icon、代码操作区和 API 表格完整规范。
2. 同 ID 更新通过同一节点属性和真实延迟验证，不以状态变量代替视觉联动。
3. 三档读取浮层与通知卡的实际坐标、宽度、内边距、网格和视口边界。
4. Demo 没有自制 Button、图标或通知结构；五个自定义图标已沉淀为公共 QIZHI Icon。
5. 覆盖自动关闭、手动关闭、hover、focus、同 ID 更新、操作按钮、Hook holder 和错误 alert。
6. 预览、展示源码和剪贴板内容由同一个 `tsxSource` 驱动。
7. 搜索确认当前没有其他 React Notification 消费者；旧脚本排除 React Island。
8. 使用单元测试、计算样式、实际坐标、真实点击和三档截图共同验收。

## 复合通知布局整改

- 审查发现 React Notification 未输出旧站样式依赖的 `is-closable`
  状态类，带关闭按钮的通知被错误计算为两列 Grid，关闭按钮掉到图标下方。
- 公共组件现在显式输出 `is-closable`，静态站和 React CSS 共用同一状态协议。
- 移除 Notification 对 `.qizhi-btn` 尺寸的二次覆盖，操作按钮完全由公共
  `Button size="small"` 决定。
- 新增回归锁定可关闭状态类、关闭按钮与图标同行且位于右侧、取消/确认、
  延迟更新、五个自定义图标和 7 个 Demo 的展示/复制同源。

## 验证结果

- `node --check script.js`：通过。
- `pnpm typecheck`：通过。
- `pnpm vitest run --maxWorkers=4`：273 个测试文件、1341 个测试全部通过。
- `pnpm build`：文档站、`@wangxiaojinger/qizhi-react`、smoke consumer 和 bundle boundary 全部通过。
- Notification 三档专项 E2E：3 项通过，覆盖复合通知子项坐标、完整交互路径和
  7 个 Demo 的剪贴板同源比对。
- Notification 与公共 Demo 操作区组合回归：Notification 33 项通过；Select 首轮五并发导航超时，随后单独三档重跑 3 项全部通过。
- `git diff --check`：通过。

## 截图结论

- 1440、1024：通知宽 360px，右侧 24px、顶部 80px，图标、标题、关闭按钮和操作区
  对齐正常。
- 375：通知宽 343px，右侧 16px、顶部 72px，关闭按钮位于右上角，文案自然换行，
  无横向溢出或内容裁切。

## 已知限制

- 构建仍有既存的 500kB 以上 chunk 警告，本次未扩大到性能拆包范围。
- 本记录由执行者完成，只能标记 `candidate_pass`；独立最终验收保持 `pending`。
