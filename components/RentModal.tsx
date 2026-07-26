"use client";

import { useEffect, useState } from "react";
import { formatPrice, getDressById } from "@/lib/dresses";
import {
  createRental,
  getBookedMonthsForDress,
  getUpcomingMonths,
} from "@/lib/rentals";

type RentModalProps = {
  dressId: string;
  username: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function RentModal({
  dressId,
  username,
  open,
  onClose,
  onSuccess,
}: RentModalProps) {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [pickupDate, setPickupDate] = useState("");
  const [bookedMonths, setBookedMonths] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dress = getDressById(dressId);
  const upcomingMonths = getUpcomingMonths(12);

  useEffect(() => {
    if (!open) return;
    setSelectedMonths([]);
    setPickupDate("");
    setError("");
    setBookedMonths(getBookedMonthsForDress(dressId));
  }, [open, dressId]);

  useEffect(() => {
    if (!open) return;
    const refresh = () => setBookedMonths(getBookedMonthsForDress(dressId));
    window.addEventListener("kraft-rentals-updated", refresh);
    return () => window.removeEventListener("kraft-rentals-updated", refresh);
  }, [open, dressId]);

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
    setError("");

    if (selectedMonths.length === 0) {
      setError("Select at least one month.");
      return;
    }
    if (!pickupDate) {
      setError("Select a pickup date.");
      return;
    }

    setSubmitting(true);
    const rental = createRental({
      dressId,
      username,
      months: selectedMonths,
      pickupDate,
    });

    if (!rental) {
      setError("One or more months were just booked. Please try again.");
      setBookedMonths(getBookedMonthsForDress(dressId));
      setSubmitting(false);
      return;
    }

    onSuccess();
    onClose();
    setSubmitting(false);
  }

  if (!open || !dress) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-sand bg-cream p-6 shadow-xl">
        <h2 className="font-serif text-2xl text-espresso">Rent this dress</h2>
        <p className="mt-1 text-sm text-espresso/60">
          {dress.brand} · Size {dress.size} ·{" "}
          {formatPrice(dress.pricePerMonth)}/month
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-espresso/50">
              Select month(s)
            </p>
            <p className="mt-1 text-xs text-espresso/50">
              Booked months are unavailable for all users.
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
            <div className="rounded-xl bg-sand/50 px-4 py-3 text-sm text-espresso/70">
              Total:{" "}
              <strong>
                {formatPrice(dress.pricePerMonth * selectedMonths.length)}
              </strong>{" "}
              for {selectedMonths.length}{" "}
              {selectedMonths.length === 1 ? "month" : "months"}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-sand py-2.5 text-sm font-medium text-espresso"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-espresso py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta disabled:opacity-40"
            >
              Confirm rental
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
