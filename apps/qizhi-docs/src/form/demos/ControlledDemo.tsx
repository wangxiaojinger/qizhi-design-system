import { useState } from "react";
import { AddIcon, Button, Form, InfoIcon, Input, Radio, Select, Tooltip } from "@wangxiaojinger/qizhi-react";
import { RefreshIcon } from "@wangxiaojinger/qizhi-react/icon";

const projectOptions = [
  { label: "公共项目", value: "public" },
  { label: "模型开发项目", value: "model" },
];

const computeOptions = [
  { label: "通用计算", value: "general" },
  { label: "异构计算", value: "heterogeneous" },
];

const imageOptions = [
  { label: "Ubuntu 22.04", value: "ubuntu-22.04" },
  { label: "PyTorch 2.4", value: "pytorch-2.4" },
];

export default function ControlledDemo() {
  const [serviceName, setServiceName] = useState("");
  const [project, setProject] = useState<string | number>();
  const [computeType, setComputeType] = useState<string | number>();
  const [imageVisibility, setImageVisibility] = useState<string | number>("official");
  const [image, setImage] = useState<string | number>();
  const [command, setCommand] = useState("");
  const [port, setPort] = useState("");
  const [description, setDescription] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  return (
    <Form autoComplete="off" aria-label="受控表单">
      <Form.Item
        label="服务名称"
        required
        extra="支持小写字母、数字、短横线，须以字母开头。"
      >
        <Input
          aria-label="服务名称"
          allowClear={false}
          value={serviceName}
          onChange={(event) => setServiceName(event.target.value)}
          maxLength={32}
          showWordLimit
          placeholder="请输入"
        />
      </Form.Item>
      <Form.Item label="所属项目" required>
        <Select
          aria-label="所属项目"
          options={projectOptions}
          value={project}
          onChange={(value) => setProject(value)}
          placeholder="请选择"
        />
      </Form.Item>
      <Form.Item label="计算类型组" required>
        <div className="form-docs-inline-control">
          <Select
            aria-label="计算类型组"
            options={computeOptions}
            value={computeType}
            onChange={(value) => setComputeType(value)}
            placeholder="请选择"
          />
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
      <Form.Item label="选择模型" required>
        <Button
          type="secondary"
          icon={<AddIcon />}
          className="form-docs-model-button"
        >
          选择模型
        </Button>
      </Form.Item>
      <Form.Item label="选择镜像" required>
        <div className="form-docs-image-control">
          <Radio.Group
            type="button"
            name="imageVisibility"
            value={imageVisibility}
            onChange={setImageVisibility}
            aria-label="镜像可见性"
          >
            <Radio value="official">官方镜像</Radio>
            <Radio value="private">个人可见镜像</Radio>
            <Radio value="public">公开可见镜像</Radio>
          </Radio.Group>
          <Select
            aria-label="选择镜像"
            options={imageOptions}
            value={image}
            onChange={(value) => setImage(value)}
            placeholder="请选择"
          />
        </div>
      </Form.Item>
      <Form.Item label="运行命令" required>
        <div className="form-docs-command-row">
          <div className="form-docs-command-control">
            <Input
              aria-label="运行命令"
              allowClear={false}
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder="请输入"
            />
            <Tooltip content="填写容器启动命令">
              <Button
                type="text"
                icon={<InfoIcon />}
                iconOnly
                aria-label="运行命令说明"
                className="form-docs-info-button"
              />
            </Tooltip>
          </div>
          <div className="form-docs-port-control">
            <Input
              aria-label="端口号"
              value={port}
              onChange={(event) => setPort(event.target.value)}
              inputMode="numeric"
              placeholder="输入端口号"
            />
            <Tooltip content="填写服务端口号码">
              <Button
                type="text"
                icon={<InfoIcon />}
                iconOnly
                aria-label="端口号说明"
                className="form-docs-info-button"
              />
            </Tooltip>
          </div>
        </div>
      </Form.Item>
      <Form.Item label="服务描述">
        <Input.TextArea
          aria-label="服务描述"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          placeholder="请输入描述文本"
        />
      </Form.Item>
    </Form>
  );
}
