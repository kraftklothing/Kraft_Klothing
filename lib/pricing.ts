import { Dress } from "./types";

export type RentalPricing = {
  rent: number;
  deposit: number;
  /** One Cleaning Charge per rental, deducted from deposit on return. */
  cleaningCharge: number;
  /** Amount charged upfront: rent + deposit. */
  dueNow: number;
};

export function calculateRentalPricing(
  dress: Pick<Dress, "pricePerMonth" | "deposit" | "cleaningCharge">,
  monthCount: number
): RentalPricing {
  const rent = dress.pricePerMonth * monthCount;
  const deposit = dress.deposit ?? 0;
  const cleaningCharge = monthCount >= 1 ? dress.cleaningCharge ?? 0 : 0;

  return {
    rent,
    deposit,
    cleaningCharge,
    dueNow: rent + deposit,
  };
}
