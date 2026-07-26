"use client";

import { useEffect, useState } from "react";
import {
  addCategory,
  deleteCategory,
  ensureAccountDefaults,
  getCategories,
  RECOMMENDED_CATEGORIES,
} from "@/lib/account";

type CategoryManagerProps = {
  username: string;
};

export default function CategoryManager({ username }: CategoryManagerProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  function refresh() {
    ensureAccountDefaults(username);
    setCategories(getCategories(username));
  }

  useEffect(() => {
    refresh();
    window.addEventListener("kraft-account-updated", refresh);
    return () => window.removeEventListener("kraft-account-updated", refresh);
  }, [username]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    addCategory(username, newName.trim());
    setNewName("");
    refresh();
  }

  function handleDelete(id: string) {
    deleteCategory(username, id);
    refresh();
  }

  return (
    <div className="mt-8 rounded-2xl border border-sand bg-white p-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            Closet categories
          </p>
          <h2 className="mt-1 font-serif text-xl text-espresso">
            Edit Categories
          </h2>
        </div>
        <span className="text-sm text-espresso/50">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <>
          <p className="mt-2 text-sm text-espresso/60">
            Suggested categories are added when you sign up. You can delete or add
            your own anytime.
          </p>

          <ul className="mt-4 space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between rounded-xl border border-sand px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-espresso">
                    {cat.name}
                  </span>
                  {RECOMMENDED_CATEGORIES.includes(cat.name) && (
                    <span className="rounded-full bg-baby-blue/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-espresso/50">
                      Suggested
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  className="text-xs text-espresso/40 transition-colors hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAdd} className="mt-4 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New category name"
              className="flex-1 rounded-xl border border-sand bg-white px-4 py-2.5 text-sm outline-none focus:border-terracotta"
            />
            <button
              type="submit"
              className="rounded-full bg-espresso px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta"
            >
              Add
            </button>
          </form>
        </>
      )}
    </div>
  );
}
