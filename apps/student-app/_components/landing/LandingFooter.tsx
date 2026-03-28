import Link from "next/link";
import { BrandLogo, BRAND } from "@/_components/brand";

export function LandingFooter() {
  return (
    <footer
      className="border-t border-gray-200 bg-white px-4 py-10 sm:px-6 lg:px-8"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-sm text-gray-500 md:flex-row">
        <Link href="/" className="flex items-center gap-2 text-gray-900">
          <BrandLogo size={28} />
        </Link>
        <p>{BRAND.copyright}</p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/privacy"
            className="transition-colors hover:text-orange-700"
          >
            Privacy
          </Link>
          <Link
            href="/feedback"
            className="transition-colors hover:text-orange-700"
          >
            Feedback
          </Link>
          <Link
            href="/hostels"
            className="transition-colors hover:text-orange-700"
          >
            Hostels
          </Link>
        </div>
      </div>
    </footer>
  );
}
