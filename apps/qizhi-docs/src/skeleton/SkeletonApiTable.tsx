import { ApiTable } from "../api/ApiTable";

export function SkeletonApiTable() {
  return (
    <section id="skeleton-API" className="qizhi-api-section">
      <h2 className="qz-demo-title">
        <a tabIndex={-1} href="#skeleton-API">API</a>
      </h2>
      <p className="qizhi-api-section__note">
        只列出 QIZHI Skeleton v1 已实现能力。
      </p>
      <ApiTable api="skeletonApi" label="Skeleton API" />
    </section>
  );
}
