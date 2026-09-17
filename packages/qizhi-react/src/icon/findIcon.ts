import { directionIconManifest } from "./direction-icons.manifest";
import { promptIconManifest } from "./prompt-icons.manifest";
import { editIconManifest, generalIconManifest, interactionIconManifest, trademarkIconManifest } from "./catalog-icons.manifest";
import type { FindIconsQuery, IconManifestItem } from "./IconManifest.types";

const normalizeSearchText = (value: string) =>
  value.toLocaleLowerCase().replace(/[\s_\-（）()，,]+/g, "");

const matchesText = (item: IconManifestItem, query: string) => {
  const normalizedQuery = normalizeSearchText(query);
  const searchableText = [
    item.id,
    item.componentName,
    item.displayName,
    item.legacyName,
    ...item.aliases,
    item.family,
    item.style,
    ...("compatibilityNames" in item ? item.compatibilityNames ?? [] : []),
    "direction" in item ? item.direction ?? "" : "",
    "state" in item ? item.state ?? "" : "",
  ];

  return searchableText.some((value) =>
    normalizeSearchText(value).includes(normalizedQuery),
  );
};

export function findIcons(query: FindIconsQuery): readonly IconManifestItem[] {
  const iconManifest: readonly IconManifestItem[] = [
    ...directionIconManifest,
    ...promptIconManifest,
    ...interactionIconManifest,
    ...editIconManifest,
    ...trademarkIconManifest,
    ...generalIconManifest,
  ];

  return iconManifest.filter((item) => {
    if (query.query && !matchesText(item, query.query)) return false;
    if (query.semantic && item.semantic !== query.semantic) return false;
    if (query.family && item.family !== query.family) return false;
    if (query.style && item.style !== query.style) return false;
    if (query.direction && (!("direction" in item) || item.direction !== query.direction)) return false;
    if (query.state && (!("state" in item) || item.state !== query.state)) return false;
    return true;
  });
}
