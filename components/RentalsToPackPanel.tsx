"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getPersonalDetails } from "@/lib/account";
import { getDressById } from "@/lib/dresses";
import { formatMonth, getRentalsToPack } from "@/lib/rentals";
import { Rental } from "@/lib/types";

type RentalsToPackPanelProps = {
  username: string;
};

export default function RentalsToPackPanel({
  username,
}: RentalsToPackPanelProps) {
  const [rentals, setRentals] = useState<Rental[]>([]);

  function refresh() {
    setRentals(getRentalsToPack(username));
  }

  useEffect(() => {
    refresh();
    window.addEventListener("kraft-rentals-updated", refresh);
    return () => window.removeEventListener("kraft-rentals-updated", refresh);
  }, [username]);

  return (
    <div className="mt-8 rounded-2xl border border-sand bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
        Fulfillment
      </p>
      <h2 className="mt-1 font-serif text-xl text-espresso">Rentals to Pack</h2>
      <p className="mt-2 text-sm text-espresso/60">
        Every rental from every other account, ready to pack.
      </p>

      {rentals.length === 0 ? (
        <p className="mt-6 text-sm text-espresso/40">No rentals to pack yet</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {rentals.map((rental) => {
            const dress = getDressById(rental.dressId);
            const months = [...rental.months].sort().map(formatMonth).join(", ");
            const thumb = dress?.images[0];
            const details = getPersonalDetails(rental.username);
            const shipTo = [details.address, details.city, details.country]
              .map((part) => part.trim())
              .filter(Boolean)
              .join(", ");

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
                  <p className="mt-1 text-xs text-espresso/55">
                    Shopper: {rental.username}
                    {details.name.trim() ? ` (${details.name.trim()})` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-espresso/55">{months}</p>
                  {rental.pickupDate && (
                    <p className="mt-0.5 text-xs text-espresso/45">
                      Pickup: {rental.pickupDate}
                    </p>
                  )}
                  {shipTo && (
                    <p className="mt-0.5 text-xs text-espresso/45">
                      Ship to: {shipTo}
                    </p>
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
