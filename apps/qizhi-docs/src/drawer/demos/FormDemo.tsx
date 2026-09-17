import { useState } from "react";
import {
  AddIcon,
  Button,
  ChevronDownIcon,
  Drawer,
  Form,
  InfoIcon,
  Input,
  Radio,
  RefreshIcon,
  Select,
  Switch,
} from "@wangxiaojinger/qizhi-react";

const projectOptions = ["默认项目", "研发项目", "公共项目"];
const imageOptions = [
  "PyTorch 2.4 CUDA 12.1",
  "TensorFlow 2.16",
  "Ubuntu 22.04 基础镜像",
];
const computeOptions = ["通用计算", "GPU 计算", "高性能计算"];
const options = (values: readonly string[]) => (
  values.map((value) => ({ label: value, value }))
);

function RefreshButton({ label }: { label: string }) {
  const [refreshing, setRefreshing] = useState(false);
  return (
    <Button
      className={refreshing ? "drawer-form-refresh is-refreshing" : "drawer-form-refresh"}
      type="text"
      iconOnly
      icon={<RefreshIcon />}
      aria-label={label}
      onClick={() => {
        setRefreshing(false);
        requestAnimationFrame(() => setRefreshing(true));
      }}
      onAnimationEnd={() => setRefreshing(false)}
    />
  );
}

export default function FormDemo() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button type="primary" aria-expanded={open} onClick={() => setOpen(true)}>
        打开抽屉表单
      </Button>
      <Drawer
        open={open}
        title="新建交互式建模"
        width={960}
        onClose={close}
        footer={(
          <>
            <Button type="secondary" onClick={close}>取 消</Button>
            <Button type="primary" onClick={close}>新 建</Button>
          </>
        )}
      >
        <div className="drawer-form-shell">
          <Form className="drawer-form-demo-form" autoComplete="off">
            <section className="drawer-form-section" aria-labelledby="drawer-basic-title">
              <h3 id="drawer-basic-title">基本信息</h3>
              <Form.Item
                label="实例名称"
                required
                extra="支持小写字母、数字、短横线，须以字母开头。"
              >
                <Input
                  className="drawer-form-control"
                  maxLength={32}
                  placeholder="请输入"
                  allowClear={false}
                  suffix="0 / 32"
                />
              </Form.Item>
              <Form.Item label="所属项目" required>
                <div className="drawer-form-control-row">
                  <Select
                    className="drawer-form-control"
                    options={options(projectOptions)}
                    placeholder="请选择"
                    aria-label="所属项目"
                  />
                  <RefreshButton label="刷新所属项目" />
                </div>
              </Form.Item>
              <Form.Item label="自动停止策略" required>
                <Switch aria-label="自动停止策略" />
              </Form.Item>
            </section>

            <section className="drawer-form-section" aria-labelledby="drawer-resource-title">
              <h3 id="drawer-resource-title">资源设置</h3>
              <Form.Item label="镜像" required>
                <div className="drawer-form-choice-stack">
                  <Radio.Group
                    type="button"
                    name="drawer-mirror-source"
                    aria-label="镜像来源"
                    defaultValue="official"
                    options={[
                      { label: "官方镜像", value: "official" },
                      { label: "个人可见镜像", value: "private" },
                      { label: "公开可见镜像", value: "public" },
                    ]}
                  />
                  <Select
                    className="drawer-form-control"
                    options={options(imageOptions)}
                    placeholder="请选择"
                    aria-label="镜像"
                  />
                </div>
              </Form.Item>
              <Form.Item label="计算类型组" required>
                <div className="drawer-form-control-row">
                  <Select
                    className="drawer-form-control"
                    options={options(computeOptions)}
                    placeholder="请选择"
                    aria-label="计算类型组"
                  />
                  <RefreshButton label="刷新计算类型组" />
                </div>
              </Form.Item>
              <Form.Item label="计算资源规格" required>
                <Button
                  className="drawer-form-resource-button"
                  type="secondary"
                  icon={<AddIcon />}
                  disabled
                >
                  选择规格
                </Button>
              </Form.Item>
              <Form.Item label="共享内存">
                <Switch aria-label="共享内存" disabled />
              </Form.Item>
              <Form.Item
                label={<span>启用 Slurm 调度 <InfoIcon aria-hidden="true" /></span>}
              >
                <Switch aria-label="启用 Slurm 调度" disabled />
              </Form.Item>
              <Form.Item label="Jupyter Notebook版本" required>
                <Radio.Group
                  name="drawer-jupyter-version"
                  defaultValue="4.3"
                  options={["4.3", "3.6"]}
                />
              </Form.Item>
              <Form.Item label="VS Code版本" required>
                <Radio.Group
                  name="drawer-vscode-version"
                  defaultValue="V1.101.2"
                  options={["V1.101.2", "V1.85.1"]}
                />
              </Form.Item>
              <Button
                className="drawer-form-advanced"
                type="text"
                icon={<ChevronDownIcon />}
              >
                高级设置
              </Button>
            </section>

            <section className="drawer-form-section" aria-labelledby="drawer-ssh-title">
              <h3 id="drawer-ssh-title">SSH远程连接设置</h3>
              <Form.Item
                required
                label={<span>SSH远程连接 <InfoIcon aria-hidden="true" /></span>}
              >
                <Switch aria-label="SSH远程连接" />
              </Form.Item>
            </section>
          </Form>
        </div>
      </Drawer>
    </>
  );
}
