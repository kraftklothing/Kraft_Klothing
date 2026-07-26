"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/browse", label: "Browse" },
  { href: "/liked", label: "Liked" },
  { href: "/account", label: "Account" },
];

export default function Header() {
  const { session, isModerator, mounted } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-sand/60 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="font-serif text-2xl tracking-wide text-espresso transition-colors group-hover:text-terracotta">
            Kraft Klothing
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-espresso/50">
            Rent · Wear · Return
          </span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-espresso/70 transition-colors hover:text-terracotta"
            >
              {link.label}
            </Link>
          ))}
          {mounted && !session && (
            <Link
              href="/account"
              className="text-sm font-medium text-espresso/70 transition-colors hover:text-terracotta"
            >
              Login
            </Link>
          )}
          {mounted && isModerator && (
            <>
              <Link
                href="/list"
                className="rounded-full border border-terracotta px-4 py-2 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta hover:text-cream"
              >
                List
              </Link>
              <Link
                href="/edit-listings"
                className="rounded-full border border-terracotta px-4 py-2 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta hover:text-cream"
              >
                Edit listings
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {mounted && isModerator && (
            <>
              <Link
                href="/list"
                className="rounded-full border border-terracotta px-3 py-1.5 text-xs font-medium text-terracotta"
              >
                List
              </Link>
              <Link
                href="/edit-listings"
                className="rounded-full border border-terracotta px-3 py-1.5 text-xs font-medium text-terracotta"
              >
                Edit
              </Link>
            </>
          )}
          {mounted && !session && (
            <Link
              href="/account"
              className="rounded-full border border-espresso/20 px-4 py-2 text-sm font-medium text-espresso"
            >
              Login
            </Link>
          )}
          <Link
            href="/browse"
            className="rounded-full bg-espresso px-4 py-2 text-sm font-medium text-cream"
          >
            Browse
          </Link>
        </div>
      </div>
    </header>
  );
}
