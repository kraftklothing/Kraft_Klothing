"use client";

import { useEffect, useState } from "react";
import { ensureAccountDefaults, getCategories } from "@/lib/account";

type LikeCategoryModalProps = {
  username: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (categoryIds: string[]) => void;
  initialCategoryIds?: string[];
};

export default function LikeCategoryModal({
  username,
  open,
  onClose,
  onConfirm,
  initialCategoryIds = [],
}: LikeCategoryModalProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    ensureAccountDefaults(username);
    const cats = getCategories(username);
    setCategories(cats);
    setSelectedIds(
      initialCategoryIds.length > 0
        ? initialCategoryIds
        : cats[0]
          ? [cats[0].id]
          : []
    );
  }, [open, username, initialCategoryIds]);

  function toggleCategory(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-sand bg-cream p-6 shadow-xl">
        <h2 className="font-serif text-2xl text-espresso">
          Add to your closet
        </h2>
        <p className="mt-2 text-sm text-espresso/60">
          Select one or more categories for this dress.
        </p>

        {categories.length === 0 ? (
          <p className="mt-6 text-sm text-espresso/60">
            Create categories in My Account first.
          </p>
        ) : (
          <div className="mt-6 space-y-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  selectedIds.includes(cat.id)
                    ? "border-terracotta bg-terracotta/10"
                    : "border-sand bg-white hover:border-terracotta/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="accent-terracotta"
                />
                <span className="text-sm font-medium text-espresso">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-sand py-2.5 text-sm font-medium text-espresso"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => onConfirm(selectedIds)}
            className="flex-1 rounded-full bg-espresso py-2.5 text-sm font-medium text-cream hover:bg-terracotta disabled:opacity-40"
          >
            Save to closet
          </button>
        </div>
      </div>
    </div>
  );
}
