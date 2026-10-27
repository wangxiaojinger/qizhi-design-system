import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import CustomizationDemo, {
  clearModelCatalogLayout,
  createModelCatalogStorageKey,
  defaultModelCatalogLayout,
  modelCatalogColumns,
  readModelCatalogLayout,
  saveModelCatalogLayout,
} from "./CustomizationDemo";

const pricingNoticeText = "模型数据与价格均为演示，非真实报价。";

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("CustomizationDemo", () => {
  it("encodes every layout scope component so user and workspace layouts stay isolated", () => {
    const userKey = createModelCatalogStorageKey({
      app: "qways / catalog",
      user: "iris@example.com",
      space: "个人空间 / A",
    });
    const workspaceKey = createModelCatalogStorageKey({
      app: "qways / catalog",
      user: "workspace",
      space: "设计协作 / 研发",
    });

    expect(userKey).toContain("app=qways%20%2F%20catalog");
    expect(userKey).toContain("user=iris%40example.com");
    expect(userKey).toContain("space=%E4%B8%AA%E4%BA%BA%E7%A9%BA%E9%97%B4%20%2F%20A");
    expect(userKey).not.toBe(workspaceKey);
    expect(userKey).toContain("table=model-catalog");
    expect(userKey).toContain("business=v1");
  });

  it(
    "falls back for damaged data and leaves the current layout intact when storage writes fail",
    () => {
      const key = createModelCatalogStorageKey({
        app: "qways",
        user: "user-a",
        space: "personal",
      });
      const storage = {
        getItem: vi.fn(() => "{not-json"),
        setItem: vi.fn(() => { throw new Error("quota"); }),
        removeItem: vi.fn(() => { throw new Error("quota"); }),
      };
      const defaultLayout = defaultModelCatalogLayout();
      const currentLayout = {
        ...defaultLayout,
        columnWidths: { name: 240 },
      };

      expect(readModelCatalogLayout(modelCatalogColumns, storage, key)).toEqual(defaultLayout);
      expect(saveModelCatalogLayout(storage, key, currentLayout)).toBe(false);
      expect(clearModelCatalogLayout(storage, key)).toBe(false);
      expect(currentLayout.columnWidths).toEqual({ name: 240 });
    },
  );

  it(
    "renders the Qways catalog, never writes on initialization, and remounts a new scope",
    async () => {
      const user = userEvent.setup();
      const setItem = vi.spyOn(Storage.prototype, "setItem");
      const removeItem = vi.spyOn(Storage.prototype, "removeItem");

      render(<CustomizationDemo />);

      expect(screen.getByRole("table", { name: "Qways 模型目录" })).toBeVisible();
      const pricingNotice = screen.getByText(pricingNoticeText);
      expect(pricingNotice).toBeVisible();
      expect(screen.getByText("qways/chat-pro-32k")).toBeVisible();
      const availableTag = screen.getAllByText("可用")[0].closest(".qizhi-tag");
      expect(availableTag).not.toHaveClass("qizhi-tag-green");
      expect(screen.getByText("+1")).toBeVisible();
      expect(screen.getByRole("switch", { name: "列设置入口" })).toBeChecked();
      expect(setItem).not.toHaveBeenCalled();
      expect(removeItem).not.toHaveBeenCalled();

      await user.click(screen.getByRole("combobox", { name: "布局作用域" }));
      await user.click(screen.getByRole("option", { name: "用户 B（个人）" }));

      expect(screen.getByText(/当前作用域：用户 B（个人）/)).toBeVisible();
      expect(setItem).not.toHaveBeenCalled();
      expect(removeItem).not.toHaveBeenCalled();
    },
  );
});
