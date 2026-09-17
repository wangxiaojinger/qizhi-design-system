import { Button, Space } from "@wangxiaojinger/qizhi-react";

export default function WrapDemo() {
  return <Space wrap size={[12, 18]} aria-label="环绕间距示例">
    {Array.from({ length: 20 }, (_, index) => <Button type="primary" key={index}>Item{index + 1}</Button>)}
  </Space>;
}
