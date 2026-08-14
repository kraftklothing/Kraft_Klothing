import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-sand bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-serif text-xl text-espresso">Kraft Klothing</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-espresso/40">
              Explore
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-terracotta">
                  About & policies
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-terracotta">
                  Browse clothing
                </Link>
              </li>
              <li>
                <Link href="/liked" className="hover:text-terracotta">
                  Liked clothing
                </Link>
              </li>
              <li>
                <Link href="/disliked" className="hover:text-terracotta">
                  Disliked clothing
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-terracotta">
                  My account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-espresso/40">
              How it works
            </p>
            <ol className="mt-4 space-y-2 text-sm text-espresso/70">
              <li>1. Browse the inventory, store your favories, clear out the clutter</li>
              <li>2. Book your rental dates</li>
              <li>3. Wear it & return clean</li>
            </ol>
          </div>
        </div>

        <p className="mt-10 border-t border-sand pt-6 text-center text-xs text-espresso/40">
          © {new Date().getFullYear()} Kraft Klothing. MVP preview.
        </p>
      </div>
    </footer>
  );
}
