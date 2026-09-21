# QIZHI Design System

QIZHI Design System 的规范站、设计变量与正式 React 组件工作区。

## 本地开发

```bash
corepack pnpm install
corepack pnpm dev
```

文档站默认运行在 `http://127.0.0.1:5173/`。

## 在线文档

文档站的生产构建产物发布在独立的公开仓库 `qizhi-design-system-docs`：

<https://wangxiaojinger.github.io/qizhi-design-system-docs/>

组件源码继续保存在当前私有仓库，公开仓库只存放 `dist` 页面产物。

## 工作区

- `packages/qizhi-tokens`：设计变量包。
- `packages/qizhi-react`：正式 React 组件包。
- `apps/qizhi-docs`：组件文档与可运行示例。

## 在其他项目中使用

组件包通过 GitHub Packages 发布。使用者需要拥有本仓库访问权限，并准备至少包含 `read:packages` 权限的 GitHub Personal Access Token（classic）。完整 React 组件要求项目使用 React 和 React DOM 19 或更高版本；非 React 项目可以单独使用设计变量和 CSS。

### 1. 配置 GitHub Packages

在使用方项目的 `.npmrc` 中配置包作用域。这份文件可以提交到项目仓库：

```ini
@wangxiaojinger:registry=https://npm.pkg.github.com
always-auth=true
```

GitHub Packages 凭证应写入使用者本机的用户级 `~/.npmrc`，不要将令牌提交到 Git：

```ini
//npm.pkg.github.com/:_authToken=你的令牌
```

### 2. 安装并引用 React 组件

安装当前最新版本：

```bash
pnpm add @wangxiaojinger/qizhi-react@latest
```

在应用入口文件（例如 `main.tsx`）全局引入一次组件样式：

```tsx
import "@wangxiaojinger/qizhi-react/style.css";
```

按需引用组件：

```tsx
import { Button } from "@wangxiaojinger/qizhi-react";

export function Example() {
  return <Button type="primary">确认</Button>;
}
```

图标使用独立入口：

```tsx
import { ArrowDownIcon } from "@wangxiaojinger/qizhi-react/icon";
```

### 3. 仅使用设计变量或 CSS

Vue、原生 HTML 等非 React 项目不能直接使用 React 组件，但可以安装设计变量包：

```bash
pnpm add @wangxiaojinger/qizhi-tokens@latest
```

在全局样式文件中引入：

```css
@import "@wangxiaojinger/qizhi-tokens/style.css";
```

非 React 项目也可以引入 `@wangxiaojinger/qizhi-react/style.css`，但只能复用其中的 CSS，React 组件及交互逻辑不会自动生效。

## 更新使用方项目

组件库每次发布都必须使用新的版本号，已经发布的版本不能覆盖。使用方项目只有在升级依赖并重新构建后，才会应用新版组件与样式。

例如组件库从 `0.1.1` 发布到 `0.1.2` 后，在使用方项目执行：

```bash
pnpm add @wangxiaojinger/qizhi-react@0.1.2
pnpm build
```

如果使用方直接依赖设计变量包，也应同步升级：

```bash
pnpm add @wangxiaojinger/qizhi-tokens@0.1.2
pnpm build
```

升级后提交使用方项目更新过的 `package.json` 和 `pnpm-lock.yaml`，再重新部署。仅执行 `pnpm build` 不会自动升级依赖，因为锁文件通常仍指向旧版本。

更新流程如下：

```text
修改组件库 → 升级版本号 → 发布新版本 → 使用方升级依赖 → 重新构建和部署
```

## 发布

1. 更新 `packages/qizhi-tokens` 与 `packages/qizhi-react` 的版本号。
2. 运行 `corepack pnpm verify`。
3. 在 GitHub 创建并发布 Release。
4. `Publish GitHub Packages` 工作流会依次发布 Tokens 和 React 包。

同一版本不能重复发布。发布前应确认两个包的版本尚未存在于 GitHub Packages。
