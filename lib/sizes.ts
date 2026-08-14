/** Letter / alpha sizes for listings. */
export const LETTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

/** US numeric clothing sizes (even numbers). */
export const NUMERIC_SIZES = [
  "0",
  "2",
  "4",
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
  "18",
] as const;

export const OTHER_SIZES = ["One Size"] as const;

export const ALL_SIZES = [
  ...LETTER_SIZES,
  ...NUMERIC_SIZES,
  ...OTHER_SIZES,
] as const;
