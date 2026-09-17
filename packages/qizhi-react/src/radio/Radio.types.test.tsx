import { Radio } from "./Radio";

describe("Radio type contract", () => {
  it("accepts only the approved Radio and Group surface", () => {
    const radio = <Radio value="a" type="button" size="large">选项</Radio>;
    const group = <Radio.Group defaultValue={1} options={[1, { label: "二", value: 2 }]} />;

    // @ts-expect-error Radio v1 不提供 mini 尺寸
    const mini = <Radio size="mini">选项</Radio>;
    // @ts-expect-error Radio v1 不提供卡片类型
    const card = <Radio type="card">选项</Radio>;
    // @ts-expect-error Group options 必须是值或完整 label/value 对象
    const incompleteOption = <Radio.Group options={[{ label: "缺少值" }]} />;
    // @ts-expect-error Radio v1 不公开填充模式
    const fill = <Radio mode="fill">选项</Radio>;
    // @ts-expect-error Radio.Group v1 不公开填充模式
    const fillGroup = <Radio.Group mode="fill" options={["选项"]} />;

    expect(radio.props.type).toBe("button");
    expect(group.props.defaultValue).toBe(1);
    expect(mini.props.size).toBe("mini");
    expect(card.props.type).toBe("card");
    expect(incompleteOption.props.options).toHaveLength(1);
    expect(fill.props.mode).toBe("fill");
    expect(fillGroup.props.mode).toBe("fill");
  });
});
