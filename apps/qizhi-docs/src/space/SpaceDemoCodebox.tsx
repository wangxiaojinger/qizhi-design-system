import { useState } from "react";
import { Button, CodeIcon, CopyIcon } from "@wangxiaojinger/qizhi-react";
import { useCopyFeedback } from "../button/useCopyFeedback";
import { CodeHighlight } from "../code/CodeHighlight";
import type { SpaceDemoDefinition } from "./spaceDocs.registry";

const renderDescription = (description: string) => description.split(/(`[^`]+`)/g).map((part, index) => (
  part.startsWith("`") && part.endsWith("`")
    ? <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>
    : part
));

export function SpaceDemoCodebox({ demo }: { demo: SpaceDemoDefinition }) {
  const [expanded, setExpanded] = useState(false);
  const { copy, message } = useCopyFeedback(demo.source);
  const Demo = demo.component;
  const codeId = `space-code-${demo.id}`;
  return <article id={demo.id} className="codebox-wrapper">
    <div className="qz-description"><div className="qz-description-children"><div className="code-preview"><div>
      <h2 className="qz-demo-title"><a tabIndex={-1} href={`#${demo.id}`}>{demo.title}</a></h2>
      <p>{renderDescription(demo.description)}</p>
    </div></div></div></div>
    <div className="demo"><Demo /></div>
    <div className="component-example-actions">
      <span className="qizhi-copy-status" role="status">{message}</span>
      <Button type="secondary" icon={<CodeIcon />} className="qizhi-code-action"
        aria-expanded={expanded} aria-controls={codeId}
        onClick={() => setExpanded((value) => !value)}>{expanded ? "收起代码" : "查看代码"}</Button>
      <Button type="secondary" icon={<CopyIcon />} className="qizhi-code-action" onClick={copy}>复制代码</Button>
    </div>
    {expanded ? <div id={codeId} className="qizhi-code-wrapper"><pre><CodeHighlight source={demo.source} /></pre></div> : null}
  </article>;
}
