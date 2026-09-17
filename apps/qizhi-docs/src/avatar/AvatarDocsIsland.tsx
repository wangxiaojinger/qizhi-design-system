import { useEffect } from "react";
import { AvatarApiTable } from "./AvatarApiTable";
import { AvatarDemoCodebox } from "./AvatarDemoCodebox";
import { avatarDemos } from "./avatarDocs.registry";
import "./avatarDocs.css";

export function AvatarDocsIsland() {
  useEffect(() => { window.dispatchEvent(new CustomEvent("qizhi:react-island-ready")); }, []);
  return (
    <>
      <div className="component-intro"><div className="component-intro-meta">组件 / 数据展示</div><div className="component-intro-head"><div className="component-intro-copy"><h3>头像 Avatar</h3><p>用作头像显示，可以为图片、图标或字符形式展示。</p></div></div></div>
      <div className="component-examples qizhi-components-wrapper">
        {avatarDemos.map((demo) => <AvatarDemoCodebox key={demo.id} demo={demo} />)}
        <AvatarApiTable />
      </div>
    </>
  );
}
