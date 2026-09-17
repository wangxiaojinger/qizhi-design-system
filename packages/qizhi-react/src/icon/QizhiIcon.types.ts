import type { SVGProps } from "react";

export interface QizhiIconProps
  extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number | string;
  title?: string;
}
