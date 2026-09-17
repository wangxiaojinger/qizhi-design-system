import type {
  ForwardRefExoticComponent,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  RefAttributes,
} from "react";

export type DescriptionsLayout = "horizontal" | "vertical";
export type DescriptionsLabelAlign = "left" | "right";

export interface DescriptionsProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  children?: ReactNode;
  title?: ReactNode;
  layout?: DescriptionsLayout;
  labelAlign?: DescriptionsLabelAlign;
}

export interface DescriptionsItemProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  label: ReactNode;
}

export interface DescriptionsComponent {
  (props: DescriptionsProps & RefAttributes<HTMLDivElement>): ReactElement;
  Item: ForwardRefExoticComponent<DescriptionsItemProps & RefAttributes<HTMLDivElement>>;
}
