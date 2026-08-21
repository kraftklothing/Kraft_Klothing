"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import {
  formatMoney,
  getDressById,
  getDressesByLister,
  loadDresses,
} from "@/lib/dresses";
import {
  buildItemSalesRows,
  buildSourceSalesRows,
  summarizeSales,
  type ItemSalesRow,
  type SourceSalesRow,
} from "@/lib/sales";
import { getAllRentals } from "@/lib/rentals";

type SalesView = "items" | "sources";

function moneyClass(amount: number): string {
  if (amount > 0) return "text-emerald-800";
  if (amount < 0) return "text-terracotta";
  return "text-espresso/70";
}

export default function SalesPanel() {
  const { session, isModerator, mounted } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ItemSalesRow[]>([]);
  const [view, setView] = useState<SalesView>("items");

  function refresh() {
    if (!session) return;
    const dresses = getDressesByLister(session.username);
    setItems(buildItemSalesRows(dresses, getAllRentals()));
  }

  useEffect(() => {
    if (mounted && !isModerator) {
      router.replace("/account");
    }
  }, [mounted, isModerator, router]);

  useEffect(() => {
    if (!mounted || !isModerator) return;
    void loadDresses().then(() => refresh());

    const onUpdate = () => refresh();
    window.addEventListener("kraft-dresses-updated", onUpdate);
    window.addEventListener("kraft-rentals-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("kraft-dresses-updated", onUpdate);
      window.removeEventListener("kraft-rentals-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [mounted, isModerator, session]);

  const sources = useMemo(() => buildSourceSalesRows(items), [items]);
  const summary = useMemo(() => summarizeSales(items), [items]);

  if (!mounted || !isModerator || !session) {
    return <p className="mt-10 text-sm text-espresso/50">Loading...</p>;
  }

  return (
    <div className="mt-10 space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat label="Items tracked" value={String(summary.itemCount)} />
        <SummaryStat
          label="Purchase cost"
          value={formatMoney(summary.purchaseCost)}
        />
        <SummaryStat
          label="Earned from rentals"
          value={formatMoney(summary.earned)}
        />
        <SummaryStat
          label="Profit"
          value={formatMoney(summary.profit)}
          valueClassName={moneyClass(summary.profit)}
        />
      </section>

      <p className="text-sm leading-relaxed text-espresso/60">
        Profit = rental rent + cleaning charges − purchase price. Deposits are
        not counted as earnings. Sandbox demo rentals are excluded.
      </p>

      <div className="flex gap-2">
        <ViewTab
          active={view === "items"}
          onClick={() => setView("items")}
          label="Per item"
        />
        <ViewTab
          active={view === "sources"}
          onClick={() => setView("sources")}
          label="Per source"
        />
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sand bg-white/60 px-6 py-10 text-center text-sm text-espresso/50">
          No listings yet. Add clothing with a purchase source and cost to track
          sales here.
        </p>
      ) : view === "items" ? (
        <ItemSalesTable rows={items} />
      ) : (
        <SourceSalesTable rows={sources} />
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  valueClassName = "text-espresso",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-sand bg-white px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-espresso/40">
        {label}
      </p>
      <p className={`mt-2 font-serif text-2xl ${valueClassName}`}>{value}</p>
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-espresso text-cream"
          : "border border-sand bg-white text-espresso/70 hover:border-terracotta hover:text-terracotta"
      }`}
    >
      {label}
    </button>
  );
}

function ItemSalesTable({ rows }: { rows: ItemSalesRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-sand bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-sand bg-cream/50 text-xs uppercase tracking-wider text-espresso/45">
          <tr>
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium text-right">Cost</th>
            <th className="px-4 py-3 font-medium text-right">Earned</th>
            <th className="px-4 py-3 font-medium text-right">Profit</th>
            <th className="px-4 py-3 font-medium text-right">Rentals</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const dress = getDressById(row.dressId);
            const thumb = dress?.images?.[0];
            return (
              <tr key={row.dressId} className="border-b border-sand/70 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-sand">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium text-espresso">{row.name}</p>
                      <p className="text-xs text-espresso/50">{row.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-espresso/75">{row.source}</td>
                <td className="px-4 py-3 text-right tabular-nums text-espresso/75">
                  {formatMoney(row.purchasePrice)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-espresso/75">
                  {formatMoney(row.earned)}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular-nums font-medium ${moneyClass(row.profit)}`}
                >
                  {formatMoney(row.profit)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-espresso/60">
                  {row.rentalCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SourceSalesTable({ rows }: { rows: SourceSalesRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-sand bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-sand bg-cream/50 text-xs uppercase tracking-wider text-espresso/45">
          <tr>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium text-right">Items</th>
            <th className="px-4 py-3 font-medium text-right">Cost</th>
            <th className="px-4 py-3 font-medium text-right">Earned</th>
            <th className="px-4 py-3 font-medium text-right">Profit</th>
            <th className="px-4 py-3 font-medium text-right">Rentals</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.source} className="border-b border-sand/70 last:border-0">
              <td className="px-4 py-3 font-medium text-espresso">{row.source}</td>
              <td className="px-4 py-3 text-right tabular-nums text-espresso/75">
                {row.itemCount}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-espresso/75">
                {formatMoney(row.purchaseCost)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-espresso/75">
                {formatMoney(row.earned)}
              </td>
              <td
                className={`px-4 py-3 text-right tabular-nums font-medium ${moneyClass(row.profit)}`}
              >
                {formatMoney(row.profit)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-espresso/60">
                {row.rentalCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
