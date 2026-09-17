import { Button } from "./Button";

describe("Button type contract", () => {
  it("separates native button and href modes", () => {
    const nativeButton = <Button htmlType="submit">提交</Button>;
    const linkButton = <Button href="/detail" target="_blank">详情</Button>;

    // @ts-expect-error 线框按钮已由 secondary/default 统一表达，不再提供 outline 类型。
    const removedOutlineButton = <Button type="outline">线框按钮</Button>;

    // @ts-expect-error QIZHI Button 只保留统一的方形圆角，不再暴露 shape。
    const removedCircleButton = <Button shape="circle">圆形按钮</Button>;

    // @ts-expect-error 当前业务不提供组合按钮。
    const removedButtonGroup = <Button.Group><Button>操作</Button></Button.Group>;

    // @ts-expect-error href 模式不能同时声明原生 button 的 htmlType。
    const invalidLinkButton = <Button href="/detail" htmlType="submit">错误组合</Button>;

    expect(nativeButton.props.htmlType).toBe("submit");
    expect(linkButton.props.href).toBe("/detail");
    expect(removedOutlineButton.props.type).toBe("outline");
    expect(removedCircleButton.props.shape).toBe("circle");
    expect(removedButtonGroup.type).toBeUndefined();
    expect(invalidLinkButton.props.href).toBe("/detail");
  });
});
