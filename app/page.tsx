import MainSections from "@/components/MainSections";

export default function HomePage() {
  return (
    <div className="home-shell flex min-h-0 flex-1 flex-col justify-center text-cocoa">
      <section className="home-hero relative overflow-hidden">
        <div className="home-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="home-hero-grain pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pb-3 pt-8 text-center md:pb-4 md:pt-10">
          <p className="home-fade-up font-serif text-4xl font-semibold tracking-tight text-cocoa sm:text-5xl md:text-6xl">
            Kraft Klothing
          </p>
          <h1 className="home-fade-up home-delay-1 mt-3 font-sans text-xs font-medium uppercase tracking-[0.35em] text-walnut sm:text-sm md:text-base">
            Rent · Wear · Return
          </h1>
          <p className="home-fade-up home-delay-2 mx-auto mt-3 max-w-md text-sm leading-relaxed text-cocoa/70 sm:text-base md:text-lg">
            Best priced one-time wear fashion to save money and the environment
          </p>
          <div
            className="home-fade-up home-delay-3 mt-4 h-px w-16 bg-walnut/35"
            aria-hidden="true"
          />
        </div>
      </section>

      <MainSections />
    </div>
  );
}
