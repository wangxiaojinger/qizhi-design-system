# QIZHI Cascader v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将旧站 Cascader 的 15 组现有能力迁移为 `@wangxiaojinger/qizhi-react` 正式组件、同源 React 文档岛和可重跑的多层验收。

**Architecture:** 组件包以纯 `cascaderModel` 处理字段映射、路径、搜索与选择策略，`Cascader` 编排受控状态，Popup/Tags/Navigation 分别处理 Portal 菜单、多选标签和键盘活动路径。文档岛只消费公共包，每个 Demo 的实时预览与展示源码来自同一 TSX 文件。

**Tech Stack:** React 19、TypeScript 7、CSS、Vitest、Testing Library、Vite、Playwright。

**Spec:** `docs/superpowers/specs/2026-08-19-qizhi-cascader-v1-design.md`、`docs/specs/qizhi-cascader-contract-v1.md`

## Global Constraints

- 完整保留已审定的 15 组旧站能力，不把添加误作替换。
- 公共组件唯一来源是 `packages/qizhi-react`；官网不得仿写第二套 Cascader。
- `allowClear` 默认 `false`；`expandTrigger` 默认 `"click"`；默认尺寸为 32px。
- 单选 value 是一条路径，多选 value 是路径集合；`dragToSort` 和 `checkedStrategy` 仅多选可用。
- 弹层通过内部 Portal 渲染到 body，不提供 v1 自定义容器 API，不增加第三方依赖。
- 所有公共命名使用 `qizhi-*`，不得出现 `arco-*` 或命名空间前缀 `ac-*`。
- 每一项生产行为必须先写失败测试并观察正确红灯，再写最小实现。
- 既有工作树含其他用户改动；每次提交只暂存本任务列出的文件。
- 执行者最多声明 `candidate_pass`，独立最终验证保持 `pending`。

---

### Task 1: 建立 Cascader 公共类型与纯数据模型

**Files:**
- Create: `packages/qizhi-react/src/cascader/Cascader.types.ts`
- Create: `packages/qizhi-react/src/cascader/Cascader.types.test.tsx`
- Create: `packages/qizhi-react/src/cascader/cascaderModel.ts`
- Create: `packages/qizhi-react/src/cascader/cascaderModel.test.ts`

**Interfaces:**
- Produces: `CascaderRawValue`, `CascaderPathValue`, `CascaderOption`, `CascaderFieldNames`, `CascaderSingleProps`, `CascaderMultipleProps`, `CascaderProps`。
- Produces: `normalizeOptions(options, fieldNames)`, `findPathByValue(options, path)`, `flattenLeafPaths(options)`, `filterPaths(paths, input, filterOption)`, `normalizeSelection(paths, checkedStrategy)`。

- [ ] **Step 1: 写联合类型红灯测试**

```tsx
import type { CascaderProps } from "./Cascader.types";

const single: CascaderProps = { options: [], value: ["shanghai"] };
const multiple: CascaderProps = { options: [], mode: "multiple", value: [["shanghai"]], dragToSort: true };
// @ts-expect-error 单选不能传入多选路径集合
const invalidValue: CascaderProps = { options: [], value: [["shanghai"]] };
// @ts-expect-error 单选不能开启拖拽排序
const invalidDrag: CascaderProps = { options: [], dragToSort: true };
void [single, multiple, invalidValue, invalidDrag];
```

- [ ] **Step 2: 运行类型检查确认红灯**

Run: `pnpm typecheck`

Expected: FAIL，原因是 `./Cascader` 和 Cascader 类型尚不存在；不是语法或环境错误。

- [ ] **Step 3: 写模型红灯测试**

```ts
const options = [{ name: "上海", code: "sh", nodes: [{ name: "黄浦", code: "hp", leaf: true }] }];
const normalized = normalizeOptions(options, { label: "name", value: "code", children: "nodes", isLeaf: "leaf" });
expect(normalized[0].children?.[0].path).toEqual(["sh", "hp"]);
expect(flattenLeafPaths(normalized).map((item) => item.valuePath)).toEqual([["sh", "hp"]]);
expect(filterPaths(flattenLeafPaths(normalized), "黄浦")).toHaveLength(1);
```

- [ ] **Step 4: 运行模型测试确认红灯**

Run: `pnpm test -- packages/qizhi-react/src/cascader/cascaderModel.test.ts`

Expected: FAIL，原因是模型导出不存在。

- [ ] **Step 5: 实现最小类型和不可变模型**

```ts
export interface NormalizedCascaderOption {
  id: string;
  label: ReactNode;
  value: CascaderRawValue;
  path: CascaderRawValue[];
  sourcePath: CascaderOption[];
  disabled: boolean;
  isLeaf: boolean;
  children?: NormalizedCascaderOption[];
}

export function flattenLeafPaths(options: NormalizedCascaderOption[]) {
  return options.flatMap((option) => option.children?.length
    ? flattenLeafPaths(option.children)
    : [{ valuePath: option.path, optionPath: option.sourcePath, labels: option.sourcePath.map(readLabel) }]);
}
```

实现必须验证重复 value、缺失字段和无效 children，不原地修改 `options`。

- [ ] **Step 6: 运行定向测试与类型检查确认绿灯**

Run: `pnpm test -- packages/qizhi-react/src/cascader/cascaderModel.test.ts && pnpm typecheck`

Expected: 模型测试全部 PASS，类型中的两个 `@ts-expect-error` 被正确消费。

- [ ] **Step 7: 提交本任务**

```bash
git add packages/qizhi-react/src/cascader/Cascader.types.ts packages/qizhi-react/src/cascader/Cascader.types.test.tsx packages/qizhi-react/src/cascader/cascaderModel.ts packages/qizhi-react/src/cascader/cascaderModel.test.ts
git commit -m "feat(cascader): define values and option model"
```

---

### Task 2: 实现单选触发器、Portal 菜单和受控开关

**Files:**
- Create: `packages/qizhi-react/src/cascader/Cascader.tsx`
- Create: `packages/qizhi-react/src/cascader/CascaderPopup.tsx`
- Create: `packages/qizhi-react/src/cascader/useCascaderNavigation.ts`
- Create: `packages/qizhi-react/src/cascader/Cascader.test.tsx`

**Interfaces:**
- Consumes: Task 1 的规范化模型和 Props 联合类型。
- Produces: `Cascader`、`CascaderHandle`、`CascaderPopupProps`、`useCascaderNavigation`。

- [ ] **Step 1: 写单选和受控开关红灯测试**

```tsx
render(<Cascader options={cityOptions} onChange={onChange} />);
const input = screen.getByRole("combobox", { name: "请选择城市" });
expect(input).toHaveAttribute("aria-expanded", "false");
await user.click(input);
expect(input).toHaveAttribute("aria-expanded", "true");
await user.click(screen.getByRole("option", { name: "上海" }));
await user.click(screen.getByRole("option", { name: "黄浦" }));
expect(onChange).toHaveBeenCalledWith(["sh", "hp"], expect.any(Array));
expect(input).toHaveFocus();
```

另写 `open={false}` 不自行展开、`onOpenChange(true)` 仍触发，以及 `value/defaultValue` 冲突警告测试。

- [ ] **Step 2: 运行测试确认红灯**

Run: `pnpm test -- packages/qizhi-react/src/cascader/Cascader.test.tsx`

Expected: FAIL，原因是组件实现不存在。

- [ ] **Step 3: 实现最小受控状态和唯一 ARIA 关系**

```tsx
const popupId = useId();
const [innerOpen, setInnerOpen] = useState(defaultOpen);
const isOpen = open ?? innerOpen;
const setOpen = (next: boolean) => {
  if (open === undefined) setInnerOpen(next);
  onOpenChange?.(next);
};

return <input
  ref={inputRef}
  role="combobox"
  readOnly={!showSearch}
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-controls={popupId}
/>;
```

Popup 必须 `createPortal(..., document.body)`；用触发器 `getBoundingClientRect()` 计算 fixed 定位，监听 resize 和捕获阶段 scroll，关闭时清理监听器。

- [ ] **Step 4: 实现列菜单与单选路径选择**

每列输出唯一 `role="listbox"`，选项输出 `role="option"`。有 children 的选项展开下一列；叶子或 `changeOnSelect` 触发 `onChange`。禁用项不展开、不选择。

- [ ] **Step 5: 实现键盘导航并验证 DOM 重绘路径**

```ts
if (event.key === "ArrowRight") expandActive();
if (event.key === "ArrowLeft") collapseToParent();
if (event.key === "Enter") selectActive();
if (event.key === "Escape") closeAndFocusTrigger();
```

外部点击使用稳定的 `rootRef.current?.contains(target)` 与 `popupRef.current?.contains(target)`，不得依赖已被重绘替换的旧 `event.target` 路径。

- [ ] **Step 6: 运行定向测试确认绿灯**

Run: `pnpm test -- packages/qizhi-react/src/cascader/Cascader.test.tsx`

Expected: 单选、受控 open、ARIA、Portal、禁用项、Escape/方向键和焦点测试全部 PASS。

- [ ] **Step 7: 提交本任务**

```bash
git add packages/qizhi-react/src/cascader/Cascader.tsx packages/qizhi-react/src/cascader/CascaderPopup.tsx packages/qizhi-react/src/cascader/useCascaderNavigation.ts packages/qizhi-react/src/cascader/Cascader.test.tsx
git commit -m "feat(cascader): add accessible single selection"
```

---

### Task 3: 实现清除、格式化、前置标签与自定义触发器

**Files:**
- Modify: `packages/qizhi-react/src/cascader/Cascader.tsx`
- Modify: `packages/qizhi-react/src/cascader/Cascader.test.tsx`

**Interfaces:**
- Consumes: `renderFormat(labels, selectedOptions)`、`trigger(triggerProps)`、`addBefore`、`allowClear`。
- Produces: 清除与自定义触发的稳定焦点和 ARIA 行为。

- [ ] **Step 1: 写四类能力红灯测试**

```tsx
render(<Cascader options={cityOptions} defaultValue={["sh", "hp"]} allowClear renderFormat={(labels) => labels.join(" > ")} addBefore="选择城市" />);
expect(screen.getByDisplayValue("上海 > 黄浦")).toBeInTheDocument();
await user.click(screen.getByRole("button", { name: "清除" }));
expect(screen.getByRole("combobox")).toHaveFocus();
expect(screen.getByDisplayValue("")).toBeInTheDocument();
```

自定义触发器测试必须断言 render prop 收到 `aria-controls`、click、keydown 和 ref，且打开后唯一弹层存在。

- [ ] **Step 2: 运行测试确认红灯**

Run: `pnpm test -- packages/qizhi-react/src/cascader/Cascader.test.tsx`

Expected: FAIL，原因是四类能力尚未渲染。

- [ ] **Step 3: 写最小实现并保持输入值只读来源单一**

显示值只能从标准化 selectedOptions 计算；受控 value 不存在于 options 时回退为 value 字符串，不静默删除。

- [ ] **Step 4: 运行定向测试确认绿灯并提交**

Run: `pnpm test -- packages/qizhi-react/src/cascader/Cascader.test.tsx`

```bash
git add packages/qizhi-react/src/cascader/Cascader.tsx packages/qizhi-react/src/cascader/Cascader.test.tsx
git commit -m "feat(cascader): add trigger and value presentation"
```

---

### Task 4: 实现多选、checkedStrategy 与拖拽排序

**Files:**
- Create: `packages/qizhi-react/src/cascader/CascaderTags.tsx`
- Modify: `packages/qizhi-react/src/cascader/Cascader.tsx`
- Modify: `packages/qizhi-react/src/cascader/CascaderPopup.tsx`
- Modify: `packages/qizhi-react/src/cascader/cascaderModel.ts`
- Modify: `packages/qizhi-react/src/cascader/cascaderModel.test.ts`
- Modify: `packages/qizhi-react/src/cascader/Cascader.test.tsx`

**Interfaces:**
- Produces: 多选路径去重、`all | parent` 回显、标签顺序与 `onChange` 一致。

- [ ] **Step 1: 写多选与策略红灯测试**

```tsx
render(<Cascader mode="multiple" options={cityOptions} defaultValue={[["sh", "hp"], ["bj", "cy"]]} dragToSort onChange={onChange} />);
expect(screen.getAllByRole("listitem")).toHaveLength(2);
await dragTag("北京 / 朝阳", "上海 / 黄浦");
expect(onChange).toHaveBeenLastCalledWith([["bj", "cy"], ["sh", "hp"]], expect.any(Array));
```

模型测试覆盖重复路径去重、parent 策略回显以及 `changeOnSelect` 下父子独立选择。

- [ ] **Step 2: 运行测试确认红灯**

Run: `pnpm test -- packages/qizhi-react/src/cascader/cascaderModel.test.ts packages/qizhi-react/src/cascader/Cascader.test.tsx`

- [ ] **Step 3: 实现多选标签与排序**

Tags 使用语义列表；原生 drag 事件只对 `dragToSort=true` 绑定。排序完成才调用 `onChange`，dragover 不产生业务事件。

- [ ] **Step 4: 运行定向测试确认绿灯并提交**

Run: `pnpm test -- packages/qizhi-react/src/cascader/cascaderModel.test.ts packages/qizhi-react/src/cascader/Cascader.test.tsx`

```bash
git add packages/qizhi-react/src/cascader
git commit -m "feat(cascader): add multiple selection and sorting"
```

---

### Task 5: 实现搜索、自定义过滤与异步加载

**Files:**
- Modify: `packages/qizhi-react/src/cascader/Cascader.tsx`
- Modify: `packages/qizhi-react/src/cascader/CascaderPopup.tsx`
- Modify: `packages/qizhi-react/src/cascader/Cascader.test.tsx`
- Modify: `packages/qizhi-react/src/cascader/cascaderModel.test.ts`

**Interfaces:**
- Consumes: `showSearch`、`filterOption`、`loadMore`、`isLeaf`。
- Produces: 搜索结果列表、节点级 pending/rejected/retry 状态。

- [ ] **Step 1: 写搜索和异步红灯测试**

```tsx
render(<Cascader options={lazyOptions} showSearch loadMore={loadMore} />);
await user.type(screen.getByRole("combobox"), "黄浦");
expect(screen.getByRole("option", { name: /上海.*黄浦/ })).toBeInTheDocument();

await user.clear(screen.getByRole("combobox"));
await user.click(screen.getByRole("option", { name: "浙江" }));
expect(loadMore).toHaveBeenCalledTimes(1);
expect(screen.getByRole("option", { name: "浙江" })).toHaveAttribute("aria-busy", "true");
```

另写 rejected 后 loading 消失、弹层保持、焦点保持、第二次点击可重试，以及并发点击只请求一次。

- [ ] **Step 2: 运行测试确认红灯**

Run: `pnpm test -- packages/qizhi-react/src/cascader/Cascader.test.tsx packages/qizhi-react/src/cascader/cascaderModel.test.ts`

- [ ] **Step 3: 实现搜索与节点级请求状态**

```ts
const pendingKeys = useRef(new Set<string>());
const requestChildren = async (option: NormalizedCascaderOption) => {
  if (pendingKeys.current.has(option.id)) return;
  pendingKeys.current.add(option.id);
  try { await loadMore?.(option.source, option.sourcePath); }
  finally { pendingKeys.current.delete(option.id); }
};
```

错误只恢复交互并允许重试，不伪造成功或业务错误文案。

- [ ] **Step 4: 运行定向测试确认绿灯并提交**

Run: `pnpm test -- packages/qizhi-react/src/cascader/Cascader.test.tsx packages/qizhi-react/src/cascader/cascaderModel.test.ts`

```bash
git add packages/qizhi-react/src/cascader
git commit -m "feat(cascader): add search and lazy loading"
```

---

### Task 6: 沉淀 QIZHI 样式、图标与公共导出

**Files:**
- Create: `packages/qizhi-react/src/cascader/cascader.css`
- Create: `packages/qizhi-react/src/icon/ChevronDownIcon.tsx`
- Create: `packages/qizhi-react/src/icon/ChevronRightIcon.tsx`
- Create: `packages/qizhi-react/src/icon/CloseIcon.tsx`
- Modify: `packages/qizhi-react/src/icon/index.ts`
- Modify: `packages/qizhi-react/src/index.ts`
- Modify: `packages/qizhi-react/src/cascader/Cascader.test.tsx`
- Modify: `tests/contracts/workspace.test.tsx`

**Interfaces:**
- Produces: 包根 `Cascader`、全部 Cascader 类型和三个 `currentColor` 图标导出。

- [ ] **Step 1: 写导出和计算样式红灯测试**

```tsx
expect(Cascader).toBeTypeOf("object");
render(<Cascader options={[]} size="small" status="error" allowClear />);
expect(screen.getByRole("combobox").closest(".qizhi-cascader")).toHaveClass("qizhi-cascader--small", "qizhi-cascader--error");
```

- [ ] **Step 2: 运行测试确认红灯**

Run: `pnpm test -- tests/contracts/workspace.test.tsx packages/qizhi-react/src/cascader/Cascader.test.tsx`

- [ ] **Step 3: 实现样式与导出**

CSS 使用既有变量；高度严格为 28/32/36px，圆角 2px，clear/arrow 槽 16px，菜单行 32px。Portal 层使用专属 `qizhi-cascader-popup`，不得放开全局 `.demo` overflow。

```ts
export { Cascader } from "./cascader/Cascader";
export type { CascaderProps, CascaderOption, CascaderPathValue } from "./cascader/Cascader.types";
import "./cascader/cascader.css";
```

- [ ] **Step 4: 运行测试、类型检查和包构建**

Run: `pnpm test -- tests/contracts/workspace.test.tsx packages/qizhi-react/src/cascader && pnpm typecheck && pnpm --filter @wangxiaojinger/qizhi-react build`

Expected: 全部 PASS，构建产物可导入且 CSS 被包含。

- [ ] **Step 5: 提交本任务**

```bash
git add packages/qizhi-react/src/cascader packages/qizhi-react/src/icon packages/qizhi-react/src/index.ts tests/contracts/workspace.test.tsx
git commit -m "feat(cascader): publish QIZHI styles and exports"
```

---

### Task 7: 创建 15 组同源 Demo 与结构化 API

**Files:**
- Create: `apps/qizhi-docs/src/cascader/demos/BasicDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/ClearDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/AddBeforeDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/RenderFormatDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/CustomTriggerDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/SizeDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/FieldNamesDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/DragSortDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/ChangeOnSelectDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/MultipleDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/SearchDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/CustomSearchDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/LazyDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/DisabledOptionDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/demos/ControlledDemo.tsx`
- Create: `apps/qizhi-docs/src/cascader/cascaderDocs.registry.ts`
- Create: `apps/qizhi-docs/src/cascader/cascaderApi.ts`
- Create: `apps/qizhi-docs/src/cascader/cascaderDocs.test.tsx`

**Interfaces:**
- Produces: `cascaderDemos`（固定 15 项）与 `cascaderApi`（对应公共类型/默认值）。

- [ ] **Step 1: 写文档清单红灯测试**

```tsx
expect(cascaderDemos.map((demo) => demo.id)).toEqual([
  "级联选择-基础用法", "级联选择-允许清除", "级联选择-前置标签", "级联选择-格式化展示选中值",
  "级联选择-自定义选择框", "级联选择-不同尺寸", "级联选择-自定义字段名", "级联选择-拖拽排序",
  "级联选择-选择即改变", "级联选择-支持多选", "级联选择-允许搜索", "级联选择-自定义搜索",
  "级联选择-动态加载", "级联选择-选项禁用", "级联选择-受控模式",
]);
expect(cascaderDemos.every((demo) => demo.source.includes('from "@wangxiaojinger/qizhi-react"'))).toBe(true);
```

- [ ] **Step 2: 运行测试确认红灯**

Run: `pnpm test -- apps/qizhi-docs/src/cascader/cascaderDocs.test.tsx`

- [ ] **Step 3: 创建独立 Demo 和 raw 同源 registry**

Registry 必须采用现有 `ComponentType + ?raw` 方式：

```ts
import BasicDemo from "./demos/BasicDemo";
import basicSource from "./demos/BasicDemo.tsx?raw";
export const cascaderDemos = [{ id: "级联选择-基础用法", title: "基础用法", description: "…", component: BasicDemo, source: basicSource }] as const;
```

Lazy Demo 使用可重复、可失败再重试的本地 Promise；Controlled Demo 真实回写 value/open，不用静态假状态。

- [ ] **Step 4: 创建 API 元数据并做默认值一致性测试**

API 至少覆盖契约中的所有公共属性、单选/多选差异和排除说明；`allowClear=false`、`size="default"` 等必须与运行时一致。

- [ ] **Step 5: 运行文档测试确认绿灯并提交**

Run: `pnpm test -- apps/qizhi-docs/src/cascader/cascaderDocs.test.tsx`

```bash
git add apps/qizhi-docs/src/cascader
git commit -m "docs(cascader): add colocated demos and API"
```

---

### Task 8: 挂载 Cascader React Island 并移除静态双重初始化

**Files:**
- Create: `apps/qizhi-docs/src/cascader/CascaderDocsIsland.tsx`
- Create: `apps/qizhi-docs/src/cascader/CascaderDemoCodebox.tsx`
- Create: `apps/qizhi-docs/src/cascader/CascaderApiTable.tsx`
- Create: `apps/qizhi-docs/src/cascader/cascaderDocs.css`
- Create: `apps/qizhi-docs/src/cascader/main.tsx`
- Modify: `index.html`
- Modify: `script.js`
- Modify: `apps/qizhi-docs/src/cascader/cascaderDocs.test.tsx`
- Modify: `apps/qizhi-docs/src/apiAnchors.test.tsx`

**Interfaces:**
- Produces: `#component-cascader` React root、`cascader-API` 唯一锚点、`qizhi:react-island-ready` 目录重建事件。

- [ ] **Step 1: 写挂载与锚点红灯测试**

```tsx
render(<CascaderDocsIsland />);
expect(screen.getByRole("heading", { name: "级联选择 Cascader" })).toBeInTheDocument();
expect(document.querySelectorAll("#cascader-API")).toHaveLength(1);
expect(screen.getAllByRole("article")).toHaveLength(16);
```

- [ ] **Step 2: 运行测试确认红灯**

Run: `pnpm test -- apps/qizhi-docs/src/cascader/cascaderDocs.test.tsx apps/qizhi-docs/src/apiAnchors.test.tsx`

- [ ] **Step 3: 实现 Island、Codebox 与 API 表**

复用现有 `Button`、`CodeIcon`、`CopyIcon`、`CodeHighlight` 和 `useCopyFeedback`；不得复制组件逻辑。挂载完成后派发 `qizhi:react-island-ready`。

- [ ] **Step 4: 将静态 section 替换为单一 React root**

保留 `id="component-cascader"` 和左侧 hash；删除该 section 内旧 Cascader Demo DOM。取消 `initCascaderDemos` 的 `DOMContentLoaded` 注册，避免 React 与原生脚本双绑定；函数本体只有在确认无其他消费者后才删除。

- [ ] **Step 5: 同步本地 CSS/JS 查询版本并做结构检查**

修改 `script.js` 后同步 `index.html` 中 CSS 与 JS 两处版本字符串。

Run: `node --check script.js`

Expected: PASS；新增/保留 ID 唯一，所有 `href="#..."` 和 `aria-controls` 有唯一目标。

- [ ] **Step 6: 运行文档测试确认绿灯并提交**

Run: `pnpm test -- apps/qizhi-docs/src/cascader apps/qizhi-docs/src/apiAnchors.test.tsx && pnpm typecheck`

```bash
git add apps/qizhi-docs/src/cascader apps/qizhi-docs/src/apiAnchors.test.tsx index.html script.js
git commit -m "docs(cascader): mount React Island"
```

---

### Task 9: 增加完整 E2E、视觉证据与交付记录

**Files:**
- Create: `tests/e2e/cascader-react-island.spec.ts`
- Create: `docs/verification/cascader-react-island.md`

**Interfaces:**
- Produces: 1440/1024/375 可重跑验收和 `candidate_pass` 证据记录。

- [ ] **Step 1: 写 E2E 红灯测试**

```ts
test("Cascader keyboard path and portal stay visible", async ({ page }) => {
  await page.goto("/#component-cascader");
  const input = page.getByRole("combobox", { name: "请选择……" }).first();
  await input.focus();
  await input.press("Enter");
  await input.press("ArrowDown");
  await input.press("ArrowRight");
  await input.press("Escape");
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-expanded", "false");
});
```

另写：clear、多选、拖拽、搜索、自定义过滤、lazy rejected/retry、disabled option、controlled、DOM 重绘后不误关闭、弹层翻转和三视口无页面溢出。

- [ ] **Step 2: 启动文档站并运行 E2E 确认红灯**

Run terminal A: `pnpm dev -- --port 5175`

Run terminal B: `QIZHI_DOCS_BASE_URL=http://127.0.0.1:5175 pnpm exec playwright test tests/e2e/cascader-react-island.spec.ts`

Expected: 新增断言先因缺失实现细节或视觉门槛失败；确认不是服务未启动。

- [ ] **Step 3: 仅修复 E2E 揭示的 Cascader 范围问题**

逐项记录弹层、触发器、最近容器和视口边界，以及所有祖先的 overflow/clip-path/contain。不得用“DOM 存在”代替完整可见。

- [ ] **Step 4: 运行完整自动化门禁**

Run: `node --check script.js`

Run: `pnpm verify`

Run: `QIZHI_DOCS_BASE_URL=http://127.0.0.1:5175 pnpm exec playwright test tests/e2e/cascader-react-island.spec.ts`

Expected: 0 failed；记录测试文件数、测试数、构建结果和三个 viewport 结果。

- [ ] **Step 5: 截图并人工查看目标打开态**

至少截取：基础双列打开、多选标签、搜索结果、loading/retry、375px 打开态。人工核对文字换行、列宽、分隔线、选中块、箭头、阴影、边界和裁切链；截图文件作为 Playwright 运行产物，不提交临时文件。

- [ ] **Step 6: 写验证记录**

`docs/verification/cascader-react-island.md` 必须列出：提交范围、真实命令和数量、三视口结果、计算几何、裁切链、截图人工结论、已知限制、`candidate_pass` 与独立验证 `pending`。

- [ ] **Step 7: 检查仅提交 Cascader 范围文件**

Run: `git status --short`

Run: `git diff --check`

确认未暂存工作树既有 Button、Link、Typography、Divider 等无关修改。

- [ ] **Step 8: 提交验收证据**

```bash
git add tests/e2e/cascader-react-island.spec.ts docs/verification/cascader-react-island.md
git commit -m "test(cascader): verify React Island delivery"
```

---

## Plan Self-Review

- Spec coverage：15 组 Demo、公共 Props、单选/多选、搜索、异步、Portal、键盘、文档和三视口均有对应任务。
- Placeholder scan：无 `TBD`、`TODO`、“适当处理”或未定义的实现步骤；明确排除能力不是占位符。
- Type consistency：全计划统一使用 `CascaderPathValue`、`CascaderOption`、`CascaderProps`、`loadMore`、`filterOption`、`dragToSort` 和 `checkedStrategy`。
- Scope：只迁移 Cascader；不扩展 Select、Form、Drawer、Modal 或全局 Token。
