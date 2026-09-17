# QIZHI Modal React Contract v1

状态：已确认  
证据日期：2026-08-25

## 范围

- 保留旧站 7 个 Demo、9 种触发形态的标题、原始说明、顺序、数据、文案、布局、尺寸、初始状态和交互。
- `packages/qizhi-react` 是 Modal 行为、类型和样式的唯一来源；官网只组合正式组件。
- Demo TSX 同时驱动运行预览、展示源码和复制源码；API 元数据必须与类型和运行时一致。
- 回归 Upload 中上传确认、移除确认和图片裁剪三个既有消费者。

## 旧站 Demo

1. `基础用法` — `文本信息对话框。`
2. `异步关闭` — `在对话框中使用表单时，如提交表单，点击确定后异步关闭对话框。`
3. `自定义页脚` — `通过按钮属性分别配置确定和取消操作；复杂场景可以直接传入自定义页脚，也可以隐藏页脚。`
4. `确认对话框` — `使用 Modal.confirm() 可以快速弹出确认对话框。`
5. `手动更新和移除` — `手动更新和关闭通过 Modal 方法创建的对话框。`
6. `带有通知对话框` — `在对话框中显示 Alert。`
7. `带有步骤条对话框` — `带有横向步骤条的对话框。`

自定义页脚 Demo 保留禁用按钮、自定义页脚、无页脚三种触发形态。所有正文、表格数据、步骤文案和按钮文案以旧站为准。

## 公共 API

- `ModalProps`: `open`, `title`, `children`, `width`, `footer`, `onCancel`, `onOk`, `cancelText`, `okText`, `cancelButtonProps`, `okButtonProps`, `confirmLoading`, `closable`, `maskClosable`, `escToExit`, `hideCancel`, `className`, `style`。
- `width` 默认 `520`；`closable`、`maskClosable`、`escToExit` 默认 `true`。
- `onOk` 返回 Promise 时保持打开并进入 loading；resolve 后由受控调用方关闭，reject 后保持打开并恢复按钮。
- `Modal.confirm(config)` 返回 `{ update, close }`，支持同节点更新和手动移除。
- v1 不提供拖拽、全屏、嵌套、位置变体、自定义挂载容器或自定义动效。

## DOM、视觉与交互

- Portal 到 `document.body`；遮罩 `rgba(0, 0, 0, 0.45)`；打开期间锁定页面滚动。
- 默认宽 520px，最大宽为视口减 48px；最大高为视口减 48px。
- Header 最小高 56px、水平内边距 20px；Body 内边距 24px；Footer 内边距 12px 20px、按钮间距 12px。
- 关闭按钮 28px；180ms 透明度/位移/缩放动效，并兼容 reduced motion。
- 支持关闭按钮、遮罩、取消、Escape、Tab 焦点闭环和关闭后焦点恢复。

## 复用边界

- 复用 `Button`, `Form`, `Input`, `Select`, `Table`, `Checkbox`, `Space` 和 QIZHI 图标。
- Alert 与 Steps 尚无正式 React 导出；两个旧 Demo 只保留经证据确认的组合内容，不扩展为本次公共组件 API。

## 验收门槛

- 单元测试锁定 Promise、静态 confirm/update/close、关闭路径、焦点和滚动。
- 文档测试锁定 7 个 Demo、9 种触发、原文顺序、同源代码和无私有 Modal 结构。
- Playwright 覆盖 1440/1024/375、实际坐标、盒模型、遮罩、焦点、表单、表格、截图和 Upload 消费回归。
- 执行 `node --check script.js`、`pnpm typecheck`、`pnpm test`、`pnpm build` 和 `git diff --check`。

