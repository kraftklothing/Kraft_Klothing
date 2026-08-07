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
        Kraft Klothing is a peer-to-peer marketplace for renting dresses and
        one-time wear items. Ability to List your self to come with future
        updates!
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
              <li>Get deposit (less cleaning/damage costs) back</li>
            </ul>
          </li>
        </ol>
      </PolicySection>

      <PolicySection title="Rental policies">
        <ul className="list-disc space-y-2 pl-5">
          <li>Rental periods are typically 3–7 days unless otherwise noted.</li>
          <li>Items must be returned in the same condition you received them.</li>
          <li>Late returns may incur additional daily fees.</li>
          <li>A refundable security deposit may apply (coming in full release).</li>
        </ul>
      </PolicySection>

      <PolicySection title="Returns & care">
        <ul className="list-disc space-y-2 pl-5">
          <li>Return items clean — dry cleaning is the renter&apos;s responsibility unless stated otherwise.</li>
          <li>Use the provided garment bag or packaging when returning.</li>
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

      <PolicySection title="For lenders">
        <p>
          When you list on Kraft Klothing, you set your own price and
          availability. We recommend pricing at 10–20% of retail value per day.
          You keep the majority of each rental — platform fees apply in the full
          release.
        </p>
      </PolicySection>

      <PolicySection title="Contact">
        <p>
          Questions about a rental or listing? Reach us at{" "}
          <a
            href="mailto:hello@kraftklothing.com"
            className="text-terracotta hover:underline"
          >
            hello@kraftklothing.com
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
