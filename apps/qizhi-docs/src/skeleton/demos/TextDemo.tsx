import { Skeleton } from "@wangxiaojinger/qizhi-react";

export default function TextDemo() {
  return (
    <Skeleton
      image={{ shape: "square", size: 48 }}
      text={{ rows: 3, widths: ["100%", 600, 400] }}
      aria-label="图文内容加载中"
    />
  );
}
