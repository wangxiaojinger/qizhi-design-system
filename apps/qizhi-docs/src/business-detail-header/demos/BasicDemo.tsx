import { ServiceDetailHeader } from "@wangxiaojinger/qizhi-react";

const versions = [
  {
    key: "current",
    name: "V3",
    time: "2024-11-14 15:12:03",
    operator: "静静",
    initial: "J",
    action: "—",
    disabled: true,
  },
  {
    key: "previous",
    name: "V2",
    time: "2024-11-13 18:08:26",
    operator: "安祎",
    initial: "A",
    action: "回滚至此版本",
    disabled: true,
  },
  {
    key: "initial",
    name: "V1",
    time: "2024-11-11 12:12:12",
    operator: "超杰",
    initial: "C",
    action: "回滚至此版本",
  },
] as const;

export default function BasicDemo() {
  return (
    <ServiceDetailHeader
      key="initial-version-v3"
      icon={<img src="/assets/qizhi-detail-service.svg" alt="" />}
      title="自定义-医疗服务详情"
      serviceId="dlc1bgehaev9iiaz"
      framework="自定义"
      creator="renji"
      maintainers={[
        { name: "静静", initial: "J", tone: "primary" },
        { name: "安祎", initial: "A", tone: "blue" },
        { name: "超杰", initial: "C", tone: "cyan" },
      ]}
      createdAt="2024-05-14 17:47:24"
      updatedAt="2024-05-16 13:41:12"
      defaultVersion="V3"
      versions={versions}
      tabs={[
        { key: "basic", title: "基本信息" },
        { key: "api", title: "API调用" },
      ]}
    />
  );
}
