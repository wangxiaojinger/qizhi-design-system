import { ArrowDownIcon } from "./generated";

describe("direction icon type contract", () => {
  it("accepts SVG props and rejects replacement children", () => {
    const valid = <ArrowDownIcon size={20} aria-label="向下" />;

    // @ts-expect-error 图形由正式组件定义，调用方不能替换 children。
    const invalid = <ArrowDownIcon><path d="M0 0" /></ArrowDownIcon>;

    expect(valid.props.size).toBe(20);
    expect(invalid.props.children).toBeDefined();
  });
});
