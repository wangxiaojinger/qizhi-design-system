import { describe, expect, it, vi } from "vitest";
import { createFormStore } from "./formStore";

describe("formStore nested values", () => {
  it("跟踪程序化修改、恢复原值、列表变化和条件字段删除", () => {
    const store = createFormStore();
    store.initialize({ service: { name: "初始服务" }, endpoint: "https://api.qizhi.cn", members: [] });
    store.registerField(["service", "name"], { rules: [], validateTrigger: "onChange" });
    const unregisterEndpoint = store.registerField("endpoint", { rules: [], validateTrigger: "onChange", preserve: false });
    store.initializeList("members");

    expect(store.instance.isFieldsDirty()).toBe(false);
    store.instance.setFieldValue(["service", "name"], "新服务");
    expect(store.instance.isFieldsDirty()).toBe(true);
    store.instance.setFieldValue(["service", "name"], "初始服务");
    expect(store.instance.isFieldsDirty()).toBe(false);

    store.addListValue("members", { name: "成员甲" });
    expect(store.instance.isFieldsDirty()).toBe(true);
    store.instance.resetFields();
    expect(store.instance.isFieldsDirty()).toBe(false);

    unregisterEndpoint();
    expect(store.instance.isFieldsDirty()).toBe(true);
  });

  it("局部更新干净基线不会误清兄弟字段", () => {
    const store = createFormStore();
    store.initialize({ service: { name: "A", region: "华北" } });
    store.registerField(["service", "name"], { rules: [], validateTrigger: "onChange" });
    store.registerField(["service", "region"], { rules: [], validateTrigger: "onChange" });
    store.instance.setFieldValue(["service", "name"], "B");
    store.instance.setFieldValue(["service", "region"], "华东");

    store.instance.markFieldsClean([["service", "name"]]);

    expect(store.instance.isFieldsDirty([["service", "name"]])).toBe(false);
    expect(store.instance.isFieldsDirty([["service", "region"]])).toBe(true);
    expect(store.instance.isFieldsDirty()).toBe(true);
  });

  it("只允许同一字段最新一次异步校验结果生效", async () => {
    const store = createFormStore();
    const pending = new Map<string, { resolve: () => void; reject: (error: Error) => void }>();
    store.registerField("serviceName", {
      validateTrigger: "onChange",
      rules: [{ validator: (value) => new Promise<void>((resolve, reject) => pending.set(String(value), { resolve, reject })) }],
    });

    store.instance.setFieldValue("serviceName", "old");
    const oldValidation = store.validateField("serviceName");
    store.instance.setFieldValue("serviceName", "new");
    const newValidation = store.validateField("serviceName");
    pending.get("new")?.resolve();
    await newValidation;
    pending.get("old")?.reject(new Error("旧名称不可用"));
    await oldValidation;

    expect(store.instance.getFieldError("serviceName")).toEqual([]);
    expect(store.isFieldValidating("serviceName")).toBe(false);
  });

  it("字段卸载或重置后忽略仍在进行的旧校验", async () => {
    const store = createFormStore();
    const rejects: Array<(error: Error) => void> = [];
    const config = { validateTrigger: "onChange" as const, rules: [{ validator: () => new Promise<void>((_resolve, reject) => rejects.push(reject)) }] };
    const unregister = store.registerField("serviceName", config);
    const unmountedValidation = store.validateField("serviceName");
    unregister();
    rejects[0]?.(new Error("卸载后的旧错误"));
    await unmountedValidation;
    expect(store.instance.getFieldError("serviceName")).toEqual([]);

    store.registerField("serviceName", config);
    const resetValidation = store.validateField("serviceName");
    store.instance.resetFields(["serviceName"]);
    rejects[1]?.(new Error("重置前的旧错误"));
    await resetValidation;
    expect(store.instance.getFieldError("serviceName")).toEqual([]);
    expect(store.isFieldValidating("serviceName")).toBe(false);
  });

  it("网络校验异常走表单级回调且不写入字段错误", async () => {
    const store = createFormStore();
    const onValidationException = vi.fn();
    store.setCallbacks({ onValidationException });
    store.registerField("region", {
      validateTrigger: "onChange",
      rules: [{ validator: () => ({ type: "network", message: "区域服务不可用" }) }],
    });

    await expect(store.validateField("region")).rejects.toEqual({
      name: "region",
      type: "network",
      message: "区域服务不可用",
      cause: undefined,
    });
    expect(onValidationException).toHaveBeenCalledOnce();
    expect(store.instance.getFieldError("region")).toEqual([]);
  });

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
