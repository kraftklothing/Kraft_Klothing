"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DressGrid from "@/components/DressGrid";
import InlineFilterEditor from "@/components/InlineFilterEditor";
import RentModal from "@/components/RentModal";
import { useAuth } from "@/components/AuthProvider";
import {
  addCategory,
  addFitLabel,
  deleteCategory,
  deleteFitLabel,
  ensureAccountDefaults,
  getCategories,
  getFitLabels,
} from "@/lib/account";
import { getDressById } from "@/lib/dresses";
import { getLiked, updateLikedDress } from "@/lib/preferences";
import { LikedDress } from "@/lib/types";

export default function LikedCloset() {
  const { session } = useAuth();
  const username = session?.username ?? "";

  const [liked, setLiked] = useState<LikedDress[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [fitLabelOptions, setFitLabelOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeFitFilter, setActiveFitFilter] = useState<string>("all");
  const [activeColorFilter, setActiveColorFilter] = useState<string>("all");
  const [editingCategories, setEditingCategories] = useState(false);
  const [editingFitLabels, setEditingFitLabels] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rentTarget, setRentTarget] = useState<string | null>(null);

  function refresh() {
    ensureAccountDefaults(username);
    setLiked(getLiked());
    setCategories(getCategories(username));
    setFitLabelOptions(getFitLabels(username));
  }

  useEffect(() => {
    setMounted(true);
    refresh();

    window.addEventListener("kraft-preferences-updated", refresh);
    window.addEventListener("kraft-account-updated", refresh);
    window.addEventListener("kraft-rentals-updated", refresh);

    return () => {
      window.removeEventListener("kraft-preferences-updated", refresh);
      window.removeEventListener("kraft-account-updated", refresh);
      window.removeEventListener("kraft-rentals-updated", refresh);
    };
  }, [username]);

  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    liked.forEach((l) => {
      const dress = getDressById(l.dressId);
      if (dress?.color) colors.add(dress.color);
    });
    return Array.from(colors).sort();
  }, [liked]);

  const filteredIds = useMemo(() => {
    return liked
      .filter((l) => {
        if (activeCategory !== "all" && !l.categoryIds.includes(activeCategory)) {
          return false;
        }
        if (activeFitFilter !== "all" && l.fitLabel !== activeFitFilter) {
          return false;
        }
        if (activeColorFilter !== "all") {
          const dress = getDressById(l.dressId);
          if (!dress || dress.color !== activeColorFilter) return false;
        }
        return true;
      })
      .map((l) => l.dressId);
  }, [liked, activeCategory, activeFitFilter, activeColorFilter]);

  const categoryLabels = useMemo(() => {
    const map: Record<string, string[]> = {};
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    liked.forEach((l) => {
      map[l.dressId] = l.categoryIds
        .map((id) => catMap[id])
        .filter(Boolean) as string[];
    });
    return map;
  }, [liked, categories]);

  const assignedFitLabels = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    liked.forEach((l) => {
      map[l.dressId] = l.fitLabel;
    });
    return map;
  }, [liked]);

  function handleFitLabelChange(dressId: string, labelId: string) {
    updateLikedDress(dressId, { fitLabel: labelId });
    refresh();
  }

  if (!session) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/"
        className="text-sm text-espresso/50 transition-colors hover:text-terracotta"
      >
        ← Back to home
      </Link>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
        Saved favorites
      </p>
      <h1 className="mt-2 font-serif text-4xl text-espresso">Liked Dresses</h1>
      <p className="mt-3 text-espresso/60">
        Label fit, filter by category or color, and rent when ready.
      </p>

      {mounted && (
        <>
          <div className="mt-6">
            <FilterHeader
              title="Filter by fit"
              editing={editingFitLabels}
              onEdit={() => setEditingFitLabels((v) => !v)}
            />
            {editingFitLabels && (
              <InlineFilterEditor
                items={fitLabelOptions}
                onAdd={(name) => {
                  addFitLabel(username, name);
                  refresh();
                }}
                onDelete={(id) => {
                  deleteFitLabel(username, id);
                  refresh();
                }}
                placeholder="New fit label..."
              />
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterTab
                label="All"
                active={activeFitFilter === "all"}
                onClick={() => setActiveFitFilter("all")}
              />
              {fitLabelOptions.map((fl) => (
                <FilterTab
                  key={fl.id}
                  label={fl.name}
                  active={activeFitFilter === fl.id}
                  onClick={() => setActiveFitFilter(fl.id)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <FilterHeader
              title="Filter by category"
              editing={editingCategories}
              onEdit={() => setEditingCategories((v) => !v)}
            />
            {editingCategories && (
              <InlineFilterEditor
                items={categories}
                onAdd={(name) => {
                  addCategory(username, name);
                  refresh();
                }}
                onDelete={(id) => {
                  deleteCategory(username, id);
                  refresh();
                }}
                placeholder="New category..."
              />
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterTab
                label="All"
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              />
              {categories.map((cat) => (
                <FilterTab
                  key={cat.id}
                  label={cat.name}
                  active={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                />
              ))}
            </div>
          </div>

          {availableColors.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-espresso/50">
                Filter by color
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterTab
                  label="All"
                  active={activeColorFilter === "all"}
                  onClick={() => setActiveColorFilter("all")}
                />
                {availableColors.map((color) => (
                  <FilterTab
                    key={color}
                    label={color}
                    active={activeColorFilter === color}
                    onClick={() => setActiveColorFilter(color)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!mounted ? (
        <p className="mt-10 text-sm text-espresso/50">Loading...</p>
      ) : (
        <DressGrid
          dressIds={filteredIds}
          emptyTitle="No dresses match these filters"
          emptyMessage="Try a different fit, category, or color filter."
          showRent
          showFitLabel
          categoryLabels={categoryLabels}
          fitLabelOptions={fitLabelOptions}
          assignedFitLabels={assignedFitLabels}
          onFitLabelChange={handleFitLabelChange}
          onRent={setRentTarget}
        />
      )}

      <RentModal
        dressId={rentTarget ?? ""}
        username={username}
        open={!!rentTarget}
        onClose={() => setRentTarget(null)}
        onSuccess={() => refresh()}
      />
    </div>
  );
}

function FilterHeader({
  title,
  editing,
  onEdit,
}: {
  title: string;
  editing: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-espresso/50">
        {title}
      </p>
      <button
        type="button"
        onClick={onEdit}
        className={`text-[10px] uppercase tracking-wider transition-colors ${
          editing ? "text-terracotta" : "text-espresso/30 hover:text-espresso/50"
        }`}
      >
        Edit
      </button>
    </div>
  );
}

function FilterTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-espresso text-cream"
          : "border border-sand bg-white text-espresso/70 hover:border-terracotta"
      }`}
    >
      {label}
    </button>
  );
}
