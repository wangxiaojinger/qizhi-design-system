export type IconStyle = "outline" | "fill" | "color";
export type IconColorMode = "currentColor" | "fixedPalette";

export type IconDirection =
  | "up"
  | "right"
  | "down"
  | "left"
  | "horizontal"
  | "vertical"
  | "leftDiagonal"
  | "rightDiagonal";

export type IconState =
  | "default"
  | "expanded"
  | "collapsed"
  | "selected"
  | "success"
  | "failure"
  | "inProgress"
  | "notStarted"
  | "loading"
  | "like"
  | "dislike"
  | "unavailable"
  | "cancelled"
  | "confirmed";

export type DirectionIconFamily =
  | "expand-collapse"
  | "arrow"
  | "expand"
  | "contract"
  | "collapse"
  | "fullscreen"
  | "endpoint"
  | "switch";

export type PromptIconFamily =
  | "model"
  | "status"
  | "attitude"
  | "alert"
  | "favorite"
  | "information"
  | "warning"
  | "danger"
  | "fire"
  | "notification"
  | "selection"
  | "help"
  | "security"
  | "review"
  | "suggestion"
  | "certification"
  | "loading"
  | "diagnosis";

export type CatalogIconFamily =
  | "add" | "agent" | "annotation" | "annotationStyle" | "branch" | "brush"
  | "calculator" | "canvas" | "category" | "chat" | "circleAction" | "code"
  | "command" | "copy" | "debug" | "delete" | "dot" | "download" | "drag"
  | "edit" | "exit" | "fileShare" | "filter" | "function" | "http" | "keyboard"
  | "letter" | "link" | "marker" | "mention" | "menu" | "message" | "more"
  | "newChat" | "operator" | "playback" | "quote" | "refresh" | "reply"
  | "save" | "search" | "send" | "settings" | "shape" | "share" | "sort"
  | "start" | "startAction" | "tag" | "template" | "textOptimize" | "tools"
  | "typography" | "upload" | "variable" | "visibility"
  | "aiAsset" | "aiPlatform" | "analysis" | "api" | "biological" | "billing"
  | "browser" | "collaboration" | "communication" | "content" | "credential"
  | "deployment" | "device" | "discovery" | "documentFormat" | "evaluation"
  | "file" | "governance" | "hardware" | "identity" | "knowledge" | "lab"
  | "layout" | "network" | "organization" | "product" | "programmingLanguage"
  | "publishing" | "robot" | "sandbox" | "schedule" | "space" | "task"
  | "training" | "workspace";

interface BaseIconManifestItem {
  id: string;
  componentName: string;
  displayName: string;
  legacyName: string;
  aliases: readonly string[];
  style: IconStyle;
  colorMode: IconColorMode;
  sourceNodeId: string;
  sourceFile: string;
  importPath: "@wangxiaojinger/qizhi-react/icon";
}

export interface DirectionIconManifestItem extends BaseIconManifestItem {
  semantic: "direction";
  family: DirectionIconFamily;
  colorMode: "currentColor";
  direction?: IconDirection;
  state?: Exclude<IconState, "success" | "failure">;
  compatibilityNames?: readonly string[];
}

interface PromptIconCommon extends BaseIconManifestItem {
  semantic: "prompt";
  family: PromptIconFamily;
  state?: IconState;
}

export type PromptIconManifestItem = PromptIconCommon & (
  | {
      style: "outline" | "fill";
      colorMode: "currentColor";
      fixedColors?: never;
    }
  | {
      style: "color";
      colorMode: "fixedPalette";
      fixedColors: readonly string[];
    }
);

export interface CatalogIconManifestItem extends BaseIconManifestItem {
  semantic: "interaction" | "edit" | "trademark" | "general";
  family: CatalogIconFamily;
  style: "outline" | "fill";
  colorMode: "currentColor";
}

export type IconManifestItem = DirectionIconManifestItem | PromptIconManifestItem | CatalogIconManifestItem;

export interface FindIconsQuery {
  query?: string;
  semantic?: IconManifestItem["semantic"];
  family?: DirectionIconFamily | PromptIconFamily | CatalogIconFamily;
  style?: IconStyle;
  direction?: IconDirection;
  state?: IconState;
}
