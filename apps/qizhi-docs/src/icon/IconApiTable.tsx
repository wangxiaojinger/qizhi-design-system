import { ApiTable } from "../api/ApiTable";

export function IconApiTable() {
  return (
    <section id="icon-API" className="qizhi-api-section">
      <h2 className="qz-demo-title"><a tabIndex={-1} href="#icon-API">API</a></h2>
      <h3>Icon</h3>
      <p className="qizhi-api-section__note">
        当 Remix Icon 无法覆盖、需要启智图标资产时，统一从 @wangxiaojinger/qizhi-react/icon 导入。支持除 children 外的原生 SVG 属性。尺寸和颜色可通过 className、style 或父级 CSS 继承；未提供 title、aria-label 或 aria-labelledby 时默认作为装饰图标隐藏。
      </p>
      <ApiTable api="iconApi" label="Icon API" />
      <h3>图标来源边界</h3>
      <p className="qizhi-api-section__note">
        标准界面图标默认优先使用 Remix Icon；Remix Icon 中没有语义匹配的图标，或场景明确需要启智专属业务、多色、品牌图形时，再从 @wangxiaojinger/qizhi-react/icon 导入。业务专属插图、合作方标识等非标准资源可按项目构建能力导入经过审核的本地 SVG，但不会自动获得 QizhiIconProps、图标检索、兼容命名和设计系统约束。业务代码禁止使用字符、Unicode 符号、Emoji、CSS 绘制、硬编码 SVG path 或 data URL 自制图标。
      </p>
      <h3>图标目录与检索</h3>
      <p className="qizhi-api-section__note">
        manifest 为 AI 和文档提供结构化检索信息；生成页面时先用 findIcons 定位组件，再静态导入，不使用运行时字符串组件。
      </p>
      <ApiTable api="iconCatalogApi" label="图标目录与检索 API" />
    </section>
  );
}
