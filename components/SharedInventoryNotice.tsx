"use client";

import { useEffect, useState } from "react";
import { isSharedInventoryConfigured, loadDresses } from "@/lib/dresses";

export default function SharedInventoryNotice() {
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    void loadDresses().then(() => {
      setConfigured(isSharedInventoryConfigured());
    });
  }, []);

  if (configured !== false) return null;

  return (
    <div className="mt-6 rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-espresso/80">
      Listings are still saved only on this device. Connect free Vercel KV
      storage so every phone and account can see the same inventory.
    </div>
  );
}
