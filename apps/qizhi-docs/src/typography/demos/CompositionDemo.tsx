import { Typography } from "@wangxiaojinger/qizhi-react";

export default function CompositionDemo() {
  return <Typography className="typography-composition-demo">
    <Typography.Title>Design system</Typography.Title>
    <Typography.Paragraph>A design is a plan or specification for the construction of an object or system or for the implementation of an activity or process, or the result of that plan or specification in the form of a prototype, product or process.</Typography.Paragraph>
    <Typography.Paragraph>In some cases, the direct construction of an object may also be considered <Typography.Text bold>to be a design activity.</Typography.Text></Typography.Paragraph>
    <Typography.Title heading={2}>QIZHI Design</Typography.Title>
    <Typography.Paragraph>The QIZHI Design component library defines a set of default particle variables, and a custom theme is to <Typography.Text mark>customize</Typography.Text> and <Typography.Text underline>overwrite</Typography.Text> this variable list.</Typography.Paragraph>
    <Typography.Paragraph blockquote>A design is a plan or specification for the construction of an object or system in the form of a <Typography.Text code>prototype</Typography.Text>, <Typography.Text code>product</Typography.Text> or <Typography.Text code>process</Typography.Text>.</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text bold mark underline delete>A design is a plan or specification for the construction of an object or system.</Typography.Text></Typography.Paragraph>
    <div className="typography-composition-lists">
      <ul><li>Architectural blueprints<ul><li>Architectural blueprints</li></ul></li><li>Engineering drawings</li><li>Business processes</li></ul>
      <ol><li>Architectural blueprints</li><li>Engineering drawings</li><li>Business processes</li></ol>
    </div>
  </Typography>;
}
