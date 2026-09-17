import { Divider } from "@wangxiaojinger/qizhi-react";

export default function TextDemo() {
  return (
    <div className="divider-demo-panel">
      <p>A design is a plan or specification for the construction of an object.</p>
      <Divider orientation="left">Text</Divider>
      <p>A design is a plan or specification for the construction of an object.</p>
      <Divider>Text</Divider>
      <p>A design is a plan or specification for the construction of an object.</p>
      <Divider orientation="right">Text</Divider>
    </div>
  );
}
