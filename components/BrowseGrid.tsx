"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CategoryFilter from "@/components/CategoryFilter";
import DressBrowseCard from "@/components/DressBrowseCard";
import LikeCategoryModal from "@/components/LikeCategoryModal";
import { useAuth } from "@/components/AuthProvider";
import { ensureAccountDefaults } from "@/lib/account";
import { normalizeListingCategory } from "@/lib/categories";
import { getAllDresses, loadDresses } from "@/lib/dresses";
import {
  dislikeDress,
  getDislikedIds,
  getLikedIds,
  likeDress,
} from "@/lib/preferences";
import { Dress } from "@/lib/types";

export default function BrowseGrid() {
  const router = useRouter();
  const { session } = useAuth();
  const username = session?.username ?? "";

  const [dresses, setDresses] = useState<Dress[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);
  const [likeTarget, setLikeTarget] = useState<string | null>(null);

  function refresh() {
    const allDresses = getAllDresses();
    if (!session) {
      setDresses(allDresses);
      return;
    }
    const reviewed = new Set([
      ...getLikedIds(username),
      ...getDislikedIds(username),
    ]);
    setDresses(allDresses.filter((dress) => !reviewed.has(dress.id)));
  }

  useEffect(() => {
    setMounted(true);
    if (username) ensureAccountDefaults(username);
    void loadDresses().then(() => refresh());

    window.addEventListener("kraft-dresses-updated", refresh);
    window.addEventListener("kraft-preferences-updated", refresh);

    return () => {
      window.removeEventListener("kraft-dresses-updated", refresh);
      window.removeEventListener("kraft-preferences-updated", refresh);
    };
  }, [username, session]);

  const filteredDresses = useMemo(() => {
    if (categoryFilter === "all") return dresses;
    return dresses.filter(
      (dress) => normalizeListingCategory(dress.category) === categoryFilter
    );
  }, [dresses, categoryFilter]);

  function requireLogin(): boolean {
    if (session) return true;
    router.push("/account");
    return false;
  }

  function handleLikeClick(id: string) {
    if (!requireLogin()) return;
    ensureAccountDefaults(username);
    setLikeTarget(id);
  }

  function confirmLike(categoryIds: string[]) {
    if (likeTarget) {
      likeDress(username, likeTarget, categoryIds);
      setLikeTarget(null);
      refresh();
    }
  }

  function handleDislike(id: string) {
    if (!requireLogin()) return;
    dislikeDress(username, id);
    refresh();
  }

  if (!mounted) {
    return <p className="mt-10 text-sm text-espresso/50">Loading...</p>;
  }

  if (dresses.length === 0) {
    const hasInventory = getAllDresses().length > 0;
    return (
      <div className="mt-16 rounded-2xl border border-sand bg-white p-10 text-center">
        <p className="font-serif text-xl text-espresso">
          {hasInventory ? "You're all caught up" : "No clothing listed yet"}
        </p>
        <p className="mt-2 text-sm text-espresso/60">
          {hasInventory
            ? "Liked and passed clothing is saved in your account."
            : "Check back soon for new inventory."}
        </p>
      </div>
    );
  }

  return (
    <>
      <CategoryFilter
        value={categoryFilter}
        onChange={setCategoryFilter}
        className="mt-8"
      />

      {filteredDresses.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-sand bg-white p-10 text-center">
          <p className="font-serif text-xl text-espresso">
            No items in this category
          </p>
          <p className="mt-2 text-sm text-espresso/60">
            Try another category or clear the filter.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDresses.map((dress) => (
            <DressBrowseCard
              key={dress.id}
              dress={dress}
              onLike={handleLikeClick}
              onDislike={handleDislike}
            />
          ))}
        </div>
      )}

      {session && (
        <LikeCategoryModal
          username={username}
          open={!!likeTarget}
          onClose={() => setLikeTarget(null)}
          onConfirm={confirmLike}
        />
      )}
    </>
  );
}
