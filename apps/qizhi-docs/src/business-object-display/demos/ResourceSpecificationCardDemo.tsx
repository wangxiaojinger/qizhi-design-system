import { ResourceSpecificationCard } from "@wangxiaojinger/qizhi-react";

export default function ResourceSpecificationCardDemo() {
  return (
    <ResourceSpecificationCard
      resourceModel="NVIDIA A100（32GB）"
      cpu={{ value: 24, total: 64 }}
      memory={{ value: "1957.00", total: "1965.00" }}
      gpu={{ value: 16, total: 32 }}
    />
  );
}
