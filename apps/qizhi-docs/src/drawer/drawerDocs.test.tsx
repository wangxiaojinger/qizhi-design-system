import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { DrawerDocsIsland } from "./DrawerDocsIsland";
import { drawerDemos } from "./drawerDocs.registry";
import { drawerApi } from "./drawerApi";

const titles = ["基础用法", "抽屉表单"];
const descriptions = [
  "基础抽屉，点击触发按钮抽屉从右侧滑出，点击遮罩区关闭。",
  "在抽屉中承载创建表单，适合不中断主流程的复杂配置。",
];

describe("Drawer legacy contract", () => {
  test("locks both demos in exact order with original copy and data", () => {
    expect(drawerDemos.map((demo) => demo.title)).toEqual(titles);
    expect(drawerDemos.map((demo) => demo.description)).toEqual(descriptions);
    expect(drawerDemos[0].tsxSource).toContain('title="基础信息"');
    expect(drawerDemos[0].tsxSource.match(/这里是抽屉中的示例文本。/g)).toHaveLength(2);
    expect(drawerDemos[1].tsxSource).toContain('title="新建交互式建模"');
    expect(drawerDemos[1].tsxSource).toContain('suffix="0 / 32"');
    expect(drawerDemos[1].tsxSource).toContain('"默认项目", "研发项目", "公共项目"');
    expect(drawerDemos[1].tsxSource).toContain('"PyTorch 2.4 CUDA 12.1"');
    expect(drawerDemos[1].tsxSource).toContain('"通用计算", "GPU 计算", "高性能计算"');
    expect(drawerDemos[1].tsxSource).toContain('defaultValue="official"');
    expect(drawerDemos[1].tsxSource).toContain('defaultValue="4.3"');
    expect(drawerDemos[1].tsxSource).toContain('defaultValue="V1.101.2"');
    expect(drawerDemos[1].tsxSource).toContain("取 消");
    expect(drawerDemos[1].tsxSource).toContain("新 建");
  });

  test("demos compose public controls and do not rebuild component capabilities", () => {
    for (const demo of drawerDemos) {
      expect(demo.tsxSource).toContain('from "@wangxiaojinger/qizhi-react"');
      expect(demo.tsxSource).not.toMatch(/<(input|select|textarea|button)\b/);
      expect(demo.tsxSource).not.toContain("ri-");
      expect(demo.tsxSource).not.toContain("style={{");
      expect(demo.tsxSource).not.toContain("qizhi-drawer-");
      expect(demo.tsxSource).not.toContain("component-example-actions");
    }
  });

  test("renders the complete shared codebox and structured API", () => {
    render(<DrawerDocsIsland />);
    expect(screen.getAllByRole("article")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "查看代码" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "复制代码" })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "复制样式" })).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Drawer API" })).toBeVisible();
    expect(drawerApi.map((item) => item.name)).toEqual([
      "open", "title", "children", "footer", "width", "closable",
      "maskClosable", "escToClose", "onClose", "className", "style",
    ]);
  });
});
