import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BRAND } from "@/_components/brand";
import { LANDING_IMAGES } from "./landing-content";

export function LandingHero() {
  return (
    <section
      className="relative flex min-h-[min(100dvh,920px)] overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="m-2 flex flex-1 flex-col gap-2 overflow-hidden lg:flex-row">
        <div className="relative flex-1 overflow-hidden rounded-3xl lg:rounded-[2rem]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${LANDING_IMAGES.heroBg}')` }}
            role="img"
            aria-label="Campus and student housing illustration"
          />
          <div className="absolute inset-0 bg-black/20" aria-hidden />
          <div className="relative z-10 flex h-full min-h-[420px] items-center lg:min-h-0">
            <div className="w-full max-w-3xl px-6 text-left sm:px-10 lg:px-16">
              <p className="mb-4 text-sm font-bold text-orange-700 sm:text-base md:text-lg">
                For students
              </p>
              <h1
                id="hero-heading"
                className="mb-5 text-3xl leading-tight font-bold text-orange-700 sm:text-4xl md:text-5xl lg:text-6xl"
              >
                Find your perfect student hostel
              </h1>
              <p className="mb-8 max-w-xl text-black sm:text-lg md:text-xl">
                Discover, compare, and book off-campus hostels with verified
                reviews, proximity filtering, and secure checkout on{" "}
                {BRAND.name}.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/hostels"
                  className="group inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-orange-700"
                >
                  Find hostels
                  <ChevronRight
                    className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/login?tab=signup"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white/90 px-8 py-4 text-sm font-bold text-gray-900 transition-colors hover:border-orange-600 hover:text-orange-700"
                >
                  Create free account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
