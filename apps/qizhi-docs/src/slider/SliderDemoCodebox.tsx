import { Fragment, useState } from "react";
import { Button, CodeIcon, CopyIcon } from "@wangxiaojinger/qizhi-react";
import { useCopyFeedback } from "../button/useCopyFeedback";
import { CodeHighlight } from "../code/CodeHighlight";
import type { SliderDemoDefinition } from "./sliderDocs.registry";
import "../code/demoCodebox.css";

export function SliderDemoCodebox({ demo }: { demo: SliderDemoDefinition }) {
  const [expanded, setExpanded] = useState(false);
  const copy = useCopyFeedback(demo.tsxSource);
  const Demo = demo.component;
  const codeId = `slider-code-${demo.id}`;
  return (
    <article id={demo.id} className="codebox-wrapper qizhi-react-demo-codebox">
      <div className="qz-description">
        <div className="qz-description-children">
          <div className="code-preview"><div>
            <h2 className="qz-demo-title"><a tabIndex={-1} href={`#${demo.id}`}>{demo.title}</a></h2>
            {demo.descriptions.map((description, descriptionIndex) => (
              <p key={descriptionIndex}>{description.map((part, partIndex) => (
                <Fragment key={partIndex}>{typeof part === "string" ? part : <code>{part.code}</code>}</Fragment>
              ))}</p>
            ))}
          </div></div>
        </div>
      </div>
      <div className="demo"><Demo /></div>
      <div className="component-example-actions">
        <span className="qizhi-copy-status" role="status">{copy.message}</span>
        <Button type="secondary" icon={<CodeIcon />} className="qizhi-code-action" aria-expanded={expanded} aria-controls={codeId} onClick={() => setExpanded((current) => !current)}>{expanded ? "收起代码" : "查看代码"}</Button>
        <Button type="secondary" icon={<CopyIcon />} className="qizhi-code-action" onClick={copy.copy}>复制代码</Button>
      </div>
      {expanded ? <div id={codeId} className="qizhi-code-wrapper"><pre><CodeHighlight source={demo.tsxSource} /></pre></div> : null}
    </article>
  );
}
