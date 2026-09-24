import { describe, expect, it, vi } from "vitest";
import { createFormStore } from "./formStore";

describe("formStore nested values", () => {
  it("读写嵌套字段并保留未覆盖的兄弟值", () => {
    const store = createFormStore();
    store.initialize({ user: { name: "Iris", email: "old@qizhi.cn" } });
    const unregisterName = store.registerField(["user", "name"], { rules: [], validateTrigger: "onChange" });
    const unregisterEmail = store.registerField(["user", "email"], { rules: [], validateTrigger: "onChange" });
    store.instance.setFieldsValue({ user: { email: "new@qizhi.cn" } });
    expect(store.instance.getFieldValue(["user", "email"])).toBe("new@qizhi.cn");
    expect(store.instance.getFieldsValue()).toEqual({ user: { name: "Iris", email: "new@qizhi.cn" } });
    unregisterName(); unregisterEmail();
  });

  it("使用数组路径回填后端错误", () => {
    const store = createFormStore();
    store.instance.setFieldErrors(["members", 1, "name"], ["名称已存在"]);
    expect(store.instance.getFieldError(["members", 1, "name"])).toEqual(["名称已存在"]);
  });

  it("程序化修改源字段时重新校验依赖字段", async () => {
    const store = createFormStore();
    const validator = vi.fn();
    store.registerField("password", { rules: [], validateTrigger: "onChange" });
    store.registerField("confirmPassword", { rules: [{ validator }], validateTrigger: "onChange", dependencies: ["password"] });
    store.instance.setFieldValue("password", "new");
    await Promise.resolve();
    expect(validator).toHaveBeenCalledOnce();
  });
});
