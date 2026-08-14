"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, getDressById } from "@/lib/dresses";
import { FitLabelOption, Dress } from "@/lib/types";

type DressGridProps = {
  dressIds: string[];
  emptyTitle: string;
  emptyMessage: string;
  showRelike?: boolean;
  showUnlike?: boolean;
  showRent?: boolean;
  showFitLabel?: boolean;
  categoryLabels?: Record<string, string[]>;
  fitLabelOptions?: FitLabelOption[];
  assignedFitLabels?: Record<string, string | undefined>;
  onRelike?: (dressId: string) => void;
  onUnlike?: (dressId: string) => void;
  onRent?: (dressId: string) => void;
  onFitLabelChange?: (dressId: string, labelId: string) => void;
};

export default function DressGrid({
  dressIds,
  emptyTitle,
  emptyMessage,
  showRelike = false,
  showUnlike = false,
  showRent = false,
  showFitLabel = false,
  categoryLabels = {},
  fitLabelOptions = [],
  assignedFitLabels = {},
  onRelike,
  onUnlike,
  onRent,
  onFitLabelChange,
}: DressGridProps) {
  const dresses = dressIds
    .map((id) => getDressById(id))
    .filter((dress): dress is Dress => !!dress);

  if (dresses.length === 0) {
    return (
      <div className="mt-16 rounded-2xl border border-sand bg-white p-10 text-center">
        <p className="font-serif text-xl text-espresso">{emptyTitle}</p>
        <p className="mt-2 text-sm text-espresso/60">{emptyMessage}</p>
        <Link
          href="/browse"
          className="mt-6 inline-block rounded-full bg-espresso px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-terracotta"
        >
          Browse clothing
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {dresses.map((dress) => (
        <div
          key={dress.id}
          className="overflow-hidden rounded-2xl border border-sand bg-white"
        >
          <div className="relative aspect-[3/4] bg-sand">
            {dress.images[0] && (
              <Image
                src={dress.images[0]}
                alt={
                  dress.name
                    ? `${dress.brand} ${dress.name}`
                    : `${dress.brand} clothing`
                }
                fill
                className="object-cover"
                unoptimized
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
          </div>
          <div className="p-4">
            {categoryLabels[dress.id]?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {categoryLabels[dress.id].map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-medium text-espresso/70"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
            <div
              className={`flex items-start justify-between gap-3 ${
                categoryLabels[dress.id]?.length > 0 ? "mt-2" : ""
              }`}
            >
              {dress.name ? (
                <p className="text-sm font-medium text-espresso">{dress.name}</p>
              ) : (
                <span />
              )}
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-espresso/50">
                  {dress.brand}
                </p>
                {dress.color ? (
                  <p className="mt-0.5 text-xs text-espresso/60">{dress.color}</p>
                ) : null}
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm text-espresso/70">
              <p>
                <span className="text-espresso/50">Category:</span>{" "}
                {dress.category}
              </p>
              <p>
                <span className="text-espresso/50">Size:</span> {dress.size}
              </p>
              <p>
                <span className="text-espresso/50">Price:</span>{" "}
                {formatPrice(dress.pricePerMonth)}
                <span className="text-espresso/50">/month</span>
              </p>
            </div>

            {showFitLabel && onFitLabelChange && fitLabelOptions.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-espresso/50">
                  Fit label
                </p>
                <div className="flex flex-col gap-1.5">
                  {fitLabelOptions.map((fl) => (
                    <button
                      key={fl.id}
                      type="button"
                      onClick={() => onFitLabelChange(dress.id, fl.id)}
                      className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                        assignedFitLabels[dress.id] === fl.id
                          ? "border-terracotta bg-terracotta/10 font-medium text-espresso"
                          : "border-sand text-espresso/70 hover:border-terracotta/30"
                      }`}
                    >
                      {fl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
              {showRent && onRent && (
                <button
                  type="button"
                  onClick={() => onRent(dress.id)}
                  className="w-full rounded-full bg-espresso py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta"
                >
                  Rent
                </button>
              )}
              {showUnlike && onUnlike && (
                <button
                  type="button"
                  onClick={() => onUnlike(dress.id)}
                  className="w-full rounded-full border border-sand py-2.5 text-sm font-medium text-espresso/70 transition-colors hover:border-terracotta hover:bg-terracotta/10 hover:text-espresso"
                >
                  Unlike
                </button>
              )}
              {showRelike && onRelike && (
                <button
                  type="button"
                  onClick={() => onRelike(dress.id)}
                  className="w-full rounded-full border border-sand py-2.5 text-sm font-medium transition-colors hover:border-terracotta hover:bg-terracotta/10"
                >
                  ♥ Like this clothing
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
