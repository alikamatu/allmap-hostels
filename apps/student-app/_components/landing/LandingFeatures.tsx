import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle,
  MapPin,
  Star,
  Target,
  Users,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import {
  ADMIN_APP_URL,
  hostelFeatureList,
  LANDING_IMAGES,
  platformAdvantages,
  studentFeatureList,
} from "./landing-content";

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl" data-reveal>
        <SectionHeader
          id="features-heading"
          eyebrow="Platform solutions"
          title="Tailored solutions for every need"
          description="Accommodation tools built for hostel owners and students—clear listings, confident bookings, and less friction end to end."
          icon={<Target className="h-5 w-5 text-orange-500" aria-hidden />}
        />

        <div className="mb-24 flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-12">
          <div className="relative w-full overflow-hidden lg:w-1/2">
            <Image
              src={LANDING_IMAGES.forHostels}
              alt="Hostel owner reviewing student accommodation listings on a laptop"
              width={960}
              height={640}
              className="h-80 w-full object-cover md:h-[60vh]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
              unoptimized
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-6">
              <a
                href={ADMIN_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-max items-center gap-2 bg-orange-500 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                List your hostel
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </div>
          </div>

          <div className="w-full lg:w-1/2 lg:pl-8">
            <div className="mb-6 flex items-center">
              <div className="mr-3 p-2">
                <Building2 className="h-6 w-6 text-gray-600" aria-hidden />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                For hostel owners
              </h3>
            </div>
            <p className="mb-6 text-2xl font-light text-gray-900">
              Optimise your student accommodation business
            </p>
            <p className="mb-8 leading-relaxed text-gray-600">
              Showcase rooms, manage availability, and connect with students
              searching near campus—without rebuilding your workflow from
              scratch.
            </p>
            <ul className="mb-10 space-y-6">
              {hostelFeatureList.map((text) => (
                <li key={text} className="flex items-start gap-4">
                  <span className="bg-orange-50 p-2">
                    <Star className="h-4 w-4 text-orange-500" aria-hidden />
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href={ADMIN_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
            >
              Explore owner tools
              <ArrowRight
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </a>
          </div>
        </div>

        <div className="flex flex-col-reverse items-center justify-between gap-8 lg:flex-row lg:gap-12">
          <div className="w-full lg:w-1/2 lg:pr-8">
            <div className="mb-6 flex items-center">
              <div className="mr-3 p-2">
                <Users className="h-6 w-6 text-gray-600" aria-hidden />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                For students
              </h3>
            </div>
            <p className="mb-6 text-2xl font-light text-gray-900">
              Find your campus accommodation
            </p>
            <p className="mb-8 leading-relaxed text-gray-600">
              Filter by distance, budget, and amenities, then book with a flow
              designed for how students actually decide.
            </p>
            <ul className="mb-10 space-y-6">
              {studentFeatureList.map((text) => (
                <li key={text} className="flex items-start gap-4">
                  <span className="bg-orange-50 p-2">
                    <MapPin className="h-4 w-4 text-orange-500" aria-hidden />
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/hostels"
              className="group inline-flex items-center text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
            >
              Start browsing
              <ArrowRight
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>

          <div className="relative w-full overflow-hidden lg:w-1/2">
            <Image
              src={LANDING_IMAGES.forStudents}
              alt="Student searching for verified hostels near university campus"
              width={960}
              height={640}
              className="h-80 w-full object-cover md:h-[60vh]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
              unoptimized
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-6">
              <Link
                href="/hostels"
                className="group inline-flex w-max items-center gap-2 bg-orange-500 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                Find accommodation
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-gray-100 pt-16">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Platform advantages
            </h3>
            <p className="mx-auto max-w-2xl text-sm text-gray-600">
              Benefits designed to make booking and listing straightforward for
              everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {platformAdvantages.map((item) => (
              <div key={item.title} className="bg-gray-50 p-6">
                <div className="mb-4 flex items-center">
                  <span className="mr-3 p-2">
                    <CheckCircle
                      className="h-5 w-5 text-orange-500"
                      aria-hidden
                    />
                  </span>
                  <h4 className="text-base font-medium text-gray-900">
                    {item.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-gray-100 pt-12 text-center">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Ready to upgrade your accommodation experience?
          </h3>
          <p className="mx-auto mb-8 max-w-md text-sm text-gray-600">
            Browse hostels as a student or open the owner portal to list your
            property.
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
