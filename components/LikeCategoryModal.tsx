"use client";

import { useEffect, useRef, useState } from "react";
import { ensureAccountDefaults, getCategories } from "@/lib/account";

const EMPTY_CATEGORY_IDS: string[] = [];

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
  initialCategoryIds = EMPTY_CATEGORY_IDS,
}: LikeCategoryModalProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpen.current = false;
      return;
    }

    // Only hydrate when the modal opens — never on later re-renders,
    // which previously wiped checkbox toggles mid-interaction.
    if (wasOpen.current) return;
    wasOpen.current = true;

    ensureAccountDefaults(username);
    const cats = getCategories(username);
    setCategories(cats);
    setSelectedIds(
      initialCategoryIds.length > 0
        ? [...initialCategoryIds]
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="like-category-title"
        className="w-full max-w-md rounded-2xl border border-sand bg-cream p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="like-category-title"
          className="font-serif text-2xl text-espresso"
        >
          Add to your closet
        </h2>
        <p className="mt-2 text-sm text-espresso/60">
          Select one or more categories for this clothing.
        </p>

        {categories.length === 0 ? (
          <p className="mt-6 text-sm text-espresso/60">
            Create categories in My Account first.
          </p>
        ) : (
          <div className="mt-6 space-y-2" role="group" aria-label="Categories">
            {categories.map((cat) => {
              const selected = selectedIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-terracotta bg-terracotta/10"
                      : "border-sand bg-white hover:border-terracotta/30"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                      selected
                        ? "border-terracotta bg-terracotta text-white"
                        : "border-espresso/30 bg-white"
                    }`}
                  >
                    {selected ? (
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                        <path
                          d="M2.5 6.2 4.8 8.5 9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                  <span className="text-sm font-medium text-espresso">
                    {cat.name}
                  </span>
                </button>
              );
            })}
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
