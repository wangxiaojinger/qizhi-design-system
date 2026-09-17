import { ApiTable } from "../api/ApiTable";

export function AvatarApiTable() {
  return (
    <section id="avatar-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#avatar-API">API</a></h2>
      <h3>Avatar</h3>
      <p className="qizhi-api-section__note">只列出 QIZHI Avatar v1 已实现且属于本组件的能力。</p>
      <ApiTable api="avatarApi" label="Avatar API" />
      <h3>Avatar.Group</h3>
      <ApiTable api="avatarGroupApi" label="Avatar.Group API" />
    </section>
  );
}
