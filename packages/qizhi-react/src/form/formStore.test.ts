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

  it("只重新校验命中的依赖字段并传入完整嵌套值", async () => {
    const store = createFormStore();
    const dependentValidator = vi.fn((_value, values) => {
      if (values.account?.password !== "new") throw new Error("密码不一致");
    });
    const unrelatedValidator = vi.fn();
    store.initialize({ account: { password: "old", confirmPassword: "old" }, nickname: "Iris" });
    store.registerField(["account", "password"], { rules: [], validateTrigger: "onChange" });
    store.registerField(["account", "confirmPassword"], {
      rules: [{ validator: dependentValidator }],
      validateTrigger: "onChange",
      dependencies: [["account", "password"]],
    });
    store.registerField("nickname", { rules: [{ validator: unrelatedValidator }], validateTrigger: "onChange" });

    store.instance.setFieldValue(["account", "password"], "new");
    await Promise.resolve();

    expect(dependentValidator).toHaveBeenCalledOnce();
    expect(dependentValidator.mock.calls[0]?.[1]).toEqual({
      account: { password: "new", confirmPassword: "old" },
      nickname: "Iris",
    });
    expect(unrelatedValidator).not.toHaveBeenCalled();
  });

  it("preserve=false 清理父路径时同步清理全部后代值与错误", () => {
    const store = createFormStore();
    store.initialize({ user: { email: "iris@qizhi.cn", profile: { name: "Iris" } } });
    const unregisterParent = store.registerField(["user"], { rules: [], validateTrigger: "onChange", preserve: false });
    const unregisterEmail = store.registerField(["user", "email"], { rules: [], validateTrigger: "onChange" });
    const unregisterName = store.registerField(["user", "profile", "name"], { rules: [], validateTrigger: "onChange" });
    store.instance.setFieldErrors(["user", "email"], ["邮箱已被占用"]);
    store.instance.setFieldErrors(["user", "profile", "name"], ["名称不可用"]);

    unregisterEmail();
    unregisterName();
    unregisterParent();

    expect(store.instance.getFieldValue(["user"])).toBeUndefined();
    expect(store.instance.getFieldError(["user", "email"])).toEqual([]);
    expect(store.instance.getFieldError(["user", "profile", "name"])).toEqual([]);
    expect(store.instance.getFieldsValue()).toEqual({});
  });

  it("路径订阅仅在监听值实际变化时通知", () => {
    const store = createFormStore();
    store.initialize({ user: { email: "iris@qizhi.cn", name: "Iris" } });
    const emailListener = vi.fn();
    const userListener = vi.fn();
    store.subscribePath(["user", "email"], emailListener);
    store.subscribePath(["user"], userListener);

    store.instance.setFieldValue(["user"], { email: "iris@qizhi.cn", name: "MaoMao" });
    expect(emailListener).not.toHaveBeenCalled();
    expect(userListener).toHaveBeenCalledOnce();

    store.instance.setFieldValue(["user", "email"], "new@qizhi.cn");
    expect(emailListener).toHaveBeenCalledOnce();
    expect(userListener).toHaveBeenCalledTimes(2);
  });
});
