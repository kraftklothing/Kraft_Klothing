"use client";

import { useState } from "react";

type InlineFilterEditorProps = {
  items: { id: string; name: string }[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  placeholder?: string;
};

export default function InlineFilterEditor({
  items,
  onAdd,
  onDelete,
  placeholder = "Add new...",
}: InlineFilterEditorProps) {
  const [newName, setNewName] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName("");
  }

  return (
    <div className="mt-2 rounded-xl border border-sand bg-white/80 p-4">
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-sand px-3 py-2 text-sm"
          >
            <span className="text-espresso">{item.name}</span>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="text-xs text-espresso/40 hover:text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="mt-3 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-terracotta"
        />
        <button
          type="submit"
          className="rounded-full bg-espresso px-3 py-2 text-xs font-medium text-cream hover:bg-terracotta"
        >
          Add
        </button>
      </form>
    </div>
  );
}
