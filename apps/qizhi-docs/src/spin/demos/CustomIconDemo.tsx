import {
  Link,
  PromptLoadingIcon,
  Spin,
} from "@wangxiaojinger/qizhi-react";

export default function CustomIconDemo() {
  return (
    <Spin
      size={30}
      icon={<PromptLoadingIcon />}
      aria-label="自定义指示符加载中"
    >
      <article className="spin-demo-card spin-demo-card--fixed">
        <header>
          <strong>自定义加载</strong>
          <Link href="#Spin-自定义指示符" hoverable={false}>
            查看详情
          </Link>
        </header>
        <p>
          可以根据业务场景替换加载指示符，同时保持统一的旋转节奏和反馈颜色。
        </p>
      </article>
    </Spin>
  );
}
