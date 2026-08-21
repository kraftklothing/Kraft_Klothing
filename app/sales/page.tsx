import Link from "next/link";
import SalesPanel from "@/components/SalesPanel";

export default function SalesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/"
        className="text-sm text-espresso/50 transition-colors hover:text-terracotta"
      >
        ← Back to home
      </Link>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
        Moderator access
      </p>
      <h1 className="mt-2 font-serif text-4xl text-espresso">Sales</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-espresso/70">
        Track where each piece was bought and how much you&apos;re making per
        item and per purchase source.
      </p>

      <SalesPanel />
    </div>
  );
}
