"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

/** Hide the site footer on the home screen so the page fits one viewport. */
export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <Footer />;
}
