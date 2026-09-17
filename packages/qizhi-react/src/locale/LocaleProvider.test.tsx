import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider, useLocale } from "./LocaleProvider";

function Probe() {
  const { locale, setLocale, t } = useLocale();
  return (
    <>
      <span>{locale}</span>
      <span>{t("custom.welcome", "Fallback")}</span>
      <button type="button" onClick={() => setLocale("en-US")}>English</button>
    </>
  );
}

describe("LocaleProvider", () => {
  it("provides merged messages and changes locale globally", async () => {
    const onLocaleChange = vi.fn();
    render(
      <LocaleProvider
        defaultLocale="zh-CN"
        messages={{
          "zh-CN": { "custom.welcome": "欢迎" },
          "en-US": { "custom.welcome": "Welcome" },
        }}
        onLocaleChange={onLocaleChange}
      >
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByText("欢迎")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByText("en-US")).toBeInTheDocument();
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(onLocaleChange).toHaveBeenCalledWith("en-US");
  });

  it("persists and restores the selected locale", async () => {
    const view = render(
      <LocaleProvider defaultLocale="zh-CN" storageKey="qizhi-test-locale">
        <Probe />
      </LocaleProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(localStorage.getItem("qizhi-test-locale")).toBe("en-US");
    view.unmount();
    render(
      <LocaleProvider defaultLocale="zh-CN" storageKey="qizhi-test-locale">
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByText("en-US")).toBeInTheDocument();
  });
});
