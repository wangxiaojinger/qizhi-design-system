import { useEffect } from "react";
import { DetailHeaderApiTable } from "./DetailHeaderApiTable";
import { DetailHeaderDemoCodebox } from "./DetailHeaderDemoCodebox";
import { detailHeaderDemos } from "./detailHeaderDocs.registry";
import "./detailHeaderDocs.css";

const guidance = [
  "服务状态与列表页使用同一状态语义和文案，避免详情页产生独立状态体系。",
  "页面级操作与列表页权限保持一致；示例中的上线／下线由同一按钮切换真实状态。",
  "部署版本点击后直接打开版本列表抽屉，不在详情头部内切换版本。",
  "底部页签只切换同一对象的详情内容，不改变当前对象身份。",
];

export function DetailHeaderDocsIsland() {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("qizhi:react-island-ready"));
  }, []);
  return (
    <>
      <div className="qz-nav-intro">
        <p>
          业务组件 <span className="separator">/</span> <strong>业务卡片</strong>
        </p>
        <h1 id="业务卡片-详情头部">详情头部</h1>
        <p>
          用于详情页顶部集中展示对象身份、服务状态、关键属性、审计信息与页面级操作，并承接详情内容页签。
        </p>
      </div>
      <div className="component-examples qizhi-components-wrapper">
        {detailHeaderDemos.map((demo) => (
          <DetailHeaderDemoCodebox key={demo.id} demo={demo} />
        ))}
        <section
          id="详情头部-交互说明"
          className="codebox-wrapper detail-header-guidance"
        >
          <div className="qz-description">
            <div className="qz-description-children">
              <div className="code-preview">
                <div>
                  <h2 className="qz-demo-title">
                    <a tabIndex={-1} href="#详情头部-交互说明">
                      交互说明
                    </a>
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="demo">
            <ul>{guidance.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>
        <DetailHeaderApiTable />
      </div>
    </>
  );
}
