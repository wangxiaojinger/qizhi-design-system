import { Progress } from "./Progress";

describe("Progress type contract", () => {
  it("limits mini size to circle progress", () => {
    const line = <Progress percent={30} size="small" />;
    const miniCircle = <Progress percent={30} type="circle" size="mini" />;

    // @ts-expect-error mini 只允许用于环形 Progress。
    const invalidLine = <Progress percent={30} type="line" size="mini" />;

    // @ts-expect-error 默认 type 是 line，不允许 mini。
    const invalidDefault = <Progress percent={30} size="mini" />;

    expect(line.props.size).toBe("small");
    expect(miniCircle.props.size).toBe("mini");
    expect(invalidLine.props.size).toBe("mini");
    expect(invalidDefault.props.size).toBe("mini");
  });
});
