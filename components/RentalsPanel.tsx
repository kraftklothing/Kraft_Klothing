"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getDressById } from "@/lib/dresses";
import { cancelRental, formatMonth, getRentalsForUser } from "@/lib/rentals";
import { AvailabilityAlert, Rental } from "@/lib/types";

type RentalsPanelProps = {
  username: string;
};

type RentalBucket = "current" | "upcoming" | "previous";

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function classifyRental(rental: Rental): RentalBucket {
  const now = currentMonthValue();
  const months = [...rental.months].sort();
  if (months.some((m) => m === now)) return "current";
  if (months.length > 0 && months.every((m) => m < now)) return "previous";
  return "upcoming";
}

export default function RentalsPanel({ username }: RentalsPanelProps) {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [notice, setNotice] = useState("");

  function refresh() {
    setRentals(getRentalsForUser(username));
  }

  useEffect(() => {
    refresh();
    window.addEventListener("kraft-rentals-updated", refresh);

    const onNotified = (event: Event) => {
      const detail = (event as CustomEvent<{ alerts: AvailabilityAlert[] }>)
        .detail;
      const alerts = detail?.alerts ?? [];
      if (alerts.length === 0) return;
      const summary = alerts
        .map(
          (alert) =>
            `${alert.phone} (${formatMonth(alert.month)})`
        )
        .join(", ");
      setNotice(
        `Rental cancelled. Text alert sent for availability: ${summary}.`
      );
    };

    window.addEventListener(
      "kraft-availability-notified",
      onNotified as EventListener
    );

    return () => {
      window.removeEventListener("kraft-rentals-updated", refresh);
      window.removeEventListener(
        "kraft-availability-notified",
        onNotified as EventListener
      );
    };
  }, [username]);

  const grouped = useMemo(() => {
    const buckets: Record<RentalBucket, Rental[]> = {
      current: [],
      upcoming: [],
      previous: [],
    };
    rentals.forEach((rental) => {
      buckets[classifyRental(rental)].push(rental);
    });
    return buckets;
  }, [rentals]);

  function handleCancel(rentalId: string) {
    const confirmed = window.confirm(
      "Cancel this rental? Those months will become available again."
    );
    if (!confirmed) return;

    const removed = cancelRental(rentalId);
    if (!removed) {
      setNotice("Could not cancel that rental. Please try again.");
      return;
    }

    setNotice("Rental cancelled.");
    refresh();
  }

  return (
    <div className="mt-8 rounded-2xl border border-sand bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
        Rentals
      </p>
      <h2 className="mt-1 font-serif text-xl text-espresso">Your rentals</h2>
      <p className="mt-2 text-sm text-espresso/60">
        Previous, current, and upcoming bookings in one place.
      </p>

      {notice && (
        <p className="mt-4 rounded-xl bg-sand/60 px-4 py-3 text-sm text-espresso/70">
          {notice}
        </p>
      )}

      <div className="mt-6 space-y-6">
        <RentalGroup
          title="Current"
          rentals={grouped.current}
          canCancel
          onCancel={handleCancel}
        />
        <RentalGroup
          title="Upcoming"
          rentals={grouped.upcoming}
          canCancel
          onCancel={handleCancel}
        />
        <RentalGroup title="Previous" rentals={grouped.previous} />
      </div>
    </div>
  );
}

function RentalGroup({
  title,
  rentals,
  canCancel = false,
  onCancel,
}: {
  title: string;
  rentals: Rental[];
  canCancel?: boolean;
  onCancel?: (rentalId: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-espresso/50">
        {title}
      </p>
      {rentals.length === 0 ? (
        <p className="mt-2 text-sm text-espresso/40">None yet</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {rentals.map((rental) => {
            const dress = getDressById(rental.dressId);
            const months = [...rental.months].sort().map(formatMonth).join(", ");
            const thumb = dress?.images[0];
            return (
              <li
                key={rental.id}
                className="flex items-center gap-3 rounded-xl border border-sand px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-espresso">
                    {dress?.brand ?? "Dress"}
                    {dress?.size ? ` · Size ${dress.size}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-espresso/55">{months}</p>
                  {rental.pickupDate && (
                    <p className="mt-0.5 text-xs text-espresso/45">
                      Pickup: {rental.pickupDate}
                    </p>
                  )}
                  {canCancel && onCancel && (
                    <button
                      type="button"
                      onClick={() => onCancel(rental.id)}
                      className="mt-2 text-xs font-medium text-red-600 hover:underline"
                    >
                      Cancel rental
                    </button>
                  )}
                </div>
                <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-sand">
                  {thumb && (
                    <Image
                      src={thumb}
                      alt={dress?.brand ? `${dress.brand} dress` : "Dress"}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="44px"
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
