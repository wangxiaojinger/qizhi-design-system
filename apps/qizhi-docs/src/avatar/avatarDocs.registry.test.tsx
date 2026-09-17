import { describe, expect, it } from "vitest";
import { avatarDemos } from "./avatarDocs.registry";

describe("Avatar docs registry", () => {
  it("keeps the five approved legacy demos in order with source-identical TSX", () => {
    expect(avatarDemos.map(({ id, title, description }) => ({ id, title, description }))).toEqual([
      { id: "avatar-basic", title: "基础用法", description: "头像的基础使用。如果头像是文字的话，会自动调节字体大小，来适应头像框。" },
      { id: "avatar-size-shape", title: "大小和形状", description: "通过设置 size 字段，可以调节头像的大小，默认大小为 40px。设置 shape 字段，可以设置头像是圆形 (circle) 还是正方形 (square)。" },
      { id: "avatar-group", title: "头像组", description: "使用 Avatar.Group 可以使用头像组功能，可通过 size 指定头像的大小。" },
      { id: "avatar-trigger", title: "交互按钮", description: "可以通过 triggerIcon triggerType 来定制交互按钮，类型有 mask (遮罩) 和 button (按钮) 两种，通过 onTriggerClick 参数来添加回调。" },
      { id: "avatar-auto-fit", title: "自动调整字体大小", description: "如果头像是文字的话，会自动调节字体大小，来适应头像框。" },
    ]);

    avatarDemos.forEach((demo) => {
      expect(demo.source).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.source).not.toMatch(/Demo\.tsx|Demo\.css|ri-|Dropdown/);
    });
  });
});
