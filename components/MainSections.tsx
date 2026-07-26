import Link from "next/link";

const ICON = "#7A5230";

const SECTIONS = [
  {
    href: "/about",
    title: "About Us & Policies",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ICON} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ICON} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ICON} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: "/account",
    title: "My Account",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={ICON} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function MainSections() {
  return (
    <section className="home-sections relative mx-auto max-w-4xl px-6 pb-14 pt-2 md:pb-20 md:pt-3">
      <div className="divide-y divide-walnut/15">
        {SECTIONS.map((section, index) => (
          <Link
            key={section.href}
            href={section.href}
            className="home-link group flex items-center gap-5 px-2 py-6 transition-colors hover:bg-walnut/[0.06] sm:px-4"
            style={{ animationDelay: `${0.12 + index * 0.06}s` }}
          >
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-walnut/10 transition-transform duration-300 group-hover:scale-105 group-hover:bg-walnut/15"
            >
              {section.icon}
            </span>
            <h3 className="flex-1 font-serif text-xl text-cocoa transition-colors group-hover:text-walnut sm:text-2xl">
              {section.title}
            </h3>
            <span
              aria-hidden="true"
              className="text-walnut/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-walnut"
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
