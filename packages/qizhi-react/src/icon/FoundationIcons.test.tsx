import { createRef, type ComponentType } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CameraIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  InfoIcon,
  LoadingIcon,
  MapPinIcon,
  MoreIcon,
  SearchIcon,
  StarIcon,
  UserIcon,
} from "./index";
import { MoreIcon as CatalogMoreIcon } from "./generated/catalog/MoreIcon";
import { SearchIcon as CatalogSearchIcon } from "./generated/catalog/SearchIcon";
import type { QizhiIconProps } from "./QizhiIcon.types";
import { MoreIcon as RootMoreIcon, SearchIcon as RootSearchIcon } from "../index";

const foundationIcons: readonly [string, ComponentType<QizhiIconProps>][] = [
  ["CameraIcon", CameraIcon],
  ["CalendarIcon", CalendarIcon],
  ["CheckCircleIcon", CheckCircleIcon],
  ["ChevronDownIcon", ChevronDownIcon],
  ["ChevronRightIcon", ChevronRightIcon],
  ["CloseIcon", CloseIcon],
  ["InfoIcon", InfoIcon],
  ["LoadingIcon", LoadingIcon],
  ["MapPinIcon", MapPinIcon],
  ["MoreIcon", MoreIcon],
  ["SearchIcon", SearchIcon],
  ["StarIcon", StarIcon],
  ["UserIcon", UserIcon],
];

describe("foundation icon contract", () => {
  it.each(foundationIcons)("keeps %s aligned with QizhiIconProps", (_, Icon) => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(<Icon ref={ref} size={24} title="图标" />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).not.toHaveAttribute("aria-hidden");
    expect(svg?.querySelector("title")).toHaveTextContent("图标");
    expect(ref.current).toBe(svg);
  });

  it("exports the manifest SearchIcon and MoreIcon implementations", () => {
    expect(SearchIcon).toBe(CatalogSearchIcon);
    expect(MoreIcon).toBe(CatalogMoreIcon);
    expect(RootSearchIcon).toBe(CatalogSearchIcon);
    expect(RootMoreIcon).toBe(CatalogMoreIcon);
  });

  it("renders CameraIcon with currentColor and the shared accessible contract", () => {
    const { container } = render(<CameraIcon title="拍摄头像" />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("viewBox", "0 0 16 16");
    expect(svg).toHaveAccessibleName("拍摄头像");
    expect(container.querySelectorAll('[stroke="currentColor"], [fill="currentColor"]').length).toBeGreaterThan(0);
  });
});
