import { afterEach, describe, expect, it } from "vitest";
import { createQizhiTheme } from "./antd-theme";

afterEach(() => document.body.style.removeProperty("--admin-primary"));

describe("createQizhiTheme", () => {
  it("maps the neutral primary Token into Ant Design", () => {
    document.body.style.setProperty("--admin-primary", "#171717");
    expect(createQizhiTheme().token?.colorPrimary).toBe("#171717");
  });
});
