"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DressForm from "@/components/DressForm";
import SharedInventoryNotice from "@/components/SharedInventoryNotice";
import { useAuth } from "@/components/AuthProvider";

export default function ListPage() {
  const { isModerator, session, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (mounted && !isModerator) {
      router.replace("/account");
    }
  }, [mounted, isModerator, router]);

  if (!mounted || !session) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-sm text-espresso/50">Loading...</p>
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-sm text-espresso/50">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href="/"
        className="text-sm text-espresso/50 transition-colors hover:text-terracotta"
      >
        ← Back to home
      </Link>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
        Moderator access
      </p>
      <h1 className="mt-2 font-serif text-4xl text-espresso">List Clothing</h1>
      <p className="mt-4 leading-relaxed text-espresso/70">
        Add photos, crop them, and list to the site for everyone to browse.
      </p>

      <SharedInventoryNotice />

      <div className="mt-10 rounded-2xl border border-sand bg-white p-6 sm:p-8">
        <DressForm listedBy={session.username} />
      </div>
    </div>
  );
}
