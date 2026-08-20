import { formatPrice } from "@/lib/dresses";
import { calculateRentalPricing } from "@/lib/pricing";
import { Dress } from "@/lib/types";

type RentalPricingBreakdownProps = {
  dress: Dress;
  monthCount: number;
};

export default function RentalPricingBreakdown({
  dress,
  monthCount,
}: RentalPricingBreakdownProps) {
  const pricing = calculateRentalPricing(dress, monthCount);

  return (
    <div className="rounded-xl bg-sand/50 px-4 py-3 text-sm text-espresso/70">
      <div className="space-y-1">
        <p className="flex justify-between gap-4">
          <span>
            Rent ({monthCount} {monthCount === 1 ? "month" : "months"})
          </span>
          <span>{formatPrice(pricing.rent)}</span>
        </p>
        <p className="flex justify-between gap-4">
          <span>Deposit</span>
          <span>{formatPrice(pricing.deposit)}</span>
        </p>
        {pricing.cleaningCharge > 0 && (
          <p className="flex justify-between gap-4">
            <span>Cleaning Charge</span>
            <span>{formatPrice(pricing.cleaningCharge)}</span>
          </p>
        )}
      </div>
      {pricing.cleaningCharge > 0 && (
        <p className="mt-2 text-xs text-espresso/55">
          Cleaning Charge comes from deposit.
        </p>
      )}
      <p className="mt-3 flex justify-between gap-4 border-t border-sand pt-2 font-medium text-espresso">
        <span>Total due now</span>
        <span>{formatPrice(pricing.dueNow)}</span>
      </p>
    </div>
  );
}
