import { afterEach, describe, expect, it } from "vitest";
import { createQizhiTheme } from "./antd-theme";
import { qizhiComponentConfig } from "./component-config";

afterEach(() => {
  for (const name of ["--admin-primary", "--control-accent", "--admin-sidebar", "--admin-accent"]) document.body.style.removeProperty(name);
});

describe("createQizhiTheme", () => {
  it("maps the neutral primary Token into Ant Design", () => {
    document.body.style.setProperty("--admin-primary", "#171717");
    expect(createQizhiTheme().token?.colorPrimary).toBe("#171717");
  });

  it("keeps interactive controls and layout on the neutral admin contract", () => {
    document.body.style.setProperty("--admin-primary", "#171717");
    document.body.style.setProperty("--control-accent", "#171717");
    document.body.style.setProperty("--admin-sidebar", "#fafafa");
    document.body.style.setProperty("--admin-accent", "#f5f5f5");
    const theme = createQizhiTheme();
    expect(theme.components?.Switch?.colorPrimary).toBe("#171717");
    expect(theme.components?.Layout?.siderBg).toBe("#fafafa");
    expect(theme.components?.Table?.rowSelectedBg).toBeDefined();
  });

  it("keeps drawer presentation in ConfigProvider public styles", () => {
    expect(typeof qizhiComponentConfig.drawer.styles).toBe("function");
  });
});
