import { Typography } from "@wangxiaojinger/qizhi-react";

const content = "A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process.";

export default function ParagraphDemo() {
  return <div className="typography-paragraph-demo">
    <section><Typography.Title heading={5}>Default</Typography.Title><Typography.Paragraph>{content}</Typography.Paragraph></section>
    <section><Typography.Title heading={5}>Secondary</Typography.Title><Typography.Paragraph type="secondary">{content}</Typography.Paragraph></section>
    <section><Typography.Title heading={5}>Spacing default</Typography.Title><Typography.Paragraph spacing="default">{content}</Typography.Paragraph></section>
    <section><Typography.Title heading={5}>Spacing close</Typography.Title><Typography.Paragraph spacing="close">{content}</Typography.Paragraph></section>
  </div>;
}
