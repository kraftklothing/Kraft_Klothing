"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/liked", label: "Liked" },
  { href: "/account", label: "Account" },
];

export default function Header() {
  const { session, isModerator, mounted } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-sand/60 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
        {/* Brand + nav on one row so links sit beside Kraft Klothing, not the tagline */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            className="group shrink-0 font-serif text-xl tracking-wide text-espresso transition-colors group-hover:text-terracotta sm:text-2xl"
          >
            Kraft Klothing
          </Link>

          <nav className="flex shrink-0 flex-nowrap items-center justify-end gap-0.5 sm:gap-2">
            {!(mounted && isModerator) &&
              NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap rounded-full px-1.5 py-1 text-[11px] font-medium text-espresso/80 transition-colors hover:bg-espresso/5 hover:text-terracotta sm:px-3 sm:py-1.5 sm:text-sm"
                >
                  {link.label}
                </Link>
              ))}

            {mounted && isModerator && (
              <>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hidden whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-espresso/80 transition-colors hover:bg-espresso/5 hover:text-terracotta md:inline-flex"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/list"
                  className="whitespace-nowrap rounded-full border border-terracotta px-2.5 py-1 text-[11px] font-medium text-terracotta transition-colors hover:bg-terracotta hover:text-cream sm:px-4 sm:py-1.5 sm:text-sm"
                >
                  List
                </Link>
                <Link
                  href="/edit-listings"
                  className="whitespace-nowrap rounded-full border border-terracotta px-2.5 py-1 text-[11px] font-medium text-terracotta transition-colors hover:bg-terracotta hover:text-cream sm:px-4 sm:py-1.5 sm:text-sm"
                >
                  <span className="sm:hidden">Edit</span>
                  <span className="hidden sm:inline">Edit listings</span>
                </Link>
                <Link
                  href="/accounts"
                  className="whitespace-nowrap rounded-full border border-terracotta px-2.5 py-1 text-[11px] font-medium text-terracotta transition-colors hover:bg-terracotta hover:text-cream sm:px-4 sm:py-1.5 sm:text-sm"
                >
                  Accounts
                </Link>
              </>
            )}

          </nav>
        </div>

        <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-espresso/50">
          Rent · Wear · Return
        </p>
      </div>
    </header>
  );
}
