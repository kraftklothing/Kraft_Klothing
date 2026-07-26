import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-sand">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sand/80 via-cream to-cream" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
            One-time wear, zero waste
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.1] text-espresso md:text-6xl">
            Wear the dress.
            <br />
            <span className="text-terracotta">Skip the price tag.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-espresso/70">
            Kraft Klothing connects you with beautiful dresses and one-time
            wear pieces from real closets near you. Perfect for weddings,
            galas, and every special moment in between.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/browse"
              className="rounded-full bg-espresso px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta"
            >
              Browse Collection
            </Link>
            <Link
              href="/list"
              className="rounded-full border border-espresso/20 px-7 py-3.5 text-sm font-medium text-espresso transition-colors hover:border-terracotta hover:text-terracotta"
            >
              List Your Closet
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 pt-8">
            <StatCard value="$45" label="avg. rental / day" />
            <StatCard value="500+" label="pieces listed" muted />
          </div>
          <div className="space-y-4">
            <StatCard value="4.9★" label="renter rating" muted />
            <StatCard value="72hr" label="typical turnaround" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  value,
  label,
  muted = false,
}: {
  value: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-sand p-6 ${
        muted ? "bg-white/50" : "bg-white"
      }`}
    >
      <p className="font-serif text-3xl text-espresso">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-espresso/50">
        {label}
      </p>
    </div>
  );
}
