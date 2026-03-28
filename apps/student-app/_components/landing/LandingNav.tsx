import Link from "next/link";
import { BrandLogo } from "@/_components/brand";

export function LandingNav() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-gray-200 bg-white"
      aria-label="Primary"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo size={32} />
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link
            href="#features"
            className="text-gray-700 transition-colors hover:text-orange-700"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-gray-700 transition-colors hover:text-orange-700"
          >
            How it works
          </Link>
          <Link
            href="#faq"
            className="text-gray-700 transition-colors hover:text-orange-700"
          >
            FAQ
          </Link>
          <Link
            href="/login"
            className="text-gray-700 transition-colors hover:text-orange-700"
          >
            Sign in
          </Link>
          <Link
            href="/hostels"
            className="rounded-full bg-black px-5 py-2 text-white transition-colors hover:bg-orange-700"
          >
            Browse hostels
          </Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/hostels"
            className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
          >
            Hostels
          </Link>
        </div>
      </div>
    </nav>
  );
}
