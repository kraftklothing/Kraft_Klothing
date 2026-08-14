import MainSections from "@/components/MainSections";
import MonthlyBundleDemo from "@/components/MonthlyBundleDemo";

export default function HomePage() {
  return (
    <div className="home-shell text-cocoa">
      <section className="home-hero relative overflow-hidden">
        <div className="home-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="home-hero-grain pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-6 pb-4 pt-14 text-center md:pb-5 md:pt-20">
          <p className="home-fade-up font-serif text-5xl font-semibold tracking-tight text-cocoa md:text-7xl">
            Kraft Klothing
          </p>
          <h1 className="home-fade-up home-delay-1 mt-5 font-sans text-sm font-medium uppercase tracking-[0.35em] text-walnut md:text-base">
            Rent · Wear · Return
          </h1>
          <p className="home-fade-up home-delay-2 mx-auto mt-5 max-w-md text-base leading-relaxed text-cocoa/70 md:text-lg">
            Best priced one-time wear fashion to save money and the environment
          </p>
          <div
            className="home-fade-up home-delay-3 mt-6 h-px w-16 bg-walnut/35"
            aria-hidden="true"
          />
        </div>
      </section>

      <MainSections />
      <MonthlyBundleDemo />
    </div>
  );
}
