"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CategoryFilter from "@/components/CategoryFilter";
import DressGrid from "@/components/DressGrid";
import LikeCategoryModal from "@/components/LikeCategoryModal";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { ensureAccountDefaults } from "@/lib/account";
import { normalizeListingCategory } from "@/lib/categories";
import { getDressById, loadDresses } from "@/lib/dresses";
import { getDislikedIds, likeDress, removeFromDisliked } from "@/lib/preferences";

function DislikedContent() {
  const { session } = useAuth();
  const username = session!.username;

  const [dislikedIds, setDislikedIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  const [relikeTarget, setRelikeTarget] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const refresh = () => setDislikedIds(getDislikedIds());
    void loadDresses().then(refresh);
    window.addEventListener("kraft-preferences-updated", refresh);
    window.addEventListener("kraft-dresses-updated", refresh);
    return () => {
      window.removeEventListener("kraft-preferences-updated", refresh);
      window.removeEventListener("kraft-dresses-updated", refresh);
    };
  }, []);

  const filteredIds = useMemo(() => {
    if (categoryFilter === "all") return dislikedIds;
    return dislikedIds.filter((id) => {
      const dress = getDressById(id);
      return (
        !!dress &&
        normalizeListingCategory(dress.category) === categoryFilter
      );
    });
  }, [dislikedIds, categoryFilter]);

  function handleRelikeClick(dressId: string) {
    ensureAccountDefaults(username);
    setRelikeTarget(dressId);
  }

  function confirmRelike(categoryIds: string[]) {
    if (relikeTarget) {
      removeFromDisliked(relikeTarget);
      likeDress(relikeTarget, categoryIds);
      setRelikeTarget(null);
      setDislikedIds(getDislikedIds());
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/account"
        className="text-sm text-espresso/50 transition-colors hover:text-terracotta"
      >
        ← Back to account
      </Link>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
        Passed items
      </p>
      <h1 className="mt-2 font-serif text-4xl text-espresso">
        Disliked Clothing
      </h1>
      <p className="mt-3 text-espresso/60">
        Clothing you passed on. Changed your mind? Tap ♥ to move one to your
        liked closet with a category.
      </p>

      {mounted && (
        <CategoryFilter
          value={categoryFilter}
          onChange={setCategoryFilter}
          className="mt-6"
        />
      )}

      {!mounted ? (
        <p className="mt-10 text-sm text-espresso/50">Loading...</p>
      ) : (
        <DressGrid
          dressIds={filteredIds}
          emptyTitle={
            dislikedIds.length === 0
              ? "No disliked clothing"
              : "No items in this category"
          }
          emptyMessage={
            dislikedIds.length === 0
              ? "Clothing you pass on in browse will show up here."
              : "Try another category or clear the filter."
          }
          showRelike
          onRelike={handleRelikeClick}
        />
      )}

      <LikeCategoryModal
        username={username}
        open={!!relikeTarget}
        onClose={() => setRelikeTarget(null)}
        onConfirm={confirmRelike}
      />
    </div>
  );
}

export default function DislikedPage() {
  return (
    <RequireAuth>
      <DislikedContent />
    </RequireAuth>
  );
}
