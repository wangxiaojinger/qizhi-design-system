# Upload React Island 验证记录

状态：`candidate_pass`。独立最终验证保持 `pending`。

## 实现范围

- `@wangxiaojinger/qizhi-react` 新增正式 `Upload`、`Modal`、类型、样式和所需公共图标。
- 旧站 8 个 Demo 按原始标题、说明、顺序、初始数据、文案和交互迁移。
- 覆盖点击上传、禁用、拖拽、类型拒绝、上传列表、进度、失败重传、
  上传前确认、移除前确认、裁剪、数量限制和文件夹上传。
- Demo 只组合公共 `Upload`、`Modal`、`Button`、`Slider` 和 QIZHI 图标。
- v1 使用模拟请求，不向外部服务上传文件。
- 2026-08-25：新增用户提供的线性交互按钮图标 `UploadIcon`，并替换
  `Upload drag` 默认触发区中的 `CloudUploadIcon`；其他点击上传 Demo 不变。

## TDD 证据

- Modal 测试先因公共模块不存在失败，再实现 Portal、公共按钮、Escape、
  焦点约束和焦点恢复。
- Upload 测试先因公共模块不存在失败，再实现选择、拖拽、进度、错误、重传、
  移除守卫、数量限制、禁用、图片卡片、目录和 ref 方法。
- 初始错误文件缺少 `originFile` 时，重传测试先失败，再由公共 Upload 修复。
- 文档测试先因 registry、Island 和 API 不存在失败，再实现 8 个同源 Demo。
- 聚焦 Vitest：4 个文件、11 项测试全部通过。
- `UploadIcon` 门禁先因清单、公共导出和拖拽触发区均缺失而失败；实现后
  图标、Upload、图标文档和 Upload 文档共 5 个文件、29 项测试通过。

## 2026-08-25 图标替换验证

- `pnpm typecheck`：通过。
- `pnpm test`：282 个文件、1378 项测试通过。
- `pnpm build`：通过；仅有既有 chunk 体积提示。
- `Upload` E2E：1440、1024、375 三档通过；默认拖拽图标为
  `UploadIcon`，计算尺寸 `48px × 48px`，拖拽、拒绝、代码复制和溢出契约不变。
- 图标库新增项 E2E：三档均可按 `UploadIcon` 检索、复制
  `<UploadIcon />` 并截图；人工确认 32px 图标卡和 48px 拖拽图标轮廓完整。
- 完整图标 E2E 的旧 `RobotType` 和方向搜索用例在 1440/1024 仍有时序失败，
  表现为输入后短暂恢复全部 416 项；375 通过。该问题未由本次扩大修复。

## 自动验证

- `node --check script.js`：通过。
- `pnpm typecheck`：通过。
- 全量 Vitest：260 个测试文件、1272 项测试全部通过。
- `pnpm build`：文档站、`@wangxiaojinger/qizhi-react` 和消费端 smoke build 通过；保留既有的
  大于 500 kB chunk 警告。
- `git diff --check`：通过。
- Demo guard：8 个源码均从 `@wangxiaojinger/qizhi-react` 导入，不含原生 input、Remix Icon、
  内联布局或 Demo 自制 Upload 列表和操作控件。

## 浏览器验收

- Playwright 在 1440、1024、375 三档运行 Upload 契约和公共 Demo 操作区回归，
  共 24 项全部通过。
- 实际走完选择、拖入、类型拒绝、失败态 hover、删除按钮、失败重传、取消上传、
  Escape 取消移除、裁剪滑杆、数量上限隐藏与删除后恢复、目录属性。
- 上传前取消和移除前 Escape 均验证弹窗关闭、数据不变和触发器焦点恢复。
- 8 个 Demo 外框和页面均验证无横向越界；每个 Demo 同时验证
  `scrollWidth <= clientWidth`。
- Demo 预览到公共操作区的实际坐标间距为 12px，操作区右内边距为 0。
- 展示代码与剪贴板内容逐字比较一致，页面不存在“复制样式”入口。
- 裁剪弹窗验证 `opacity: 1`、非透明背景、标题与按钮可见，并检查四边坐标均位于
  视口内。
- 首轮截图人工查看发现旧静态 Modal 规则令 React Modal `opacity: 0`；已由公共
  Modal 的 Portal 结构作用域修复并加入回归断言。
- 第二轮截图人工查看发现 API 表格把 375px 下的 Demo Grid 撑到 796px；已在
  Upload 类目容器建立完整收缩链并加入每个 Demo 的实际边界断言。
- 三档基础用法、文件列表初始失败态、重传成功态和裁剪打开态截图已人工查看；
  文字、按钮、进度、错误态、弹窗边缘和移动端操作区均完整可见。
- 浏览器控制台无新增错误。

## 八类问题复核

1. 完整规范复用：复用 Button 基线的 codebox、公共操作区、类名、12px 间距和
   响应式规则，不只复用 React 控件。
2. 状态与视觉联动：进度、失败、重传、限制隐藏/恢复、拖拽和弹窗可见性均以
   计算样式或真实视觉状态验证。
3. 完整盒模型：检查 Demo、预览、操作区、API Grid、Modal、视口的实际边界、
   间距、宽高和溢出；因此发现并修复 796px 移动端越界。
4. Demo 公共能力：没有自制按钮、上传列表、进度、图标、Slider 或 Modal；
   原生 file input 仅存在于公共 Upload 内部。
5. 完整交互路径：覆盖取消、Escape、hover、删除、重传、焦点恢复、数量恢复和
   裁剪滑杆，不只验证静态初始态。
6. UI、源码和复制同源：渲染注册表使用格式化 Demo TSX，展示与复制共用同一份
   `tsxSource`，并由剪贴板逐字比较锁定。
7. 完整范围：搜索 Upload 全部 React 消费位置；8 个 Demo、复合裁剪/确认场景、
   公共操作区和旧初始化守卫均纳入回归。
8. 延迟结论：两次自动测试通过后仍由截图人工检查发现透明弹窗和移动端裁切；
   最终结论同时依赖测试、计算样式、实际坐标和截图。

## 限制

- v1 不提供默认网络传输、图片预览、Message、服务端响应解析和无旧站证据的 API。
- 构建仍有既有的大于 500 kB chunk 警告，本次未扩大范围处理代码拆分。
- 独立最终验收尚未执行。
