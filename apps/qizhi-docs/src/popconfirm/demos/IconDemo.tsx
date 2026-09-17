import {
  Button,
  HappyFilledIcon,
  Popconfirm,
  Space,
} from "@wangxiaojinger/qizhi-react";

export default function IconDemo() {
  return (
    <Space size="medium" className="popconfirm-icon-demo">
      <Popconfirm
        title="确认删除"
        content="确定要删除这条内容吗？"
        icon={<HappyFilledIcon />}
      >
        <Button type="secondary" className="popconfirm-demo-trigger">
          自定义图标
        </Button>
      </Popconfirm>
      <Popconfirm
        title="确认删除"
        content="确定要删除这条内容吗？"
        icon={null}
      >
        <Button type="secondary" className="popconfirm-demo-trigger">
          无图标
        </Button>
      </Popconfirm>
    </Space>
  );
}
