import { Typography } from "@wangxiaojinger/qizhi-react";

export default function HeadingsDemo() {
  return <div className="typography-headings-demo">{([1, 2, 3, 4, 5, 6] as const).map((heading) => <Typography.Title key={heading} heading={heading}>H{heading}. The Pragmatic Romanticism</Typography.Title>)}</div>;
}
