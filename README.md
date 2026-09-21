# QIZHI Design System

QIZHI Design System 的规范站、设计变量与正式 React 组件工作区。

## 本地开发

```bash
corepack pnpm install
corepack pnpm dev
```

文档站默认运行在 `http://127.0.0.1:5173/`。

## 在线文档

`main` 分支更新后会通过 GitHub Actions 自动构建并部署到 GitHub Pages：

<https://wangxiaojinger.github.io/qizhi-design-system/>

仓库虽然是私有的，但 GitHub Pages 站点默认公开访问。私有仓库启用 Pages 需要仓库所有者的 GitHub 套餐支持。

## 工作区

- `packages/qizhi-tokens`：设计变量包。
- `packages/qizhi-react`：正式 React 组件包。
- `apps/qizhi-docs`：组件文档与可运行示例。

## 在其他私有项目中安装

本项目通过 GitHub Packages 发布私有包。使用者需要拥有本仓库访问权限，并创建至少包含 `read:packages` 权限的 GitHub Personal Access Token（classic）。

在使用方项目的 `.npmrc` 中配置包作用域：

```ini
@wangxiaojinger:registry=https://npm.pkg.github.com
```

GitHub Packages 凭证应写入使用者本机的用户级 `~/.npmrc`，不要提交到 Git：

```ini
//npm.pkg.github.com/:_authToken=你的令牌
```

然后安装组件包：

```bash
pnpm add @wangxiaojinger/qizhi-react
```

组件使用方式：

```tsx
import { Button } from "@wangxiaojinger/qizhi-react";
import "@wangxiaojinger/qizhi-react/style.css";

export function Example() {
  return <Button type="primary">确认</Button>;
}
```

## 发布

1. 更新 `packages/qizhi-tokens` 与 `packages/qizhi-react` 的版本号。
2. 运行 `corepack pnpm verify`。
3. 在 GitHub 创建并发布 Release。
4. `Publish GitHub Packages` 工作流会依次发布 Tokens 和 React 包。

同一版本不能重复发布。发布前应确认两个包的版本尚未存在于 GitHub Packages。
