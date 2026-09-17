import { Link } from "./Link";

describe("Link type contract", () => {
  it("separates native button and href modes", () => {
    const nativeLink = <Link htmlType="submit">提交</Link>;
    const anchorLink = <Link href="/detail" target="_blank">详情</Link>;
    const iconLink = <Link icon>链接</Link>;

    // @ts-expect-error href 模式不能同时声明原生 button 的 htmlType。
    const invalidAnchorLink = <Link href="/detail" htmlType="submit">错误组合</Link>;

    // @ts-expect-error QIZHI Link v1 不提供 loading。
    const invalidLoadingLink = <Link loading>加载中</Link>;

    expect(nativeLink.props.htmlType).toBe("submit");
    expect(anchorLink.props.href).toBe("/detail");
    expect(iconLink.props.icon).toBe(true);
    expect(invalidAnchorLink.props.href).toBe("/detail");
    expect(invalidLoadingLink.props.loading).toBe(true);
  });
});
