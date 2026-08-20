"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { formatPrice, getAllDresses, loadDresses } from "@/lib/dresses";
import { Dress } from "@/lib/types";

const MONTHLY_BUDGET = 50;

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** Pack a random max-$50/month wardrobe from inventory, favoring fuller bundles. */
export function buildMonthlyBundle(
  dresses: Dress[],
  budget = MONTHLY_BUDGET,
  attempts = 14
): Dress[] {
  const pool = dresses.filter(
    (dress) => dress.pricePerMonth > 0 && dress.pricePerMonth <= budget
  );
  if (pool.length === 0) return [];

  let best: Dress[] = [];
  let bestScore = -1;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const shuffled = shuffle(pool);
    const bundle: Dress[] = [];
    let total = 0;

    for (const dress of shuffled) {
      if (total + dress.pricePerMonth <= budget) {
        bundle.push(dress);
        total += dress.pricePerMonth;
      }
    }

    // Prefer more pieces, then totals closer to the $50 demo budget.
    const score = bundle.length * 1000 + total;
    if (score > bestScore) {
      best = bundle;
      bestScore = score;
    }
  }

  return best;
}

function bundleTotal(bundle: Dress[]): number {
  return bundle.reduce((sum, dress) => sum + dress.pricePerMonth, 0);
}

export default function MonthlyBundleDemo() {
  const [bundle, setBundle] = useState<Dress[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasInventory, setHasInventory] = useState(false);
  const [exampleKey, setExampleKey] = useState(0);

  const refreshBundle = useCallback(() => {
    const dresses = getAllDresses();
    setHasInventory(dresses.length > 0);
    setBundle(buildMonthlyBundle(dresses));
    setExampleKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void loadDresses().then(() => {
      if (cancelled) return;
      refreshBundle();
      setLoading(false);
    });

    function onUpdated() {
      refreshBundle();
    }

    window.addEventListener("kraft-dresses-updated", onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("kraft-dresses-updated", onUpdated);
    };
  }, [refreshBundle]);

  const total = bundleTotal(bundle);

  return (
    <section className="relative mx-auto max-w-4xl px-6 pb-16 pt-4 md:pb-24 md:pt-6">
      <div className="border-t border-walnut/15 pt-10 md:pt-12">
        <p className="mx-auto max-w-2xl text-center font-serif text-lg leading-snug text-cocoa sm:text-xl md:text-2xl">
          Example of how far 50$ in a month could go
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center font-serif text-2xl leading-snug text-cocoa sm:text-3xl md:text-4xl">
          Instead of buying a new piece each month, rent 50$ of new pieces each
          month
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-cocoa/65 md:text-base">
          Each example is a random closet under {formatPrice(MONTHLY_BUDGET)} for
          one month — about what a single new shirt might cost to buy.
        </p>

        <div className="mt-6 flex justify-center md:mt-8">
          <button
            type="button"
            onClick={refreshBundle}
            disabled={loading || !hasInventory}
            className="border border-walnut/35 bg-transparent px-6 py-2.5 text-sm font-medium uppercase tracking-[0.2em] text-walnut transition-colors hover:border-walnut hover:bg-walnut/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            shuffle example
          </button>
        </div>

        <div className="mt-8 md:mt-10">
          {loading ? (
            <p className="py-10 text-center text-sm text-cocoa/50">
              Loading inventory…
            </p>
          ) : !hasInventory ? (
            <p className="py-10 text-center text-sm text-cocoa/50">
              List a few pieces to unlock live ~{formatPrice(MONTHLY_BUDGET)}{" "}
              bundle examples.
            </p>
          ) : bundle.length === 0 ? (
            <p className="py-10 text-center text-sm text-cocoa/50">
              No pieces priced at {formatPrice(MONTHLY_BUDGET)} or less yet —
              lower a listing price to see a sample month.
            </p>
          ) : (
            <div
              key={exampleKey}
              className="bundle-fade-in grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4"
            >
              {bundle.map((dress) => {
                const mainImage = dress.images[0];
                return (
                  <article key={dress.id} className="min-w-0">
                    <div className="relative aspect-[3/4] overflow-hidden bg-walnut/10">
                      {mainImage ? (
                        <Image
                          src={mainImage}
                          alt={`${dress.brand} ${dress.category}`}
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="(max-width: 640px) 45vw, 20vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-walnut/40">
                          No photo
                        </div>
                      )}
                    </div>
                    <p className="mt-2 truncate font-serif text-base text-cocoa">
                      {dress.brand}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-walnut/70">
                      {dress.category}
                    </p>
                    <p className="mt-1 text-sm text-cocoa/70">
                      {formatPrice(dress.pricePerMonth)}
                      <span className="text-cocoa/45">/mo</span>
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {!loading && bundle.length > 0 && (
          <p className="mt-8 text-center font-serif text-xl text-cocoa md:text-2xl">
            {bundle.length} piece{bundle.length === 1 ? "" : "s"} ·{" "}
            {formatPrice(total)}
            <span className="text-base text-cocoa/55"> / month</span>
          </p>
        )}
      </div>
    </section>
  );
}
