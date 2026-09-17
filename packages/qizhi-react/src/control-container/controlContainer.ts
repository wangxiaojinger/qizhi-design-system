export const CONTROL_CONTAINER_CLASS_NAME = "qizhi-control-container";

export const controlContainerClassName = (
  ...classNames: Array<string | false | null | undefined>
) => [CONTROL_CONTAINER_CLASS_NAME, ...classNames].filter(Boolean).join(" ");
