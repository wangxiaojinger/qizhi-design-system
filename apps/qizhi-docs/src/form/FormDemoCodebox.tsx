import { useState } from "react";
import { Button, CodeIcon, CopyIcon } from "@wangxiaojinger/qizhi-react";
import { useCopyFeedback } from "../button/useCopyFeedback";
import { CodeHighlight } from "../code/CodeHighlight";
import type { FormDemoDefinition } from "./formDocs.registry";

export function FormDemoCodebox({ demo }: { demo: FormDemoDefinition }) {
  const [expanded, setExpanded] = useState(false);
  const { copy, message } = useCopyFeedback(demo.source);
  const Demo = demo.component;
  const codeId = `form-code-${demo.id}`;

  return (
    <article id={demo.id} className="codebox-wrapper">
      <div className="qz-description">
        <div className="qz-description-children">
          <div className="code-preview">
            <div>
              <h2 className="qz-demo-title"><a tabIndex={-1} href={`#${demo.id}`}>{demo.title}</a></h2>
              <p>{demo.title === "表单布局" ? <><code>Form</code> 支持垂直和水平两种排列方式。</> : demo.description}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="demo"><Demo /></div>
      <div className="component-example-actions">
        <span className="qizhi-copy-status" role="status">{message}</span>
        <Button
          type="secondary"
          icon={<CodeIcon />}
          className="qizhi-code-action"
          aria-expanded={expanded}
          aria-controls={codeId}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "收起代码" : "查看代码"}
        </Button>
        <Button type="secondary" icon={<CopyIcon />} className="qizhi-code-action" onClick={copy}>
          复制代码
        </Button>
      </div>
      {expanded ? <div id={codeId} className="qizhi-code-wrapper"><pre><CodeHighlight source={demo.source} /></pre></div> : null}
    </article>
  );
}

