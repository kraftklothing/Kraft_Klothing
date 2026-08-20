"use client";

import { useEffect, useState } from "react";
import RentalPricingBreakdown from "@/components/RentalPricingBreakdown";
import { formatPrice, getDressById } from "@/lib/dresses";
import {
  getBookedMonthsForDressExcluding,
  getUpcomingMonths,
  updateRental,
} from "@/lib/rentals";
import { Rental } from "@/lib/types";

type EditRentalModalProps = {
  rental: Rental | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditRentalModal({
  rental,
  open,
  onClose,
  onSuccess,
}: EditRentalModalProps) {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState("");
  const [bookedMonths, setBookedMonths] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dress = rental ? getDressById(rental.dressId) : undefined;
  const upcomingMonths = getUpcomingMonths(12);

  useEffect(() => {
    if (!open || !rental) return;
    setSelectedMonths([...rental.months]);
    setPickupDate(rental.pickupDate);
    setError("");
    setBookedMonths(
      getBookedMonthsForDressExcluding(rental.dressId, rental.id)
    );
  }, [open, rental]);

  useEffect(() => {
    if (!open || !rental) return;
    const refresh = () =>
      setBookedMonths(
        getBookedMonthsForDressExcluding(rental.dressId, rental.id)
      );
    window.addEventListener("kraft-rentals-updated", refresh);
    return () => window.removeEventListener("kraft-rentals-updated", refresh);
  }, [open, rental]);

  function toggleMonth(value: string) {
    if (bookedMonths.includes(value)) return;
    setSelectedMonths((prev) =>
      prev.includes(value)
        ? prev.filter((m) => m !== value)
        : [...prev, value]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rental) return;
    setError("");
    setSubmitting(true);

    const result = updateRental(rental.id, {
      months: selectedMonths,
      pickupDate,
    });

    if ("error" in result) {
      setError(result.error);
      setBookedMonths(
        getBookedMonthsForDressExcluding(rental.dressId, rental.id)
      );
      setSubmitting(false);
      return;
    }

    onSuccess();
    onClose();
    setSubmitting(false);
  }

  if (!open || !rental || !dress) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-sand bg-cream p-6 shadow-xl">
        <h2 className="font-serif text-2xl text-espresso">Edit rental</h2>
        <p className="mt-1 text-sm text-espresso/60">
          {dress.brand}
          {dress.name ? ` · ${dress.name}` : ""} · Size {dress.size} ·{" "}
          {formatPrice(dress.pricePerMonth)}/month · Deposit{" "}
          {formatPrice(dress.deposit)}
          {dress.cleaningCharge > 0 && (
            <>
              {" "}
              · Cleaning Charge {formatPrice(dress.cleaningCharge)}
            </>
          )}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-espresso/50">
              Select month(s)
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {upcomingMonths.map((month) => {
                const isBooked = bookedMonths.includes(month.value);
                const isSelected = selectedMonths.includes(month.value);
                return (
                  <button
                    key={month.value}
                    type="button"
                    disabled={isBooked}
                    onClick={() => toggleMonth(month.value)}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                      isBooked
                        ? "cursor-not-allowed border-sand bg-sand/50 text-espresso/30 line-through"
                        : isSelected
                          ? "border-terracotta bg-terracotta/10 font-medium text-espresso"
                          : "border-sand bg-white text-espresso hover:border-terracotta/30"
                    }`}
                  >
                    {month.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-espresso/50">
              Pickup date
            </span>
            <input
              type="date"
              required
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-sand bg-white px-4 py-3 text-sm outline-none focus:border-terracotta"
            />
          </label>

          {selectedMonths.length > 0 && (
            <RentalPricingBreakdown
              dress={dress}
              monthCount={selectedMonths.length}
            />
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-sand py-2.5 text-sm font-medium text-espresso"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-espresso py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta disabled:opacity-40"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
