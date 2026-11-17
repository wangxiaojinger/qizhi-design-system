import { afterEach, describe, expect, it } from "vitest";
import { createQizhiTheme, cssToken } from "./antd-theme";
import { createQizhiComponentConfig, qizhiComponentConfig } from "./component-config";

afterEach(() => {
  for (const name of ["--admin-primary", "--admin-brand-identity", "--control-accent", "--admin-sidebar", "--admin-accent"]) document.body.style.removeProperty(name);
});

describe("createQizhiTheme", () => {
  it("maps the neutral primary Token into Ant Design", () => {
    document.body.style.setProperty("--admin-primary", "#171717");
    const theme = createQizhiTheme();
    expect(theme.inherit).toBe(false);
    expect(theme.token?.colorPrimary).toBe("#171717");
  });

  it("publishes the brand identity Token without replacing the neutral primary theme", () => {
    document.body.style.setProperty("--admin-primary", "#171717");
    document.body.style.setProperty("--admin-brand-identity", "#3366ff");
    expect(cssToken("--admin-brand-identity")).toBe("#3366ff");
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

  it("allows Form behaviour without allowing a consumer to replace QIZHI Form styles", () => {
    const config = createQizhiComponentConfig({ requiredMark: false, classNames: { root: "unsafe" } } as never);
    expect(config.form?.requiredMark).toBe(false);
    expect(config.form?.styles).toBe(qizhiComponentConfig.form.styles);
    expect(config.form?.classNames).toBeUndefined();
  });
});
