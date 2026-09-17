import {
  Button,
  CheckCircleIcon,
  InfoIcon,
  Message,
  Space,
  StarIcon,
  UserIcon,
  WarningFilledIcon,
} from "@wangxiaojinger/qizhi-react";

export default function CustomIconDemo() {
  return (
    <Space size="large">
      <Button
        type="primary"
        onClick={() => Message.info({
          content: "This is an info message!",
          icon: <StarIcon />,
        })}
      >
        Info (Light)
      </Button>
      <Button
        type="primary"
        status="success"
        onClick={() => Message.success({
          content: "This is a success message!",
          icon: <CheckCircleIcon />,
        })}
      >
        Success (Light)
      </Button>
      <Button
        type="primary"
        status="warning"
        onClick={() => Message.warning({
          content: "This is a warning message!",
          icon: <WarningFilledIcon />,
        })}
      >
        Warning (Light)
      </Button>
      <Button
        type="primary"
        status="danger"
        onClick={() => Message.error({
          content: "This is an error message!",
          icon: <InfoIcon />,
        })}
      >
        Error (Light)
      </Button>
      <Button
        type="secondary"
        onClick={() => Message.info({
          content: "This is a message!",
          icon: <UserIcon />,
        })}
      >
        Smile
      </Button>
    </Space>
  );
}
