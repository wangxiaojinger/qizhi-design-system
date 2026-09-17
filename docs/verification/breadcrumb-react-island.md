# Breadcrumb React Island 验收记录

## 范围

- 公共组件：`Breadcrumb`、`Breadcrumb.Item`
- 公共图标：`HomeIcon`
- 文档 Demo：`基础用法`、`自定义图标`
- API 表、展示代码和复制代码同源

## 契约

- 原始标题、说明、顺序、文案、链接、布局、尺寸、初始状态和交互见
  `docs/specs/qizhi-breadcrumb-contract-v1.md`。
- Home 图标路径取自 Remix Icon 4.7.0 的
  `icons/Buildings/home-4-line.svg`。
- 基础尺寸为 14px / 22px，小尺寸为 12px / 20px；
  分隔符两侧间距均为 8px。
- 非当前项“首页、频道”使用下一档浅色 `--color-text-3`
  （`rgb(134, 144, 156)`）；当前项仍使用 `--color-text-1`。
- 自定义图标 Demo 在桌面和窄屏横向排列，小屏纵向排列。

## 自动门禁

生产代码修改前，以下四组门禁均按预期失败：

- Breadcrumb 公共实现和导出不存在；
- Breadcrumb 文档 Island 不存在；
- Demo CSS 所有权规则未建立；
- 类型、实现、API 与 Demo 同源契约未建立。

实现后定向验证结果：

- TypeScript 类型检查通过；
- 5 个测试文件、13 项测试通过；
- 1440、1024、375 三档 Playwright 验收共 3 项通过。
- 全量 Vitest：309 个测试文件、1463 项测试通过；
- 文档站、`@wangxiaojinger/qizhi-react` 和消费端 smoke 三段生产构建通过；
- `node --check script.js` 与 `git diff --check` 通过。

浏览器用例覆盖：

- 两个 Demo 的顺序、标题、原始说明、文案和链接；
- 两档字号、行高、分隔符及间距；
- Home 图标 SVG 路径和尺寸；
- 链接 hover、focus-visible、点击后的 hash；
- 桌面双列、小屏纵向布局和实际坐标；
- 公共 Demo 操作区、代码展开和复制内容同源；
- 每个 Demo 无横向溢出，页面无新增控制台错误。

## 截图人工核对

已查看 1440、1024、375 三档共 6 张目标截图。图标轮廓、斜线位置、
两档字号、项目间距、响应式排列、操作区和展开代码区与契约一致，
未发现遮挡、裁切或异常空白。

## 验收状态

- 自动验证：`candidate_pass`
- 独立最终验收：`pending`
