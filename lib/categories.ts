/** Inventory categories selectable when listing an item. */
export const LISTING_CATEGORIES = [
  "Dresses",
  "Blazers",
  "Jackets",
  "Coats",
  "Skirts",
  "Shorts",
  "Shirts",
  "Sweaters",
  "Tank Tops",
  "Shoes",
  "Scarves",
  "Mittens/Gloves",
  "Hats",
  "Sports Equipment",
  "Matching Pieces",
] as const;

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];

export const DEFAULT_LISTING_CATEGORY: ListingCategory = "Dresses";

export function isListingCategory(value: unknown): value is ListingCategory {
  return (
    typeof value === "string" &&
    (LISTING_CATEGORIES as readonly string[]).includes(value)
  );
}

/** Normalize legacy or missing categories to a known listing category. */
export function normalizeListingCategory(value: unknown): ListingCategory {
  if (isListingCategory(value)) return value;
  return DEFAULT_LISTING_CATEGORY;
}
