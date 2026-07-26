import Link from "next/link";
import EditListingsPanel from "@/components/EditListingsPanel";

export default function EditListingsPage() {
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
      <h1 className="mt-2 font-serif text-4xl text-espresso">Edit Listings</h1>
      <p className="mt-4 leading-relaxed text-espresso/70">
        Update or remove dresses you&apos;ve already posted.
      </p>

      <EditListingsPanel />
    </div>
  );
}
