import { render, screen } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import { WorkspaceProbe } from "../../apps/qizhi-docs/src/button/WorkspaceProbe";
import {
  Avatar,
  Breadcrumb,
  CameraIcon,
  Descriptions,
  HomeIcon,
  PageHeader,
  Spin,
  Steps,
  Tag,
} from "@wangxiaojinger/qizhi-react";

it("mounts a React island without replacing the legacy document shell", () => {
  render(<WorkspaceProbe />);
  expect(screen.getByTestId("qizhi-react-island")).toHaveTextContent("Button React Island");
});

it("consumes Avatar and CameraIcon from the public package boundary", () => {
  render(<Avatar aria-label="用户头像"><CameraIcon /></Avatar>);

  expect(screen.getByLabelText("用户头像")).toHaveClass("qizhi-avatar-size-default", "qizhi-avatar-shape-circle");
  expect(screen.getByLabelText("用户头像").querySelector("svg")).toBeInTheDocument();
});

it("consumes Descriptions and the existing Tag from the public package boundary", () => {
  render(
    <Descriptions title="项目信息" aria-label="项目详情">
      <Descriptions.Item label="状态"><Tag color="green">运行中</Tag></Descriptions.Item>
    </Descriptions>,
  );

  expect(screen.getByLabelText("项目详情")).toHaveClass("qizhi-descriptions-layout-horizontal");
  expect(screen.getByText("运行中").closest(".qizhi-tag")).toHaveClass("qizhi-tag-green", "qizhi-tag-size-default");
});

it("consumes Spin from the public package boundary", () => {
  render(<Spin aria-label="工作区加载中" />);
  expect(screen.getByRole("status", { name: "工作区加载中" }))
    .toHaveClass("qizhi-spin--size-20");
});

it("consumes Breadcrumb and HomeIcon from the public package boundary", () => {
  render(
    <Breadcrumb aria-label="工作区面包屑">
      <Breadcrumb.Item icon={<HomeIcon />} aria-label="首页" />
      <Breadcrumb.Item current>详情</Breadcrumb.Item>
    </Breadcrumb>,
  );

  expect(screen.getByRole("navigation", { name: "工作区面包屑" }))
    .toHaveClass("qizhi-breadcrumb");
  expect(screen.getByLabelText("首页").querySelector("svg"))
    .toBeInTheDocument();
});

it("consumes PageHeader from the public package boundary", () => {
  render(<PageHeader>工作区欢迎语</PageHeader>);
  expect(screen.getByText("工作区欢迎语").closest("header"))
    .toHaveClass("qizhi-page-header");
});

it("resolves the public icon subpath from source in a clean workspace", () => {
  const tsconfig = JSON.parse(readFileSync("tsconfig.base.json", "utf8"));

  expect(tsconfig.compilerOptions.paths["@wangxiaojinger/qizhi-react/icon"])
    .toEqual(["./packages/qizhi-react/src/icon/index.ts"]);
});

it("self-hosts the pinned Remix Icon assets without a runtime CDN dependency", () => {
  const html = readFileSync("index.html", "utf8");

  expect(html).toContain('href="./assets/remixicon/remixicon.css"');
  expect(html).not.toContain("cdn.jsdelivr.net/npm/remixicon@");
  expect(existsSync("assets/remixicon/remixicon.css")).toBe(true);
  expect(existsSync("assets/remixicon/remixicon.woff2")).toBe(true);
  expect(existsSync("assets/remixicon/LICENSE")).toBe(true);
});

it("consumes Steps from the public package boundary", () => {
  render(
    <Steps
      items={[{ title: "创建" }, { title: "完成" }]}
      current={2}
      aria-label="工作区步骤"
    />,
  );
  expect(screen.getByRole("list", { name: "工作区步骤" }))
    .toHaveClass("qizhi-steps");
});

it.each([
  ["component-code-preview", "/apps/qizhi-docs/src/code-preview/main.tsx"],
  ["component-markdown-viewer", "/apps/qizhi-docs/src/markdown-viewer/main.tsx"],
  ["component-log-viewer", "/apps/qizhi-docs/src/log-viewer/main.tsx"],
])("registers %s as a routed React Island", (id, entry) => {
  const html = readFileSync("index.html", "utf8");

  expect(html).toContain(`href="#${id}"`);
  expect(html).toContain(`<section class="doc-section" id="${id}"></section>`);
  expect(html).toContain(`src="${entry}"`);
});
