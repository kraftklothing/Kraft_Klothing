"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/dresses";
import { Dress } from "@/lib/types";

type DressBrowseCardProps = {
  dress: Dress;
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
};

export default function DressBrowseCard({
  dress,
  onLike,
  onDislike,
}: DressBrowseCardProps) {
  const mainImage = dress.images[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-sand bg-white">
      <div className="relative aspect-[3/4] bg-sand">
        {mainImage && (
          <Image
            src={mainImage}
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
        <div className="flex items-start justify-between gap-3">
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
            <span className="text-espresso/50">Category:</span> {dress.category}
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

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => onLike(dress.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-sand py-2.5 text-sm font-medium transition-colors hover:border-terracotta hover:bg-terracotta/10"
            aria-label="Like clothing"
          >
            ♥ Like
          </button>
          <button
            type="button"
            onClick={() => onDislike(dress.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-sand py-2.5 text-sm font-medium transition-colors hover:border-espresso/30 hover:bg-espresso/5"
            aria-label="Dislike clothing"
          >
            ✕ Pass
          </button>
        </div>
      </div>
    </div>
  );
}
