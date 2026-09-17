import { CodePreview } from "@wangxiaojinger/qizhi-react";

const source = `interface Skill {
  name: string;
  enabled: boolean;
}

const skill: Skill = {
  name: "research-summarizer",
  enabled: true,
};`;

export default function BasicDemo() {
  return <CodePreview value={source} language="typescript" />;
}
