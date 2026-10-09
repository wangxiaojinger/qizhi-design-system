import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ModalDocsIsland } from "./ModalDocsIsland";
import { modalDemos } from "./modalDocs.registry";
import { modalApi, modalConfirmApi } from "./modalApi";

const titles = [
  "基础用法",
  "异步关闭",
  "自定义页脚",
  "确认对话框",
  "手动更新和移除",
  "带有通知对话框",
  "带有步骤条对话框",
];

test("locks the seven legacy demos and nine trigger shapes", () => {
  expect(modalDemos.map((demo) => demo.title)).toEqual(titles);
  expect(modalDemos.map((demo) => demo.description)).toEqual([
    "文本信息对话框。",
    "在对话框中使用表单时，如提交表单，点击确定后异步关闭对话框。",
    "通过按钮属性分别配置确定和取消操作；复杂场景可以直接传入自定义页脚，也可以隐藏页脚。",
    "使用 Modal.confirm() 可以快速弹出确认对话框。",
    "手动更新和关闭通过 Modal 方法创建的对话框。",
    "在对话框中显示 Alert。",
    "带有横向步骤条的对话框。",
  ]);
  render(<ModalDocsIsland />);
  expect(screen.getAllByRole("article")).toHaveLength(7);
  expect(screen.getAllByTestId("modal-trigger")).toHaveLength(9);
});

test("uses public QIZHI controls and same-source formatted TSX", () => {
  for (const demo of modalDemos) {
    expect(demo.tsxSource).toContain('from "@wangxiaojinger/qizhi-react"');
    expect(demo.tsxSource).not.toMatch(/<(input|select|button|table)\b/);
    expect(demo.tsxSource).not.toContain("ri-");
    expect(demo.tsxSource).not.toContain("style={{");
    expect(Math.max(...demo.tsxSource.split("\n").map((line) => line.length)))
      .toBeLessThanOrEqual(100);
  }
});

test("renders API from structured data without copy-style UI", () => {
  render(<ModalDocsIsland />);
  expect(screen.getByRole("table", { name: "Modal API" })).toBeVisible();
  expect(screen.getByRole("table", { name: "Modal.confirm API" })).toBeVisible();
  expect(screen.queryByRole("button", { name: "复制样式" })).not.toBeInTheDocument();
});

test("documents every public Modal.confirm option", () => {
  expect(modalConfirmApi.map((item) => item.name)).toEqual([
    "title",
    "content",
    "icon",
    "footer",
    "width",
    "okText",
    "cancelText",
    "okButtonProps",
    "cancelButtonProps",
    "closable",
    "maskClosable",
    "escToExit",
    "hideCancel",
    "afterClose",
    "getContainer",
    "onOk",
    "onCancel",
  ]);
});

test("documents the second-stage lifecycle and container APIs", () => {
  expect(modalApi.map((item) => item.name)).toEqual(expect.arrayContaining([
    "destroyOnHidden",
    "afterClose",
    "getContainer",
  ]));
  render(<ModalDocsIsland />);
  expect(screen.getByText("Modal.useModal")).toBeVisible();
  expect(screen.getByText("[modal, contextHolder]")).toBeVisible();
});
