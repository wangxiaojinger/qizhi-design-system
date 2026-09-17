# Popover React Island 验证记录

日期：2026-08-21  
执行结论：`candidate_pass`  
独立最终验证：`pending`

## 交付范围

- `@wangxiaojinger/qizhi-react` 正式 Popover：4 种触发、12 方位、Portal、受控/非受控显示和可配置挂载容器。
- 官网 4 个同源 Demo：基础用法、触发方式、位置、浮层内关闭。
- 18 个触发入口，复用正式 Button 与 Space；API 表仅包含 v1 已实现能力。

## 自动化证据

- TDD RED：新增 `getPopupContainer` 后，组件测试因浮层仍挂载在 `body` 失败，文档测试因 API 表缺项失败。
- 定向组件与文档测试：11/11 通过。
- `pnpm verify`：类型检查通过；137 个测试文件、681 项测试通过；官网、组件包和 smoke consumer 构建退出码 0。
- Popover 定向 Playwright：1440/1024/375 共 9/9 通过。

## 浏览器与视觉检查

- 真实操作 hover、click、focus、contextMenu、外部点击、Escape 焦点恢复和浮层内确认关闭。
- 12 个方位逐一通过键盘聚焦打开；默认浮层直接挂载在 `body`，四边均保留至少 8px 视口安全区。
- `getPopupContainer` 使用真实触发器 DOM 解析容器，组件测试确认 Portal 父节点切换到返回的 Element；未提供时保持 `document.body`。
- 1440 与 1024 保留环形方位布局；375 改为 3 列，页面和 Demo 均无横向溢出。
- 人工查看三档整体截图及打开态位置截图：标题、正文、箭头、边框和阴影未被祖先容器裁切。

## 限制

- 375 视口的文档壳层存在全局固定导航条，它会出现在元素局部截图中；实际滚动与 12 个触发器的逐项交互均已验证。
- 自定义容器只改变 Portal 挂载节点，定位仍采用视口 fixed 坐标；带 `transform` 的祖先可能建立新的 fixed 包含块，消费者应选择不改变 fixed 坐标系的容器。
- 构建保留 Vite 对大于 500 kB chunk 的现有警告，未在本组件任务中扩大到全局拆包。
