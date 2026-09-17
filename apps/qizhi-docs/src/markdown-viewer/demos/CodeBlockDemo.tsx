import { MarkdownViewer } from "@wangxiaojinger/qizhi-react";

const content = `## TypeScript

\`\`\`ts
interface Agent {
  id: string;
  running: boolean;
}
\`\`\`

## Python

\`\`\`python
agent = {"id": "agent-01", "running": True}
\`\`\``;

export default function CodeBlockDemo() {
  return <MarkdownViewer value={content} />;
}
