import { useState } from "react";
import { Button } from "@wangxiaojinger/qizhi-react";
import { CodeHighlight } from "../code/CodeHighlight";
import type { ButtonDemoDefinition } from "./buttonDocs.registry";
import { useCopyFeedback } from "./useCopyFeedback";

export function DemoCodebox({ demo }: { demo: ButtonDemoDefinition }) {
  const [expanded, setExpanded] = useState(false);
  const { copy, message } = useCopyFeedback(demo.source);
  const Demo = demo.component;
  const codeId = `button-code-${demo.id}`;
  return <article id={demo.id} className="codebox-wrapper">
    <div className="qz-description"><div className="qz-description-children"><div className="code-preview"><div><h2 className="qz-demo-title"><a tabIndex={-1} href={`#${demo.id}`}>{demo.title}</a></h2><p>{demo.description}</p></div></div></div></div>
    <div className="demo"><Demo /></div>
    <div className="component-example-actions">
      <span className="qizhi-copy-status" role="status">{message}</span>
      <Button type="secondary" icon={<i className="ri-code-s-slash-line" aria-hidden="true" />} className="qizhi-code-action" aria-expanded={expanded} aria-controls={codeId} onClick={() => setExpanded((value) => !value)}>{expanded ? "收起代码" : "查看代码"}</Button>
      <Button type="secondary" icon={<i className="ri-file-copy-line" aria-hidden="true" />} className="qizhi-code-action" onClick={copy}>复制代码</Button>
    </div>
    {expanded ? <div id={codeId} className="qizhi-code-wrapper"><pre><CodeHighlight source={demo.source} /></pre></div> : null}
  </article>;
}
