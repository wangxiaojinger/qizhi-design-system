import {
  directionIconManifest,
  editIconManifest,
  generalIconManifest,
  interactionIconManifest,
  promptIconManifest,
  trademarkIconManifest,
  type IconManifestItem,
  type QizhiIconProps,
} from "@wangxiaojinger/qizhi-react/icon";
import * as QizhiReactIcons from "@wangxiaojinger/qizhi-react/icon";
import type { ComponentType } from "react";

export type IconDocsItem = IconManifestItem & {
  Component: ComponentType<QizhiIconProps>;
};

const iconComponents = QizhiReactIcons as unknown as Record<
  string,
  ComponentType<QizhiIconProps>
>;

export const iconDocsRegistry: readonly IconDocsItem[] = [
  ...directionIconManifest,
  ...promptIconManifest,
  ...interactionIconManifest,
  ...editIconManifest,
  ...trademarkIconManifest,
  ...generalIconManifest,
].map(
  (item) => {
    const Component = iconComponents[item.componentName];
    if (!Component) {
      throw new Error(`未找到图标组件：${item.componentName}`);
    }
    return { ...item, Component };
  },
);

export const getIconUsageCode = (item: IconManifestItem) => ({
  importCode: `import { ${item.componentName} } from "${item.importPath}";`,
  jsxCode: `<${item.componentName} />`,
});
