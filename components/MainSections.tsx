import Link from "next/link";

const BABY_BLUE = "#B8D4E8";

const SECTIONS = [
  {
    href: "/about",
    title: "About Us & Policies",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={BABY_BLUE} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/browse",
    title: "Browse All Dresses",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={BABY_BLUE} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 6-10 13L2 9z" />
        <path d="M2 9h20" />
        <path d="M12 22 6 9l6-6 6 6-6 13z" />
      </svg>
    ),
  },
  {
    href: "/liked",
    title: "Liked Dresses",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill={BABY_BLUE} stroke={BABY_BLUE} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: "/account",
    title: "My Account",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={BABY_BLUE} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function MainSections() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="text-center">
        <h1 className="font-serif text-4xl font-bold text-home-brown md:text-5xl">
          What would you like to do?
        </h1>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex flex-col items-center justify-center rounded-2xl border border-sand bg-white p-10 text-center transition-all hover:border-terracotta/30 hover:shadow-lg"
          >
            <span aria-hidden="true">{section.icon}</span>
            <h2 className="mt-4 font-serif text-xl font-bold text-home-brown transition-colors group-hover:text-terracotta sm:text-2xl">
              {section.title}
            </h2>
          </Link>
        ))}
      </div>
    </section>
  );
}
