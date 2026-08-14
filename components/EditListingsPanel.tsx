"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CategoryFilter from "@/components/CategoryFilter";
import DressForm from "@/components/DressForm";
import { useAuth } from "@/components/AuthProvider";
import { normalizeListingCategory } from "@/lib/categories";
import {
  deleteDress,
  formatPrice,
  getDressesByLister,
  loadDresses,
} from "@/lib/dresses";
import { Dress } from "@/lib/types";

export default function EditListingsPanel() {
  const { session, isModerator, mounted } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Dress[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Dress | null>(null);

  function refresh() {
    if (session) setListings(getDressesByLister(session.username));
  }

  useEffect(() => {
    if (mounted && !isModerator) {
      router.replace("/account");
    }
  }, [mounted, isModerator, router]);

  useEffect(() => {
    void loadDresses().then(() => refresh());
    window.addEventListener("kraft-dresses-updated", refresh);
    return () => window.removeEventListener("kraft-dresses-updated", refresh);
  }, [session]);

  const filteredListings = useMemo(() => {
    if (categoryFilter === "all") return listings;
    return listings.filter(
      (dress) => normalizeListingCategory(dress.category) === categoryFilter
    );
  }, [listings, categoryFilter]);

  async function handleDelete(id: string) {
    if (confirm("Delete this listing?")) {
      await deleteDress(id);
      if (editing?.id === id) setEditing(null);
      refresh();
    }
  }

  if (!mounted || !isModerator || !session) {
    return <p className="text-sm text-espresso/50">Loading...</p>;
  }

  if (editing) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="text-sm text-espresso/50 transition-colors hover:text-terracotta"
        >
          ← Back to listings
        </button>
        <h2 className="mt-6 font-serif text-2xl text-espresso">
          Edit listing
        </h2>
        <div className="mt-6 rounded-2xl border border-sand bg-white p-6 sm:p-8">
          <DressForm
            dress={editing}
            listedBy={session.username}
            onSuccess={() => {
              setEditing(null);
              refresh();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {listings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-sand bg-white p-10 text-center">
          <p className="font-serif text-xl text-espresso">No listings yet</p>
          <p className="mt-2 text-sm text-espresso/60">
            Use List to add your first dress.
          </p>
          <Link
            href="/list"
            className="mt-6 inline-block rounded-full bg-espresso px-6 py-3 text-sm font-medium text-cream hover:bg-terracotta"
          >
            List a dress
          </Link>
        </div>
      ) : (
        <>
          <CategoryFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
            className="mt-8"
          />

          {filteredListings.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-sand bg-white p-10 text-center">
              <p className="font-serif text-xl text-espresso">
                No listings in this category
              </p>
              <p className="mt-2 text-sm text-espresso/60">
                Try another category or clear the filter.
              </p>
            </div>
          ) : (
            <div className="mt-10 space-y-4">
              {filteredListings.map((dress) => (
                <div
                  key={dress.id}
                  className="flex gap-4 rounded-2xl border border-sand bg-white p-4"
                >
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                    {dress.images[0] && (
                      <Image
                        src={dress.images[0]}
                        alt={dress.brand}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                    <div>
                      <p className="font-medium text-espresso">
                        {dress.brand}
                        {dress.name ? ` · ${dress.name}` : ""} · {dress.color}
                      </p>
                      <p className="text-sm text-espresso/60">
                        {dress.category} · Size {dress.size} ·{" "}
                        {formatPrice(dress.pricePerMonth)}/mo
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => setEditing(dress)}
                        className="rounded-full border border-sand px-4 py-2 text-sm font-medium hover:border-terracotta"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(dress.id)}
                        className="rounded-full border border-sand px-4 py-2 text-sm font-medium text-red-600 hover:border-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
