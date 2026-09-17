# QIZHI Button React Island 渐进迁移设计

## 1. 目标

在不改变现有 QIZHI 规范站视觉、导航和未迁移内容的前提下，将【按钮 Button】分类改造成第一个正式 React 组件能力。

Button 不是仅供浏览的静态示例，而是一个可安装、可导入、可构建、可测试并可被设计、产品、AI 和前端精确调用的公共组件。规范站只消费正式组件，不在文档层复制或模拟 Button 实现。

## 2. 本期范围

正式迁移以下 Button 章节：

1. 基础用法
2. 图标按钮
3. 按钮尺寸
4. 按钮状态
5. 禁用按钮
6. 加载中按钮
7. 长按钮
8. API

保留现有章节顺序、中文文案、示例数量、图标资产、视觉尺寸和响应式行为。其他规范分类继续使用原来的静态 HTML、CSS 和 JavaScript，不在本期重构。

## 3. 推荐架构

采用 React Island 渐进迁移：现有规范站继续承担官网壳层与未迁移内容，Button 区域改为 React 挂载点。

```text
设计系统/
├── index.html
├── styles.css
├── script.js
├── packages/
│   └── qizhi-react/
│       └── src/
│           ├── button/
│           ├── icon/
│           └── index.ts
├── apps/
│   └── qizhi-docs/
│       └── src/
│           └── button/
├── tests/
└── package.json
```

职责边界：

- `packages/qizhi-react`：Button、相关图标、样式、类型和公共导出，是唯一正式实现来源。
- `apps/qizhi-docs`：Button 页面数据、Demo、代码展开、复制反馈和 API 表，只能导入正式组件。
- `index.html`：保留原官网壳层和其他分类；原 Button 静态内容替换为单一 React root。
- `styles.css`：保留官网壳层与文档容器视觉；正式 Button 样式从组件包输出。
- `script.js`：继续服务未迁移内容，不再初始化 Button 的状态模拟和加载交互。

## 4. 数据与调用链

```text
Button 正式实现
  → Button Demo 文件
  → React Island 实时渲染
  → 同一 Demo 文件的源码展示
  → ButtonProps 约束的 API 元数据
```

每个 Demo 必须同时输出可渲染组件和可展示源码。源码不得人工维护另一份近似字符串；构建时从实际 Demo 文件读取。API 元数据中的属性名必须受 `keyof ButtonProps` 类型约束，避免文档出现不存在的属性。

## 5. Button 公共 API

Button 继承原生 `ButtonHTMLAttributes<HTMLButtonElement>`，并排除与组件语义冲突的原生 `type`。

```ts
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  type?: "primary" | "secondary" | "dashed" | "text";
  size?: "mini" | "small" | "default" | "large";
  status?: "default" | "warning" | "danger" | "success";
  shape?: "square" | "circle";
  icon?: ReactNode;
  loading?: boolean;
  long?: boolean;
  htmlType?: "button" | "submit" | "reset";
}
```

默认值：

- `type="secondary"`
- `size="default"`
- `status="default"`
- `shape="square"`
- `loading=false`
- `long=false`
- `htmlType="button"`

行为约束：

- `loading=true` 时设置 `disabled`、`aria-busy="true"`，显示加载图标且不触发 `onClick`。
- `disabled=true` 时使用原生禁用语义并不触发点击。
- 只有图标、没有文字的 Button 必须由调用方提供 `aria-label`。
- `long=true` 时宽度为容器的 `100%`。
- `status` 的视觉优先级高于 `type`，但两者均保留在类名与类型契约中。
- 图标使用 QIZHI 自有 SVG/React Icon，不依赖 Remix Icon 运行时。

## 6. 视觉迁移原则

- 以当前静态 Button 页的浏览器实际渲染结果为唯一视觉基线，不重新设计。
- 保留现有高度：mini 24px、small 28px、default 32px、large 36px。
- 默认文字按钮左右内边距保持 12px；纯图标默认 32×32。
- 保留 primary、secondary、dashed、text、warning、danger、success、disabled、loading 的现有颜色和交互状态。
- 保留现有添加、删除图标；图标使用 `currentColor`，不使用低透明度蒙版。
- 加载按钮颜色沿用现有禁用色阶；圆形加载按钮保持 32×32 且加载图标居中。
- React Island 的最外层复用现有 `.component-intro`、`.codebox-wrapper`、`.qz-description`、`.demo` 等文档容器视觉协议。

## 7. 文档交互

每个章节包含：标题、说明、React Demo、代码工具栏和源码面板。

- 展开按钮使用原生 `<button>`，维护 `aria-expanded` 与 `aria-controls`。
- 复制按钮调用 Clipboard API；成功与失败分别显示真实反馈，不伪报成功。
- “展开所有代码”统一控制本页七个源码面板。
- 右侧目录继续从现有章节 ID 获取，不改变 hash 和前进/后退行为。
- Button 页面卸载后，旧站其他分类继续由原脚本正常工作。

本期不实现 CodePen、CodeSandbox 和码上掘金跳转；这些属于后续统一文档工具能力，不影响正式组件调用。

## 8. 渐进兼容策略

- 旧 Button 静态 DOM 在迁移前作为基线证据保存，迁移后不与 React Demo 双重渲染。
- 原 Button 专属脚本 `initButtonPreviewStates` 和 `initLoadingButtonDemo` 从静态入口取消，防止 React 与原生事件重复绑定。
- 未迁移分类继续使用现有 `.qizhi-btn` / `.qz-btn` 消费样式；本期不得把它们批量替换为 React。
- 正式组件使用 QIZHI 命名，不新增 `arco-*` 或 `ac-*` 命名。
- 组件包构建产物不手工提交；官网通过工作区依赖消费源码或构建包。

## 9. 测试与验收

### 自动化组件测试

- 默认属性和原生属性透传。
- 四种 `type`、四种 `size`、四种 `status`、两种 `shape`。
- 图标与纯图标无障碍名称。
- `disabled` 和 `loading` 不触发点击。
- `loading` 的 `disabled`、`aria-busy` 和加载图标。
- `long` 宽度类与 className 合并。
- API 元数据属性受 `keyof ButtonProps` 约束。
- 七个 Demo 均直接导入 `@wangxiaojinger/qizhi-react` 的 Button。

### 官网自动化测试

- Button hash 仍为 `#components-button`。
- 七个章节及 API 都存在，ID 唯一。
- 展开、收起、复制成功、复制失败和展开全部可用。
- 其他静态分类仍可通过原导航访问。
- 控制台无新增错误，组件包和资源无 404。

### 浏览器验收

- 1440、1024、375 三视口。
- 页面根节点与每个 Demo 无横向溢出。
- hover、active、focus-visible、disabled、loading 全部核对。
- 加载按钮颜色、宽高、圆形图标居中和点击恢复路径实际操作。
- Select 等未迁移分类抽查，确认渐进迁移没有破坏旧站。
- 每个关键打开态截图后人工查看，未查看不得声明通过。

## 10. 交付边界

本期完成后可声明：

- Button 是 `@wangxiaojinger/qizhi-react` 的正式候选组件。
- 规范站 Button Demo、源码和 API 与正式组件同源。
- 其他分类仍是静态规范资产，不能被声明为正式 React 组件。

完成状态最高为 `candidate_pass`；独立最终验证保持 `pending`。
