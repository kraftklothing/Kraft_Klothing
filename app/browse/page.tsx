import Link from "next/link";
import BrowseGrid from "@/components/BrowseGrid";

export default function BrowsePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link
        href="/"
        className="text-sm text-espresso/50 transition-colors hover:text-terracotta"
      >
        ← Back to home
      </Link>

      <div className="mt-8 max-w-xl">
        <h1 className="font-serif text-4xl text-espresso">Browse</h1>
        <p className="mt-3 text-espresso/60">
          Like ♥ or pass ✕ on each clothing item. Once you choose, it moves to
          your liked or disliked list.
        </p>
      </div>

      <BrowseGrid />
    </div>
  );
}
