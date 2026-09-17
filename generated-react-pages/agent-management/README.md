# QIZHI Agent 管理 Mock Demo

## 本地运行

```bash
pnpm install
pnpm dev
```

终端会输出实际预览地址。页面只使用本地 Mock 数据，刷新浏览器后恢复初始状态。

## 校验

```bash
pnpm test
pnpm typecheck
pnpm build
python3 ../../skills/qizhi-react-page-builder/scripts/validate_react_output.py . --source-root ../.. --format markdown
node scripts/verify-browser.mjs
```

浏览器脚本默认访问 `http://127.0.0.1:5187/`，运行前需保持该 Vite 地址可访问。
