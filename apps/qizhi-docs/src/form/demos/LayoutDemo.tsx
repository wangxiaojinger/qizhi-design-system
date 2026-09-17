import { useState } from "react";
import { Button, Form, Input, Radio, Select } from "@wangxiaojinger/qizhi-react";
import { RefreshIcon } from "@wangxiaojinger/qizhi-react/icon";
import type { FormLayout } from "@wangxiaojinger/qizhi-react";

const projectOptions = [
  { label: "公共项目", value: "public" },
  { label: "模型开发项目", value: "model" },
];

const computeOptions = [
  { label: "通用计算", value: "general" },
  { label: "异构计算", value: "heterogeneous" },
];

export default function LayoutDemo() {
  const [layout, setLayout] = useState<FormLayout>("vertical");
  const [refreshing, setRefreshing] = useState(false);

  return (
    <div className="form-docs-layout-demo">
      <div className="form-docs-layout-control">
        <span>布局</span>
        <Radio.Group
          type="button"
          name="form-layout"
          value={layout}
          onChange={(value) => setLayout(value as FormLayout)}
          aria-label="布局"
        >
          <Radio value="vertical">垂直的</Radio>
          <Radio value="horizontal">水平的</Radio>
        </Radio.Group>
      </div>
      <Form layout={layout} autoComplete="off" aria-label="表单布局示例">
        <Form.Item
          label="服务名称"
          required
          extra="支持小写字母、数字、短横线，须以字母开头。"
        >
          <Input
            aria-label="服务名称"
            allowClear={false}
            maxLength={32}
            showWordLimit
            placeholder="请输入"
          />
        </Form.Item>
        <Form.Item label="所属项目" required>
          <Select aria-label="所属项目" options={projectOptions} placeholder="请选择" />
        </Form.Item>
        <Form.Item label="计算类型组" required>
          <div className="form-docs-inline-control">
            <Select aria-label="计算类型组" options={computeOptions} placeholder="请选择" />
            <Button
              type="text"
              icon={<RefreshIcon />}
              iconOnly
              aria-label="刷新计算类型组"
              className={refreshing ? "form-docs-refresh is-refreshing" : "form-docs-refresh"}
              onClick={() => {
                setRefreshing(false);
                requestAnimationFrame(() => setRefreshing(true));
              }}
              onAnimationEnd={() => setRefreshing(false)}
            />
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

