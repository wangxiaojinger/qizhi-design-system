import { render, screen } from "@testing-library/react";
import { ButtonDocsIsland } from "./button/ButtonDocsIsland";
import { TypographyDocsIsland } from "./typography/TypographyDocsIsland";
import { LinkDocsIsland } from "./link/LinkDocsIsland";
import { DividerDocsIsland } from "./divider/DividerDocsIsland";
import { InputDocsIsland } from "./input/InputDocsIsland";
import { DropdownDocsIsland } from "./dropdown/DropdownDocsIsland";

it("uses globally unique API anchors for independently mounted component pages", () => {
  render(
    <>
      <ButtonDocsIsland />
      <TypographyDocsIsland />
      <LinkDocsIsland />
      <DividerDocsIsland />
      <InputDocsIsland />
      <DropdownDocsIsland />
    </>,
  );

  const apiLinks = screen.getAllByRole("link", { name: "API" });
  expect(apiLinks.map((link) => link.getAttribute("href"))).toEqual([
    "#button-API",
    "#typography-API",
    "#link-API",
    "#divider-API",
    "#input-API",
    "#dropdown-API",
  ]);
  expect(document.querySelectorAll("#button-API")).toHaveLength(1);
  expect(document.querySelectorAll("#typography-API")).toHaveLength(1);
  expect(document.querySelectorAll("#link-API")).toHaveLength(1);
  expect(document.querySelectorAll("#divider-API")).toHaveLength(1);
  expect(document.querySelectorAll("#input-API")).toHaveLength(1);
  expect(document.querySelectorAll("#dropdown-API")).toHaveLength(1);
  expect(document.querySelectorAll("#API")).toHaveLength(0);
});
