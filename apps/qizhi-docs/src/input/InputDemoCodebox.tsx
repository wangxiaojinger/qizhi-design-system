import { useState } from "react";
import { Button, CodeIcon, CopyIcon } from "@wangxiaojinger/qizhi-react";
import { useCopyFeedback } from "../button/useCopyFeedback";
import { CodeHighlight } from "../code/CodeHighlight";
import type { InputDemoDefinition } from "./inputDocs.registry";

export function InputDemoCodebox({ demo }: { demo: InputDemoDefinition }) {
  const [expanded, setExpanded] = useState(false);
  const tsxCopy = useCopyFeedback(demo.tsxSource);
  const cssCopy = useCopyFeedback(demo.cssSource);
  const Demo = demo.component;
  const codeId = `input-code-${demo.id}`;

  return (
    <article id={demo.id} className="codebox-wrapper">
      <div className="qz-description">
        <div className="qz-description-children">
          <div className="code-preview">
            <div>
              <h2 className="qz-demo-title">
                <a tabIndex={-1} href={`#${demo.id}`}>{demo.title}</a>
              </h2>
              {demo.description.map((text) => <p key={text}>{text}</p>)}
            </div>
          </div>
        </div>
      </div>
      <div className="demo"><Demo /></div>
      <div className="component-example-actions">
        <span className="qizhi-copy-status" role="status">
          {tsxCopy.message || cssCopy.message}
        </span>
        <Button
          type="secondary"
          icon={<CodeIcon />}
          className="qizhi-code-action"
          aria-expanded={expanded}
          aria-controls={codeId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "收起代码" : "查看代码"}
        </Button>
        <Button
          type="secondary"
          icon={<CopyIcon />}
          className="qizhi-code-action"
          onClick={tsxCopy.copy}
        >
          复制代码
        </Button>
        <Button
          type="secondary"
          icon={<CopyIcon />}
          className="qizhi-code-action"
          onClick={cssCopy.copy}
        >
          复制样式
        </Button>
      </div>
      {expanded ? (
        <div id={codeId} className="qizhi-code-wrapper">
          <div className="qizhi-code-source-label">TSX</div>
          <pre><CodeHighlight source={demo.tsxSource} /></pre>
          <div className="qizhi-code-source-label">CSS</div>
          <pre><CodeHighlight source={demo.cssSource} /></pre>
        </div>
      ) : null}
    </article>
  );
}
