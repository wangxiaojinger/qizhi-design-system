import { Descriptions } from "./Descriptions";

describe("Descriptions type contract", () => {
  it("accepts only the approved layout and label alignment surface", () => {
    const horizontal = (
      <Descriptions title="项目信息" layout="horizontal" labelAlign="right">
        <Descriptions.Item label="项目名称">QIZHI Design System</Descriptions.Item>
      </Descriptions>
    );
    const vertical = <Descriptions layout="vertical"><Descriptions.Item label="版本">1.0.0</Descriptions.Item></Descriptions>;

    // @ts-expect-error Descriptions v1 不接受未审定的布局值
    const invalidLayout = <Descriptions layout="inline" />;
    // @ts-expect-error Descriptions.Item 的 label 必填
    const missingLabel = <Descriptions.Item>值</Descriptions.Item>;

    expect(horizontal.props.labelAlign).toBe("right");
    expect(vertical.props.layout).toBe("vertical");
    expect(invalidLayout.props.layout).toBe("inline");
    expect(missingLabel.props.children).toBe("值");
  });
});
