"use client";

import { LISTING_CATEGORIES } from "@/lib/categories";

type CategoryFilterProps = {
  value: string;
  onChange: (category: string) => void;
  /** Optional label override. */
  label?: string;
  className?: string;
};

export default function CategoryFilter({
  value,
  onChange,
  label = "Filter by category",
  className = "",
}: CategoryFilterProps) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-espresso/50">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            value === "all"
              ? "bg-espresso text-cream"
              : "border border-sand bg-white text-espresso/70 hover:border-terracotta"
          }`}
        >
          All
        </button>
        {LISTING_CATEGORIES.map((category) => (
          <button
            type="button"
            key={category}
            onClick={() => onChange(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              value === category
                ? "bg-espresso text-cream"
                : "border border-sand bg-white text-espresso/70 hover:border-terracotta"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
