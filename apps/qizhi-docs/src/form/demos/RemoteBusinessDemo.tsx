import { useEffect, useState } from "react";
import { AutoComplete, Button, Form, Input, Message, Select } from "@wangxiaojinger/qizhi-react";
import type { FormValidationException } from "@wangxiaojinger/qizhi-react";

type QueryState = "ready" | "loading" | "empty" | "error";

function validateServiceEndpoint(value: unknown) {
  if (!value) return;
  try {
    const url = new URL(String(value));
    const hostname = url.hostname;
    const isIpAddress = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith("[");
    const suffix = hostname.split(".").at(-1) ?? "";
    const hasCompleteDomain = hostname.includes(".") && suffix.length >= 2;
    if (!(["http:", "https:"].includes(url.protocol) && (hostname === "localhost" || isIpAddress || hasCompleteDomain))) throw new Error();
  } catch {
    throw new Error("请输入完整的 HTTP(S) 服务地址");
  }
}

function ConditionalRemoteFields() {
  const serviceType = Form.useWatch(["service", "type"]);

  if (serviceType !== "remote") return null;

  return (
    <>
      <Form.Item
        name={["service", "endpoint"]}
        label="服务地址"
        preserve={false}
        rules={[
          { required: true, message: "请输入服务地址" },
          { validator: validateServiceEndpoint },
        ]}
      >
        <Input aria-label="服务地址" allowClear={false} />
      </Form.Item>
      <Form.Item name={["service", "region"]} label="部署区域" preserve={false}>
        <RemoteRegionInput />
      </Form.Item>
    </>
  );
}

function RemoteRegionInput(props: { value?: string; onChange?: (value: string) => void }) {
  const [queryState, setQueryState] = useState<QueryState>("ready");

  const handleSearch = (value: string) => {
    if (value === "loading") setQueryState("loading");
    else if (value === "empty") setQueryState("empty");
    else if (value === "error") setQueryState("error");
    else setQueryState("ready");
  };

  return (
    <AutoComplete
      {...props}
      aria-label="部署区域"
      data={queryState === "ready" ? ["华北", "华东", "华南"] : []}
      filterOption={false}
      loading={queryState === "loading"}
      emptyContent="暂无匹配区域"
      error={queryState === "error" ? "区域查询失败" : undefined}
      onRetry={() => setQueryState("ready")}
      onSearch={handleSearch}
      placeholder="输入 loading、empty 或 error"
    />
  );
}

export default function RemoteBusinessDemo() {
  const [form] = Form.useForm();
  const dirty = Form.useDirty(form);
  const [networkError, setNetworkError] = useState("");

  useEffect(() => {
    if (!dirty) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const handleValidationException = (exception: FormValidationException) => {
    setNetworkError(exception.message);
  };

  return (
    <Form
      form={form}
      aria-label="远程联动与未保存修改"
      initialValues={{
        service: {
          name: "service-a",
          type: "remote",
          endpoint: "https://api.qizhi.cn",
          region: "华北",
        },
      }}
      onValidationException={handleValidationException}
      onFinish={() => {
        Message.success({ content: "提交成功" });
      }}
    >
      <output className="form-docs-dirty-status" aria-label="未保存修改状态">
        {dirty ? "有未保存修改" : "所有修改已保存"}
      </output>

      <Form.Item
        name={["service", "name"]}
        label="服务名称"
        validateTrigger="onChange"
        required
        rules={[
          { required: true, message: "请输入服务名称" },
          { pattern: /^[a-z][a-z0-9-]*$/, message: "须以小写字母开头，仅支持小写字母、数字和短横线" },
          {
            validator: async (value) => {
              const current = String(value ?? "");
              await new Promise((resolve) => window.setTimeout(resolve, current === "slow-invalid" ? 120 : 10));
              if (current === "slow-invalid") return { type: "field", message: "旧请求返回的名称错误" };
              if (current === "network-service") return { type: "network", message: "名称校验服务暂不可用" };
            },
          },
        ]}
      >
        <Input aria-label="远程服务名称" allowClear={false} onChange={() => setNetworkError("")} />
      </Form.Item>

      <Form.Item name={["service", "type"]} label="服务类型">
        <Select
          aria-label="远程服务类型"
          options={[
            { label: "远程服务", value: "remote" },
            { label: "本地服务", value: "local" },
          ]}
        />
      </Form.Item>
      <ConditionalRemoteFields />

      {networkError ? <div className="form-docs-network-error" role="alert">{networkError}</div> : null}
      <div className="form-docs-remote-actions">
        <Button type="primary" htmlType="submit">提交远程表单</Button>
        <Button onClick={() => form.markFieldsClean()}>保存当前修改</Button>
        <Button onClick={() => form.resetFields([["service"]])}>重置服务信息</Button>
        <Button onClick={() => form.resetFields()}>全部重置</Button>
      </div>
    </Form>
  );
}
