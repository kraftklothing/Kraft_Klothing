"use client";

import { Suspense } from "react";
import Link from "next/link";
import AccountPanel from "@/components/AccountPanel";

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/"
        className="text-sm text-espresso/50 transition-colors hover:text-terracotta"
      >
        ← Back to home
      </Link>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
        Profile
      </p>
      <h1 className="mt-2 font-serif text-4xl text-espresso">My Account</h1>

      <Suspense fallback={<p className="mt-10 text-sm text-espresso/50">Loading...</p>}>
        <AccountPanel />
      </Suspense>
    </div>
  );
}
