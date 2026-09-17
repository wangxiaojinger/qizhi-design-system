import { Avatar } from "./Avatar";

describe("Avatar type contract", () => {
  it("accepts only the approved size, shape and root event surface", () => {
    const miniAvatar = <Avatar size="mini" shape="circle">A</Avatar>;
    const largeAvatar = <Avatar size="large" shape="square">QIZHI</Avatar>;

    // @ts-expect-error Avatar v1 不接受任意数字尺寸
    const numericAvatar = <Avatar size={48}>A</Avatar>;

    // @ts-expect-error Avatar v1 不提供根节点 onClick
    const clickableRoot = <Avatar onClick={() => undefined}>A</Avatar>;
    const group = <Avatar.Group size="small"><Avatar>A</Avatar></Avatar.Group>;

    expect(miniAvatar.props.size).toBe("mini");
    expect(largeAvatar.props.shape).toBe("square");
    expect(numericAvatar.props.size).toBe(48);
    expect(clickableRoot.props.onClick).toBeTypeOf("function");
    expect(group.props.size).toBe("small");
  });
});
