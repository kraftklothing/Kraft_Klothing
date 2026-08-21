import { calculateRentalPricing } from "./pricing";
import { getAllRentals, isSandboxRental } from "./rentals";
import { Dress, Rental } from "./types";

export const UNSPECIFIED_SOURCE = "Unspecified";

export type ItemSalesRow = {
  dressId: string;
  name: string;
  brand: string;
  source: string;
  purchasePrice: number;
  rentalCount: number;
  monthCount: number;
  /** Rent charged across real rentals. */
  rentEarned: number;
  /** Cleaning charges kept from deposits on return. */
  cleaningEarned: number;
  /** rentEarned + cleaningEarned (deposits excluded). */
  earned: number;
  /** earned − purchasePrice. */
  profit: number;
};

export type SourceSalesRow = {
  source: string;
  itemCount: number;
  purchaseCost: number;
  rentalCount: number;
  earned: number;
  profit: number;
};

export type SalesSummary = {
  itemCount: number;
  purchaseCost: number;
  rentalCount: number;
  earned: number;
  profit: number;
};

function displaySource(source: string | undefined): string {
  const trimmed = typeof source === "string" ? source.trim() : "";
  return trimmed || UNSPECIFIED_SOURCE;
}

function earningsForRental(dress: Dress, rental: Rental) {
  const pricing = calculateRentalPricing(dress, rental.months.length);
  return {
    rent: pricing.rent,
    cleaning: pricing.cleaningCharge,
    earned: pricing.rent + pricing.cleaningCharge,
  };
}

/** Real (non-sandbox) rentals only — demo shopper activity does not count. */
export function getRealRentalsForDress(
  dressId: string,
  rentals: Rental[] = getAllRentals()
): Rental[] {
  return rentals.filter(
    (r) => r.dressId === dressId && !isSandboxRental(r)
  );
}

export function buildItemSalesRows(
  dresses: Dress[],
  rentals: Rental[] = getAllRentals()
): ItemSalesRow[] {
  return dresses
    .map((dress) => {
      const dressRentals = getRealRentalsForDress(dress.id, rentals);
      let rentEarned = 0;
      let cleaningEarned = 0;
      let monthCount = 0;

      for (const rental of dressRentals) {
        const earnings = earningsForRental(dress, rental);
        rentEarned += earnings.rent;
        cleaningEarned += earnings.cleaning;
        monthCount += rental.months.length;
      }

      const purchasePrice = Number(dress.purchasePrice) || 0;
      const earned = rentEarned + cleaningEarned;

      return {
        dressId: dress.id,
        name: dress.name?.trim() || "Untitled",
        brand: dress.brand?.trim() || "Unknown",
        source: displaySource(dress.source),
        purchasePrice,
        rentalCount: dressRentals.length,
        monthCount,
        rentEarned,
        cleaningEarned,
        earned,
        profit: earned - purchasePrice,
      };
    })
    .sort((a, b) => b.profit - a.profit || a.name.localeCompare(b.name));
}

export function buildSourceSalesRows(items: ItemSalesRow[]): SourceSalesRow[] {
  const bySource = new Map<string, SourceSalesRow>();

  for (const item of items) {
    const existing = bySource.get(item.source);
    if (existing) {
      existing.itemCount += 1;
      existing.purchaseCost += item.purchasePrice;
      existing.rentalCount += item.rentalCount;
      existing.earned += item.earned;
      existing.profit += item.profit;
    } else {
      bySource.set(item.source, {
        source: item.source,
        itemCount: 1,
        purchaseCost: item.purchasePrice,
        rentalCount: item.rentalCount,
        earned: item.earned,
        profit: item.profit,
      });
    }
  }

  return Array.from(bySource.values()).sort(
    (a, b) => b.profit - a.profit || a.source.localeCompare(b.source)
  );
}

export function summarizeSales(items: ItemSalesRow[]): SalesSummary {
  return items.reduce(
    (acc, item) => {
      acc.itemCount += 1;
      acc.purchaseCost += item.purchasePrice;
      acc.rentalCount += item.rentalCount;
      acc.earned += item.earned;
      acc.profit += item.profit;
      return acc;
    },
    {
      itemCount: 0,
      purchaseCost: 0,
      rentalCount: 0,
      earned: 0,
      profit: 0,
    } satisfies SalesSummary
  );
}
