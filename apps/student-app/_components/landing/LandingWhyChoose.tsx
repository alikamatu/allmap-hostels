"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe,
  Heart,
  MapPin,
  Shield,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { ADMIN_APP_URL, benefitSlides } from "./landing-content";

const slideIcons = [Shield, BookOpen, CreditCard, MapPin] as const;

export function LandingWhyChoose() {
  const [index, setIndex] = useState(0);
  const slide = benefitSlides[index];
  const Icon = slideIcons[index] ?? Globe;

  const go = useCallback((dir: number) => {
    setIndex((i) => {
      const n = i + dir;
      if (n >= benefitSlides.length) return 0;
      if (n < 0) return benefitSlides.length - 1;
      return n;
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => go(1), 8000);
    return () => clearInterval(t);
  }, [go]);

  if (!slide) return null;

  return (
    <section
      className="bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="why-choose-heading"
    >
      <div className="mx-auto max-w-6xl" data-reveal>
        <SectionHeader
          id="why-choose-heading"
          eyebrow="Platform benefits"
          title="Why choose our platform"
          description="Transparent listings, direct connections, and tools that keep students and owners aligned."
          icon={<Globe className="h-5 w-5 text-orange-500" aria-hidden />}
        />

        <div className="mb-12 flex justify-center gap-2">
          {benefitSlides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-orange-500" : "bg-gray-300"
              }`}
              onClick={() => setIndex(i)}
              aria-label={`Show benefit ${i + 1}`}
            />
          ))}
        </div>

        <div className="relative px-2 sm:px-10">
          <button
            type="button"
            className="absolute top-1/2 left-0 z-10 -translate-x-1 -translate-y-1/2 p-2 text-gray-400 transition-colors hover:text-orange-600 sm:-translate-x-2"
            onClick={() => go(-1)}
            aria-label="Previous benefit"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-0 z-10 translate-x-1 -translate-y-1/2 p-2 text-gray-400 transition-colors hover:text-orange-600 sm:translate-x-2"
            onClick={() => go(1)}
            aria-label="Next benefit"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div
            key={slide.id}
            className="transition-opacity duration-300 ease-out"
          >
            <div className="mb-12 flex justify-center">
              <div className="bg-orange-50 p-4">
                <Icon className="h-8 w-8 text-orange-500" aria-hidden />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-8 flex items-center">
                  <div className="mr-3 p-2">
                    <Users className="h-5 w-5 text-gray-600" aria-hidden />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    For students
                  </h3>
                </div>
                <h4 className="mb-4 text-2xl font-light text-gray-900 capitalize">
                  {slide.studentTitle}
                </h4>
                <p className="mb-8 leading-relaxed text-gray-600">
                  {slide.studentDescription}
                </p>
                <ul className="space-y-4">
                  {slide.studentBullets.map((line) => (
                    <li key={line} className="flex items-start">
                      <span className="mr-3 p-1">
                        <CheckCircle
                          className="h-4 w-4 text-orange-500"
                          aria-hidden
                        />
                      </span>
                      <span className="text-sm text-gray-600">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-8 flex items-center">
                  <div className="mr-3 p-2">
                    <Building2 className="h-5 w-5 text-gray-600" aria-hidden />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    For hostel owners
                  </h3>
                </div>
                <h4 className="mb-4 text-2xl font-light text-gray-900 capitalize">
                  {slide.hostelTitle}
                </h4>
                <p className="mb-8 leading-relaxed text-gray-600">
                  {slide.hostelDescription}
                </p>
                <ul className="space-y-4">
                  {slide.hostelBullets.map((line) => (
                    <li key={line} className="flex items-start">
                      <span className="mr-3 p-1">
                        <CheckCircle
                          className="h-4 w-4 text-orange-500"
                          aria-hidden
                        />
                      </span>
                      <span className="text-sm text-gray-600">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-100 pt-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              ["100%", "Verified listings"],
              ["24/7", "Support coverage"],
              ["Clear", "Pricing communication"],
              ["98%", "Satisfaction rate"],
            ].map(([value, label]) => (
              <div key={label} className="text-center">
                <div className="mb-2 text-3xl font-light text-gray-900">
                  {value}
                </div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-gray-100 pt-16">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Additional platform advantages
            </h3>
            <p className="mx-auto max-w-2xl text-sm text-gray-600">
              Built for trust on both sides of a booking.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex gap-3">
              <Target
                className="mt-1 h-5 w-5 shrink-0 text-orange-500"
                aria-hidden
              />
              <div>
                <h4 className="mb-2 text-base font-medium text-gray-900">
                  Student-first flows
                </h4>
                <p className="text-sm text-gray-600">
                  Search, compare, and book with screens designed around real
                  student decisions.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <TrendingUp
                className="mt-1 h-5 w-5 shrink-0 text-orange-500"
                aria-hidden
              />
              <div>
                <h4 className="mb-2 text-base font-medium text-gray-900">
                  Growth-friendly tools
                </h4>
                <p className="text-sm text-gray-600">
                  Owners get structure for pricing, availability, and showcasing
                  their property.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Heart
                className="mt-1 h-5 w-5 shrink-0 text-orange-500"
                aria-hidden
              />
              <div>
                <h4 className="mb-2 text-base font-medium text-gray-900">
                  Community tone
                </h4>
                <p className="text-sm text-gray-600">
                  Reviews and clarity help good hostels stand out and help
                  students feel confident.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Shield
                className="mt-1 h-5 w-5 shrink-0 text-orange-500"
                aria-hidden
              />
              <div>
                <h4 className="mb-2 text-base font-medium text-gray-900">
                  Secure by design
                </h4>
                <p className="text-sm text-gray-600">
                  Checkout and account flows follow modern security practices.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-100 pt-16 text-center">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Experience the difference
          </h3>
          <p className="mx-auto mb-8 max-w-lg text-sm text-gray-600">
            Open the student app to browse hostels or jump to the owner portal
            to list a property.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/hostels"
              className="bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              Explore as student
            </Link>
            <a
              href={ADMIN_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-900"
            >
              List your hostel
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
