import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Banknote, BadgeCheck } from "lucide-react";
import { BRAND } from "@/_components/brand";
import { LANDING_IMAGES, ADMIN_APP_URL, AGENT_EARNINGS } from "./landing-content";

export function LandingHero() {
  return (
    <section
      className="relative flex min-h-[min(100dvh,920px)] overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="m-2 flex flex-1 flex-col gap-2 overflow-hidden lg:flex-row">
        <div className="relative flex-1 overflow-hidden rounded-3xl lg:rounded-[2rem]">
          {/* Optimized hero image — eager + priority for LCP */}
          <Image
            src={LANDING_IMAGES.heroBg}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40"
            aria-hidden
          />
          <div className="relative z-10 flex h-full min-h-[420px] items-center lg:min-h-0">
            <div className="w-full max-w-3xl px-6 text-left sm:px-10 lg:px-16">
              <p className="ah-anim-fade-up mb-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-orange-700 backdrop-blur sm:text-sm">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                Verified student hostels in Ghana
              </p>
              <h1
                id="hero-heading"
                className="ah-anim-fade-up ah-delay-75 mb-5 text-3xl leading-[1.05] font-bold tracking-tight text-orange-700 sm:text-4xl md:text-5xl lg:text-6xl"
              >
                Find your perfect student hostel
              </h1>
              <p className="ah-anim-fade-up ah-delay-150 mb-8 max-w-xl text-black sm:text-lg md:text-xl">
                Discover, compare, and book off-campus hostels near Legon, KNUST,
                UCC and UEW. Verified reviews, proximity filtering, and secure
                checkout all on {BRAND.name}.
              </p>
              <div className="ah-anim-fade-up ah-delay-225 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/hostels"
                  className="group inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-sm font-bold text-white transition-all duration-200 hover:bg-orange-700 hover:shadow-lg"
                >
                  Find hostels
                  <ChevronRight
                    className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                <Link
                  href="/login?tab=signup"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white/90 px-8 py-4 text-sm font-bold text-gray-900 backdrop-blur transition-colors hover:border-orange-600 hover:text-orange-700"
                >
                  Create free account
                </Link>
              </div>

              {/* Agent earnings ribbon */}
              <Link
                href={ADMIN_APP_URL}
                rel="noopener"
                className="ah-anim-fade-up ah-delay-300 group mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-left backdrop-blur transition-colors hover:border-orange-600 hover:bg-white"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <Banknote className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-700">
                    For hostel agents
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    Earn {AGENT_EARNINGS.currency} {AGENT_EARNINGS.commission}
                    <span className="font-normal text-gray-600">
                      {" "}
                      per confirmed booking
                    </span>
                    <ChevronRight
                      className="ml-1 inline h-4 w-4 -translate-y-px transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
