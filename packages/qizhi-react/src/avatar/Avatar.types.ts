import type {
  ForwardRefExoticComponent,
  HTMLAttributes,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  RefAttributes,
} from "react";

export type AvatarSize = "mini" | "small" | "default" | "large";
export type AvatarShape = "circle" | "square";
export type AvatarTriggerType = "mask" | "button";

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "onClick"> {
  children?: ReactNode;
  size?: AvatarSize;
  shape?: AvatarShape;
  triggerIcon?: ReactNode;
  triggerType?: AvatarTriggerType;
  onTriggerClick?: MouseEventHandler<HTMLButtonElement>;
  triggerAriaLabel?: string;
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  size?: AvatarSize;
}

export interface AvatarComponent {
  (props: AvatarProps & RefAttributes<HTMLSpanElement>): ReactElement;
  Group: ForwardRefExoticComponent<AvatarGroupProps & RefAttributes<HTMLDivElement>>;
}
