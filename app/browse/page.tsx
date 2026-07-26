import Link from "next/link";
import BrowseGrid from "@/components/BrowseGrid";
import RequireAuth from "@/components/RequireAuth";

export default function BrowsePage() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/"
          className="text-sm text-espresso/50 transition-colors hover:text-terracotta"
        >
          ← Back to home
        </Link>

        <div className="mt-8 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
            Collection
          </p>
          <h1 className="mt-2 font-serif text-4xl text-espresso">
            Build your ready to rent closet
          </h1>
          <p className="mt-3 text-espresso/60">
            Like ♥ or pass ✕ on each dress. Once you choose, it moves to your
            liked or disliked list.
          </p>
        </div>

        <BrowseGrid />
      </div>
    </RequireAuth>
  );
}
