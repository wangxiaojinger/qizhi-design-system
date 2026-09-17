import { useState } from "react";
import { Skeleton, Switch } from "@wangxiaojinger/qizhi-react";

export default function AnimationDemo() {
  const [animation, setAnimation] = useState(true);

  return (
    <div className="skeleton-animation-demo">
      <div className="skeleton-animation-demo__control">
        <span>动画</span>
        <Switch
          checked={animation}
          size="small"
          aria-label="切换骨架屏动画"
          onChange={setAnimation}
        />
      </div>
      <Skeleton
        animation={animation}
        image={{ shape: "circle", size: 48 }}
        text={{ rows: 3, widths: ["100%", "100%", "90%"] }}
        aria-label={`内容加载中，动画已${animation ? "开启" : "关闭"}`}
      />
    </div>
  );
}
