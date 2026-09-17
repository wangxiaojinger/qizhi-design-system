import type {
  DirectionIconFamily,
  IconDirection,
  DirectionIconManifestItem,
  IconStyle,
} from "./IconManifest.types";

interface DirectionIconDefinition {
  id: string;
  componentName: string;
  displayName: string;
  legacyName: string;
  aliases: readonly string[];
  family: DirectionIconFamily;
  style: Exclude<IconStyle, "color">;
  sourceNodeId: string;
  sourceFile: string;
  direction?: IconDirection;
  state?: "default" | "expanded" | "collapsed" | "selected";
}

const conciseDirectionNames: Record<string, string> = {
  ExpandCollapseRightDiagonalExpandedFilledIcon: "ExpandRightDiagonalFilledIcon",
  ExpandCollapseRightDiagonalCollapsedFilledIcon: "CollapseRightDiagonalFilledIcon",
  ExpandCollapseRightDiagonalExpandedIcon: "ExpandRightDiagonalIcon",
  ExpandCollapseRightDiagonalCollapsedIcon: "CollapseRightDiagonalIcon",
  ExpandCollapseVerticalCollapsedFilledIcon: "CollapseVerticalFilledIcon",
  ExpandCollapseVerticalCollapsedIcon: "CollapseVerticalIcon",
  ExpandCollapseVerticalExpandedFilledIcon: "ExpandVerticalFilledIcon",
  ExpandCollapseVerticalExpandedIcon: "ExpandVerticalIcon",
  ExpandCollapseHorizontalExpandedFilledIcon: "ExpandHorizontalFilledIcon",
  ExpandCollapseHorizontalExpandedIcon: "ExpandHorizontalIcon",
  ExpandCollapseHorizontalCollapsedFilledIcon: "CollapseHorizontalFilledIcon",
  ExpandCollapseHorizontalCollapsedIcon: "CollapseHorizontalIcon",
  ExpandCollapseLeftDiagonalExpandedFilledIcon: "ExpandLeftDiagonalFilledIcon",
  ExpandCollapseLeftDiagonalCollapsedFilledIcon: "CollapseLeftDiagonalFilledIcon",
  ExpandCollapseLeftDiagonalCollapsedIcon: "CollapseLeftDiagonalIcon",
  ExpandCollapseLeftDiagonalExpandedIcon: "ExpandLeftDiagonalIcon",
};

const defineDirectionIcon = (
  definition: DirectionIconDefinition,
): DirectionIconManifestItem => {
  const conciseName = conciseDirectionNames[definition.componentName];
  return {
    ...definition,
    componentName: conciseName ?? definition.componentName,
    aliases: conciseName ? [...definition.aliases, definition.componentName] : definition.aliases,
    compatibilityNames: conciseName ? [definition.componentName] : undefined,
    semantic: "direction",
    colorMode: "currentColor",
    importPath: "@wangxiaojinger/qizhi-react/icon",
  };
};

export const directionIconManifest = [
  defineDirectionIcon({ id: "direction.expand-collapse.right-diagonal.expanded.fill", componentName: "ExpandCollapseRightDiagonalExpandedFilledIcon", displayName: "右斜向展开（填充）", legacyName: "icon-展开收起-面性-右斜向-展开", aliases: ["右斜向展开", "右对角展开", "实心右斜向展开"], family: "expand-collapse", style: "fill", direction: "rightDiagonal", state: "expanded", sourceNodeId: "716:788", sourceFile: "source/direction/003--legacy-direction--716-788.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.right-diagonal.collapsed.fill", componentName: "ExpandCollapseRightDiagonalCollapsedFilledIcon", displayName: "右斜向收起（填充）", legacyName: "icon-展开收起-面性-右斜向-收起", aliases: ["右斜向收起", "右对角收起", "实心右斜向收起"], family: "expand-collapse", style: "fill", direction: "rightDiagonal", state: "collapsed", sourceNodeId: "716:795", sourceFile: "source/direction/004--legacy-direction--716-795.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.right-diagonal.expanded.outline", componentName: "ExpandCollapseRightDiagonalExpandedIcon", displayName: "右斜向展开", legacyName: "icon-展开收起-右斜向-展开", aliases: ["右斜向展开", "右对角展开", "线性右斜向展开"], family: "expand-collapse", style: "outline", direction: "rightDiagonal", state: "expanded", sourceNodeId: "716:796", sourceFile: "source/direction/001--legacy-direction--716-796.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.right-diagonal.collapsed.outline", componentName: "ExpandCollapseRightDiagonalCollapsedIcon", displayName: "右斜向收起", legacyName: "icon-展开收起-右斜向-收起", aliases: ["右斜向收起", "右对角收起", "线性右斜向收起"], family: "expand-collapse", style: "outline", direction: "rightDiagonal", state: "collapsed", sourceNodeId: "716:792", sourceFile: "source/direction/002--legacy-direction--716-792.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.vertical.collapsed.fill", componentName: "ExpandCollapseVerticalCollapsedFilledIcon", displayName: "垂直收起（填充）", legacyName: "icon-展开收起-面性-垂直-收起", aliases: ["垂直收起", "上下收起", "实心垂直收起"], family: "expand-collapse", style: "fill", direction: "vertical", state: "collapsed", sourceNodeId: "716:790", sourceFile: "source/direction/006--legacy-direction--716-790.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.vertical.collapsed.outline", componentName: "ExpandCollapseVerticalCollapsedIcon", displayName: "垂直收起", legacyName: "icon-展开收起-垂直-收起", aliases: ["垂直收起", "上下收起", "线性垂直收起"], family: "expand-collapse", style: "outline", direction: "vertical", state: "collapsed", sourceNodeId: "716:793", sourceFile: "source/direction/005--legacy-direction--716-793.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.vertical.expanded.fill", componentName: "ExpandCollapseVerticalExpandedFilledIcon", displayName: "垂直展开（填充）", legacyName: "icon-展开收起-面性-垂直-展开", aliases: ["垂直展开", "上下展开", "实心垂直展开"], family: "expand-collapse", style: "fill", direction: "vertical", state: "expanded", sourceNodeId: "716:786", sourceFile: "source/direction/008--legacy-direction--716-786.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.vertical.expanded.outline", componentName: "ExpandCollapseVerticalExpandedIcon", displayName: "垂直展开", legacyName: "icon-展开收起-垂直-展开", aliases: ["垂直展开", "上下展开", "线性垂直展开"], family: "expand-collapse", style: "outline", direction: "vertical", state: "expanded", sourceNodeId: "716:789", sourceFile: "source/direction/007--legacy-direction--716-789.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.horizontal.expanded.fill", componentName: "ExpandCollapseHorizontalExpandedFilledIcon", displayName: "水平展开（填充）", legacyName: "icon-展开收起-面性-水平-展开", aliases: ["水平展开", "左右展开", "实心水平展开"], family: "expand-collapse", style: "fill", direction: "horizontal", state: "expanded", sourceNodeId: "716:787", sourceFile: "source/direction/010--legacy-direction--716-787.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.horizontal.expanded.outline", componentName: "ExpandCollapseHorizontalExpandedIcon", displayName: "水平展开", legacyName: "icon-展开收起-水平-展开", aliases: ["水平展开", "左右展开", "线性水平展开"], family: "expand-collapse", style: "outline", direction: "horizontal", state: "expanded", sourceNodeId: "716:785", sourceFile: "source/direction/009--legacy-direction--716-785.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.horizontal.collapsed.fill", componentName: "ExpandCollapseHorizontalCollapsedFilledIcon", displayName: "水平收起（填充）", legacyName: "icon-展开收起-面性-水平-收起", aliases: ["水平收起", "左右收起", "实心水平收起"], family: "expand-collapse", style: "fill", direction: "horizontal", state: "collapsed", sourceNodeId: "716:791", sourceFile: "source/direction/012--legacy-direction--716-791.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.horizontal.collapsed.outline", componentName: "ExpandCollapseHorizontalCollapsedIcon", displayName: "水平收起", legacyName: "icon-展开收起-水平-收起", aliases: ["水平收起", "左右收起", "线性水平收起"], family: "expand-collapse", style: "outline", direction: "horizontal", state: "collapsed", sourceNodeId: "716:794", sourceFile: "source/direction/011--legacy-direction--716-794.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.left-diagonal.expanded.fill", componentName: "ExpandCollapseLeftDiagonalExpandedFilledIcon", displayName: "左斜向展开（填充）", legacyName: "icon-展开收起-面性-左斜向-展开", aliases: ["左斜向展开", "左对角展开", "实心左斜向展开"], family: "expand-collapse", style: "fill", direction: "leftDiagonal", state: "expanded", sourceNodeId: "716:784", sourceFile: "source/direction/016--legacy-direction--716-784.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.left-diagonal.collapsed.fill", componentName: "ExpandCollapseLeftDiagonalCollapsedFilledIcon", displayName: "左斜向收起（填充）", legacyName: "icon-展开收起-面性-左斜向-收起", aliases: ["左斜向收起", "左对角收起", "实心左斜向收起"], family: "expand-collapse", style: "fill", direction: "leftDiagonal", state: "collapsed", sourceNodeId: "716:781", sourceFile: "source/direction/015--legacy-direction--716-781.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.left-diagonal.collapsed.outline", componentName: "ExpandCollapseLeftDiagonalCollapsedIcon", displayName: "左斜向收起", legacyName: "icon-展开收起-左斜向-收起", aliases: ["左斜向收起", "左对角收起", "线性左斜向收起"], family: "expand-collapse", style: "outline", direction: "leftDiagonal", state: "collapsed", sourceNodeId: "716:782", sourceFile: "source/direction/014--legacy-direction--716-782.svg" }),
  defineDirectionIcon({ id: "direction.expand-collapse.left-diagonal.expanded.outline", componentName: "ExpandCollapseLeftDiagonalExpandedIcon", displayName: "左斜向展开", legacyName: "icon-展开收起-左斜向-展开", aliases: ["左斜向展开", "左对角展开", "线性左斜向展开"], family: "expand-collapse", style: "outline", direction: "leftDiagonal", state: "expanded", sourceNodeId: "716:783", sourceFile: "source/direction/013--legacy-direction--716-783.svg" }),
  defineDirectionIcon({ id: "direction.arrow.down.fill", componentName: "ArrowDownFilledIcon", displayName: "向下箭头（填充）", legacyName: "icon-箭头-向下-面性", aliases: ["向下实心箭头", "下箭头", "down arrow filled"], family: "arrow", style: "fill", direction: "down", state: "default", sourceNodeId: "715:695", sourceFile: "source/direction/023--legacy-direction--715-695.svg" }),
  defineDirectionIcon({ id: "direction.arrow.up.fill", componentName: "ArrowUpFilledIcon", displayName: "向上箭头（填充）", legacyName: "icon-箭头-向上-面性", aliases: ["向上实心箭头", "上箭头", "up arrow filled"], family: "arrow", style: "fill", direction: "up", state: "default", sourceNodeId: "715:697", sourceFile: "source/direction/021--legacy-direction--715-697.svg" }),
  defineDirectionIcon({ id: "direction.arrow.right.fill", componentName: "ArrowRightFilledIcon", displayName: "向右箭头（填充）", legacyName: "icon-箭头-向右-面性", aliases: ["向右实心箭头", "右箭头", "right arrow filled"], family: "arrow", style: "fill", direction: "right", state: "default", sourceNodeId: "715:696", sourceFile: "source/direction/022--legacy-direction--715-696.svg" }),
  defineDirectionIcon({ id: "direction.arrow.left.fill", componentName: "ArrowLeftFilledIcon", displayName: "向左箭头（填充）", legacyName: "icon-箭头-向左-面性", aliases: ["向左实心箭头", "左箭头", "left arrow filled"], family: "arrow", style: "fill", direction: "left", state: "default", sourceNodeId: "715:694", sourceFile: "source/direction/024--legacy-direction--715-694.svg" }),
  defineDirectionIcon({ id: "direction.arrow.up.outline", componentName: "ArrowUpIcon", displayName: "向上箭头", legacyName: "icon-箭头-向上", aliases: ["向上线性箭头", "上箭头", "up arrow"], family: "arrow", style: "outline", direction: "up", state: "default", sourceNodeId: "715:680", sourceFile: "source/direction/018--legacy-direction--715-680.svg" }),
  defineDirectionIcon({ id: "direction.arrow.right.outline", componentName: "ArrowRightIcon", displayName: "向右箭头", legacyName: "icon-箭头-向右", aliases: ["向右线性箭头", "右箭头", "right arrow"], family: "arrow", style: "outline", direction: "right", state: "default", sourceNodeId: "77:486", sourceFile: "source/direction/019--legacy-direction--77-486.svg" }),
  defineDirectionIcon({ id: "direction.arrow.down.outline", componentName: "ArrowDownIcon", displayName: "向下箭头", legacyName: "icon-箭头-向下", aliases: ["向下线性箭头", "下箭头", "down arrow"], family: "arrow", style: "outline", direction: "down", state: "default", sourceNodeId: "715:548", sourceFile: "source/direction/017--legacy-direction--715-548.svg" }),
  defineDirectionIcon({ id: "direction.arrow.left.outline", componentName: "ArrowLeftIcon", displayName: "向左箭头", legacyName: "icon-箭头-向左", aliases: ["向左线性箭头", "左箭头", "left arrow"], family: "arrow", style: "outline", direction: "left", state: "default", sourceNodeId: "715:681", sourceFile: "source/direction/020--legacy-direction--715-681.svg" }),
  defineDirectionIcon({ id: "direction.expand.fill", componentName: "ExpandFilledIcon", displayName: "展开（填充）", legacyName: "icon-展开收起-展开-面性", aliases: ["实心展开", "放大展开", "expand filled"], family: "expand", style: "fill", state: "expanded", sourceNodeId: "715:723", sourceFile: "source/direction/026--legacy-direction--715-723.svg" }),
  defineDirectionIcon({ id: "direction.expand.outline", componentName: "ExpandIcon", displayName: "展开", legacyName: "icon-展开收起-展开", aliases: ["线性展开", "放大展开", "expand"], family: "expand", style: "outline", state: "expanded", sourceNodeId: "715:725", sourceFile: "source/direction/025--legacy-direction--715-725.svg" }),
  defineDirectionIcon({ id: "direction.contract.fill", componentName: "ContractFilledIcon", displayName: "收缩（填充）", legacyName: "icon-展开收起-收起-面性", aliases: ["实心收缩", "缩小收起", "contract filled"], family: "contract", style: "fill", state: "collapsed", sourceNodeId: "715:724", sourceFile: "source/direction/028--legacy-direction--715-724.svg" }),
  defineDirectionIcon({ id: "direction.contract.outline", componentName: "ContractIcon", displayName: "收缩", legacyName: "icon-展开收起-收起", aliases: ["线性收缩", "缩小收起", "contract"], family: "contract", style: "outline", state: "collapsed", sourceNodeId: "715:722", sourceFile: "source/direction/027--legacy-direction--715-722.svg" }),
  defineDirectionIcon({ id: "direction.collapse.selected", componentName: "CollapseSelectedIcon", displayName: "收起（选中）", legacyName: "icon-收起-选中", aliases: ["收起选中", "折叠选中", "collapse selected"], family: "collapse", style: "outline", state: "selected", sourceNodeId: "387:586", sourceFile: "source/direction/029--legacy-direction--387-586.svg" }),
  defineDirectionIcon({ id: "direction.collapse.default", componentName: "CollapseIcon", displayName: "收起（默认）", legacyName: "icon-收起-默认", aliases: ["收起默认", "折叠", "collapse"], family: "collapse", style: "outline", state: "default", sourceNodeId: "387:585", sourceFile: "source/direction/030--legacy-direction--387-585.svg" }),
  defineDirectionIcon({ id: "direction.fullscreen.selected", componentName: "FullscreenSelectedIcon", displayName: "全屏（选中）", legacyName: "icon-全屏-选中", aliases: ["全屏选中", "进入全屏选中", "fullscreen selected"], family: "fullscreen", style: "outline", state: "selected", sourceNodeId: "401:588", sourceFile: "source/direction/031--legacy-direction--401-588.svg" }),
  defineDirectionIcon({ id: "direction.fullscreen.default", componentName: "FullscreenIcon", displayName: "全屏（默认）", legacyName: "icon-全屏-默认", aliases: ["全屏默认", "进入全屏", "fullscreen"], family: "fullscreen", style: "outline", state: "default", sourceNodeId: "401:587", sourceFile: "source/direction/032--legacy-direction--401-587.svg" }),
  defineDirectionIcon({ id: "direction.endpoint.outline", componentName: "EndpointIcon", displayName: "终点", legacyName: "icon-终点", aliases: ["线性终点", "结束点", "endpoint"], family: "endpoint", style: "outline", state: "default", sourceNodeId: "77:534", sourceFile: "source/direction/033--legacy-direction--77-534.svg" }),
  defineDirectionIcon({ id: "direction.endpoint.fill", componentName: "EndpointFilledIcon", displayName: "终点（填充）", legacyName: "icon-终点-面性", aliases: ["实心终点", "结束点填充", "endpoint filled"], family: "endpoint", style: "fill", state: "default", sourceNodeId: "77:536", sourceFile: "source/direction/034--legacy-direction--77-536.svg" }),
  defineDirectionIcon({ id: "direction.fullscreen.selected.alt", componentName: "FullscreenSelectedAltIcon", displayName: "全屏（选中，样式二）", legacyName: "icon-全屏-选中-样式2", aliases: ["全屏选中样式二", "全屏第二样式选中", "fullscreen selected alt"], family: "fullscreen", style: "outline", state: "selected", sourceNodeId: "0:5369", sourceFile: "source/direction/035--legacy-direction--0-5369.svg" }),
  defineDirectionIcon({ id: "direction.fullscreen.default.alt", componentName: "FullscreenAltIcon", displayName: "全屏（默认，样式二）", legacyName: "icon-全屏-默认-样式2", aliases: ["全屏默认样式二", "全屏第二样式", "fullscreen alt"], family: "fullscreen", style: "outline", state: "default", sourceNodeId: "0:5371", sourceFile: "source/direction/036--legacy-direction--0-5371.svg" }),
  defineDirectionIcon({ id: "direction.switch.default", componentName: "SwitchIcon", displayName: "切换", legacyName: "icon-切换", aliases: ["方向切换", "交换", "switch direction"], family: "switch", style: "outline", state: "default", sourceNodeId: "18:3507", sourceFile: "source/direction/037--legacy-direction--18-3507.svg" }),
  defineDirectionIcon({ id: "direction.arrow.right.alt", componentName: "ArrowRightAltIcon", displayName: "向右箭头（样式二）", legacyName: "icon-箭头-向右-样式2", aliases: ["向右箭头样式二", "右箭头第二样式", "right arrow alt"], family: "arrow", style: "outline", direction: "right", state: "default", sourceNodeId: "427:369", sourceFile: "source/direction/038--legacy-direction--427-369.svg" }),
] as const;
