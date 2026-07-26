"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DressGrid from "@/components/DressGrid";
import LikeCategoryModal from "@/components/LikeCategoryModal";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { ensureAccountDefaults } from "@/lib/account";
import { getDislikedIds, likeDress, removeFromDisliked } from "@/lib/preferences";

function DislikedContent() {
  const { session } = useAuth();
  const username = session!.username;

  const [dislikedIds, setDislikedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [relikeTarget, setRelikeTarget] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const refresh = () => setDislikedIds(getDislikedIds());
    refresh();
    window.addEventListener("kraft-preferences-updated", refresh);
    return () =>
      window.removeEventListener("kraft-preferences-updated", refresh);
  }, []);

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
        Disliked Dresses
      </h1>
      <p className="mt-3 text-espresso/60">
        Dresses you passed on. Changed your mind? Tap ♥ to move one to your
        liked closet with a category.
      </p>

      {!mounted ? (
        <p className="mt-10 text-sm text-espresso/50">Loading...</p>
      ) : (
        <DressGrid
          dressIds={dislikedIds}
          emptyTitle="No disliked dresses"
          emptyMessage="Dresses you pass on in browse will show up here."
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
