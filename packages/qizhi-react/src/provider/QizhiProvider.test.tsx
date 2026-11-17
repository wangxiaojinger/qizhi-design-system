import { render } from "@testing-library/react";
import { Button, Form, Input } from "antd";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QizhiProvider } from "./QizhiProvider";

afterEach(() => {
  delete document.documentElement.dataset.theme;
  delete document.body.dataset.theme;
  vi.unstubAllGlobals();
});

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, media: "", addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true }));
});

describe("QizhiProvider", () => {
  it("sets and clears the document theme attribute", () => {
    const { rerender } = render(<QizhiProvider theme="dark"><span>内容</span></QizhiProvider>);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.body.dataset.theme).toBe("dark");

    rerender(<QizhiProvider theme="light"><span>内容</span></QizhiProvider>);

    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(document.body.dataset.theme).toBeUndefined();
  });

  it("forwards supported non-theme ConfigProvider settings", () => {
    const { container, getByRole } = render(
      <QizhiProvider componentDisabled componentSize="small" direction="rtl" form={{ requiredMark: false }} prefixCls="qizhi">
        <Button>保存</Button>
        <Form><Form.Item label="名称" required><Input /></Form.Item></Form>
      </QizhiProvider>,
    );

    const saveButton = getByRole("button", { name: /保\s*存/ }) as HTMLButtonElement;
    expect(saveButton.className).toContain("qizhi-btn");
    expect(saveButton.className).toContain("qizhi-btn-sm");
    expect(saveButton.disabled).toBe(true);
    expect(saveButton.className).toContain("qizhi-btn-rtl");
    expect(container.querySelector(".qizhi-form-hide-required-mark")).not.toBeNull();
  });

  it("warns about nested theme owners in development", () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<QizhiProvider><QizhiProvider><span>内容</span></QizhiProvider></QizhiProvider>);
    expect(warning).toHaveBeenCalledWith("QizhiProvider must be mounted once per React root because it owns the Ant Design theme.");
    warning.mockRestore();
  });
});
