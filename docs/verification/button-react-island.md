# Button React Island 验证记录

- 日期：2026-08-18
- 范围：仅【按钮 Button】；其他分类继续使用原静态实现。
- 组件来源：`packages/qizhi-react`，包名 `@wangxiaojinger/qizhi-react`。
- 文档来源：`apps/qizhi-docs/src/button`，七个 Demo 均直接导入正式组件，展示源码读取实际 Demo 文件。
- 示例约定：与 Arco React 文档保持一致，使用正式 `Button`、`Space` 组件，采用 `const App`、多行 JSX 与 `export default App` 结构，并提供语法高亮和复制源码。
- 公共代码能力：`apps/qizhi-docs/src/code/CodeHighlight.tsx` 基于 PrismJS 解析 TSX，统一区分组件、原生标签、属性、关键字、字符串、布尔值和注释；后续组件文档必须复用，不在组件目录另写高亮规则。
- 高亮主题基准：遵循 Arco 示例的上下文规则——关键字与 JSX 标签为绿色、属性与模块字符串为浅紫色、函数声明为深紫色、运算符为橙色、标点为蓝色，普通导入标识符和 JSX 文本保持正文色。
- 代码排版基准：公共 TSX 代码字号固定为 14px；未着色的默认代码使用 `--color-text-2`，比正文强色浅一级。
- Demo 操作区：演示框底部与“查看/收起代码、复制代码”操作区的实际间距统一为 12px，并由三视口 E2E 读取元素边界验证。

## 自动验证

- `node --check script.js`：通过。
- `pnpm test`：10 个测试文件、39 项测试通过。
- `pnpm typecheck`：根工程与 `@wangxiaojinger/qizhi-react` 通过。
- `pnpm build`：规范站与组件包构建通过；组件包产出 ESM、CSS 和 TypeScript 声明。
- `pnpm e2e`：1440、1024、375 三个视口各 1 项通过；验证路由、七章节、API、源码展开、控制台错误和按钮视口边界。
- `pnpm --filter @wangxiaojinger/qizhi-react pack`：成功生成 `qizhi-react-0.1.0.tgz`；已核对包内 ESM、CSS、声明文件和 package.json，临时包已清理。

## 人工截图检查

- 1440：顶部栏、左侧导航、正文、右侧目录、七组 Demo、源码区与 API 表未见裁切或错位。
- 1024：左侧导航与正文布局稳定，按钮及操作区未越界。
- 375：按钮换行、加载态、长按钮和操作按钮均在视口内；API 表保留横向滚动以阅读完整类型和默认值。

## 结论与边界

- Button 状态：`candidate_pass`。
- 独立最终验证：`pending`。
- 尚未接入 npm 私有源或公共源；当前已具备 workspace 导入和 tarball 打包能力。
- CodePen、CodeSandbox、码上掘金不在本期范围。
