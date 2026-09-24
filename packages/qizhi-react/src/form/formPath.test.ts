import { describe, expect, it } from "vitest";
import { buildValueAtPath, encodeNamePath, getValueAtPath, normalizeNamePath, setValueAtPath, unsetValueAtPath } from "./formPath";

describe("formPath", () => {
  it("保留点号字符串并区分数字与字符串路径段", () => {
    expect(normalizeNamePath("user.email")).toEqual(["user.email"]);
    expect(encodeNamePath(["items", 0])).not.toBe(encodeNamePath(["items", "0"]));
  });

  it("不可变地读写和删除嵌套值", () => {
    const source = { user: { name: "Iris" }, items: [{ name: "A" }, { name: "B" }] };
    expect(getValueAtPath({ user: { email: "a@qizhi.cn" } }, ["user", "email"])).toBe("a@qizhi.cn");
    expect(setValueAtPath(source, ["user", "email"], "a@qizhi.cn")).toEqual({ ...source, user: { name: "Iris", email: "a@qizhi.cn" } });
    expect(unsetValueAtPath(source, ["items", 0])).toEqual({ user: { name: "Iris" }, items: [{ name: "B" }] });
    expect(source.items).toEqual([{ name: "A" }, { name: "B" }]);
  });

  it("按路径构造嵌套变化值", () => {
    expect(buildValueAtPath(["members", 1, "name"], "B")).toEqual({ members: [undefined, { name: "B" }] });
  });
});
