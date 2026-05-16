import Link from "next/link";
import { BrandLogo } from "@/_components/brand";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#agents", label: "For agents" },
  { href: "#faq", label: "FAQ" },
] as const;

export function LandingNav() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/70"
      aria-label="Primary"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"
          aria-label="AllMap Hostels — home"
        >
          <BrandLogo size={32} />
        </Link>
        <div className="hidden items-center gap-7 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-700 transition-colors hover:text-orange-700"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="text-gray-700 transition-colors hover:text-orange-700"
          >
            Sign in
          </Link>
          <Link
            href="/hostels"
            className="rounded-full bg-black px-5 py-2 text-white transition-all duration-200 hover:bg-orange-700 hover:shadow-md"
          >
            Browse hostels
          </Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="#agents"
            className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:border-orange-600 hover:text-orange-700"
          >
            Agents
          </Link>
          <Link
            href="/hostels"
            className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Hostels
          </Link>
        </div>
      </div>
    </nav>
  );
}
