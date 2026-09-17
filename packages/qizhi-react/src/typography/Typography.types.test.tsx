import { Typography } from "./Typography";
import type { TypographyTextType } from "./Typography.types";

describe("Typography type contract", () => {
  it("accepts approved native props and rejects capabilities outside v1", () => {
    const validType: TypographyTextType = "warning";
    const root = <Typography id="content">内容</Typography>;
    const title = <Typography.Title heading={6} id="title">标题</Typography.Title>;
    const text = <Typography.Text type="primary" onClick={(event) => event.currentTarget.focus()}>文本</Typography.Text>;
    const paragraph = <Typography.Paragraph spacing="close" blockquote cite="https://example.com">引用</Typography.Paragraph>;
    const ellipsis = <Typography.Ellipsis rows={2} expandable>需要省略的文本</Typography.Ellipsis>;

    // @ts-expect-error Typography only supports the approved semantic text types.
    const invalidType = <Typography.Text type="info">错误类型</Typography.Text>;
    // @ts-expect-error Heading is limited to semantic h1-h6 levels.
    const invalidHeading = <Typography.Title heading={7}>错误标题</Typography.Title>;
    // @ts-expect-error Copy behavior is not part of the approved v1 contract.
    const invalidCopy = <Typography.Text copyable>不可复制</Typography.Text>;
    // @ts-expect-error Legacy ellipsis props are not exposed on text components.
    const invalidLegacyEllipsis = <Typography.Text ellipsis>旧省略属性</Typography.Text>;
    // @ts-expect-error Typography.Ellipsis v1 accepts plain strings only.
    const invalidEllipsisChildren = <Typography.Ellipsis><strong>复杂节点</strong></Typography.Ellipsis>;

    expect(validType).toBe("warning");
    expect(root.props.id).toBe("content");
    expect(title.props.heading).toBe(6);
    expect(text.props.type).toBe("primary");
    expect(paragraph.props.spacing).toBe("close");
    expect(ellipsis.props.rows).toBe(2);
    expect(invalidType.props.type).toBe("info");
    expect(invalidHeading.props.heading).toBe(7);
    expect(invalidCopy.props.copyable).toBe(true);
    expect(invalidLegacyEllipsis.props.ellipsis).toBe(true);
    expect(invalidEllipsisChildren.props.children.type).toBe("strong");
  });
});
