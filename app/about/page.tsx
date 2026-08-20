import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/"
        className="text-sm text-espresso/50 transition-colors hover:text-terracotta"
      >
        ← Back to home
      </Link>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
        About Us & Policies
      </p>
      <h1 className="mt-2 font-serif text-4xl text-espresso">
        About Kraft Klothing
      </h1>
      <p className="mt-4 leading-relaxed text-espresso/70">
        Lowest priced clothing rentals to save you money for special events and
        occasions.
      </p>

      <PolicySection title="How renting works">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Browse all inventory in &quot;Browse&quot; so you never miss an item
            / new drop
          </li>
          <li>Like any piece you could ever see yourself wearing</li>
          <li>
            Dislike any piece that will never fit or you can never see yourself
            wearing to clear out the apps clutter
          </li>
          <li>
            Sort liked items by occasion so it is easy to decide what to rent
            when an occasion is coming up
          </li>
          <li>
            Complete the rental flow:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Rent with deposit</li>
              <li>Pickup</li>
              <li>Wear</li>
              <li>Drop off</li>
              <li>Get deposit (less Cleaning Charge and damage) back</li>
            </ul>
          </li>
        </ol>
      </PolicySection>

      <PolicySection title="Rental policies">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Rental periods are by month — choose a month and rent for that
            month.
          </li>
          <li>
            Items must be returned in the same condition you received them, or
            else the Cleaning Charge will be removed from your deposit.
          </li>
          <li>Late returns may incur additional daily fees.</li>
          <li>A refundable security deposit applies to each rental.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Returns & care">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            We dry clean items after each rental — Cleaning Charge comes from
            deposit.
          </li>
          <li>Report any issues within 24 hours of receiving the item.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Damage & cancellation">
        <ul className="list-disc space-y-2 pl-5">
          <li>Minor wear from normal use is expected; significant damage may be deducted from the deposit.</li>
          <li>Cancellations made 48+ hours before the rental start date receive a full refund.</li>
          <li>Cancellations within 48 hours may forfeit the rental fee.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          Questions about a rental or listing? Reach us at{" "}
          <a
            href="mailto:ked212121@gmail.com"
            className="text-terracotta hover:underline"
          >
            ked212121@gmail.com
          </a>
          .
        </p>
      </PolicySection>
    </div>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-sand pt-8">
      <h2 className="font-serif text-2xl text-espresso">{title}</h2>
      <div className="mt-4 text-sm leading-relaxed text-espresso/70">
        {children}
      </div>
    </section>
  );
}
