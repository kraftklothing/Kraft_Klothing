import MainSections from "@/components/MainSections";

export default function HomePage() {
  return (
    <div className="text-home-brown">
      <section className="border-b border-sand bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sand/80 via-cream to-cream">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
            Kraft Klothing
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold leading-tight text-home-brown md:text-6xl">
            Rent · Wear · Return
          </h1>
          <p className="mx-auto mt-4 max-w-md text-home-brown/70">
            Best priced one-time wear fashion to save money and the environment
          </p>
        </div>
      </section>

      <MainSections />
    </div>
  );
}
