import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UploadDocsIsland } from "./UploadDocsIsland";
import { uploadDemos } from "./uploadDocs.registry";

const titles = [
  "基础用法", "拖拽上传", "已上传的文件列表", "上传前校验",
  "移除前校验", "上传前裁剪", "限制上传数量", "文件夹上传",
] as const;
const descriptions = [
  "最基础的上传组件用法。",
  "拖拽上传。当使用拖拽上传，且设置 accept 时，选择后的文件将会根据后缀名及文件类型进行过滤。",
  "默认的文件上传列表。",
  "beforeUpload 会在每一个文件上传之前执行。如果返回 false 或者 Promise.reject，那么将会取消当前文件的上传。",
  "onRemove 会在每个文件从上传列表中删除之前执行。如果返回 false 或者 Promise.reject，那么将会终止移除操作。",
  "beforeUpload 会在每一个文件上传之前执行。可在上传前裁剪图片，并返回裁剪后的文件继续上传。",
  "通过 limit 限制上传的最大数量。超出后上传按钮会隐藏。",
  "支持选择文件夹上传，列表会展示文件在文件夹中的相对路径。",
] as const;

describe("Upload docs", () => {
  it("locks all legacy titles, descriptions, order, and initial data", () => {
    expect(uploadDemos.map((demo) => demo.title)).toEqual(titles);
    expect(uploadDemos.map((demo) => demo.descriptionText)).toEqual(descriptions);
    expect(uploadDemos[2].tsxSource).toContain('name: "ice.png", status: "uploading", percent: 28');
    expect(uploadDemos[2].tsxSource).toContain('name: "cat.png", status: "error"');
    expect(uploadDemos[4].tsxSource).toContain('name: "light.png", status: "success"');
  });

  it("allows only public components and complete shared Demo structure", () => {
    expect(uploadDemos).toHaveLength(8);
    expect(uploadDemos.every((demo) => demo.tsxSource.includes('from "@wangxiaojinger/qizhi-react"'))).toBe(true);
    expect(uploadDemos.every((demo) => !demo.tsxSource.includes("<input"))).toBe(true);
    expect(uploadDemos.every((demo) => !demo.tsxSource.includes("ri-"))).toBe(true);
    expect(uploadDemos.every((demo) => !demo.tsxSource.includes("style={{"))).toBe(true);
    render(<UploadDocsIsland />);
    expect(screen.getAllByRole("article")).toHaveLength(8);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(8);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(8);
    expect(screen.queryByRole("button", { name: "复制样式" })).not.toBeInTheDocument();
  });
});
