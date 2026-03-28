"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  Lock,
  Mail,
  MapPin,
  Search,
  Shield,
  Star,
  Target,
  Users,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import {
  ADMIN_APP_URL,
  hostelHowSteps,
  studentHowSteps,
} from "./landing-content";

export function LandingHowItWorks() {
  const [tab, setTab] = useState<"students" | "hostels">("students");

  return (
    <section
      id="how-it-works"
      className="bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          id="how-it-works-heading"
          eyebrow="Platform process"
          title="How it works"
          description="Straightforward paths for students booking a room and owners listing a property—with clear steps end to end."
          icon={<Target className="h-5 w-5 text-orange-500" aria-hidden />}
        />

        <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => setTab("students")}
            className={`flex items-center justify-center gap-3 px-8 py-4 text-sm font-medium transition-colors ${
              tab === "students"
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            aria-pressed={tab === "students"}
          >
            <Users
              className={`h-4 w-4 ${tab === "students" ? "text-orange-500" : "text-gray-400"}`}
              aria-hidden
            />
            For students
          </button>
          <button
            type="button"
            onClick={() => setTab("hostels")}
            className={`flex items-center justify-center gap-3 px-8 py-4 text-sm font-medium transition-colors ${
              tab === "hostels"
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            aria-pressed={tab === "hostels"}
          >
            <Building2
              className={`h-4 w-4 ${tab === "hostels" ? "text-orange-500" : "text-gray-400"}`}
              aria-hidden
            />
            For hostels
          </button>
        </div>

        {tab === "students" ? <StudentFlow /> : <HostelFlow />}

        <div className="mt-16 border-t border-gray-100 pt-16 text-center">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            {tab === "students"
              ? "Ready to find your accommodation?"
              : "Ready to list your property?"}
          </h3>
          <p className="mx-auto mb-8 max-w-md text-sm text-gray-600">
            {tab === "students"
              ? "Browse verified hostels and book when you are ready."
              : "Open the owner portal to publish your listing."}
          </p>
          {tab === "students" ? (
            <Link
              href="/hostels"
              className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              Start searching
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <a
              href={ADMIN_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              Begin listing
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

const studentStepIcons = [Mail, Search, BookOpen, CreditCard] as const;
const hostelStepIcons = [FileText, CheckCircle, Calendar, CreditCard] as const;

function StudentFlow() {
  return (
    <>
      <div className="mb-12">
        <div className="mb-6 flex items-center">
          <div className="mr-3 p-2">
            <Users className="h-5 w-5 text-gray-600" aria-hidden />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Student process</h3>
        </div>
        <p className="leading-relaxed text-gray-600">
          Four steps from account to confirmation—built around how students
          compare hostels.
        </p>
      </div>

      <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {studentHowSteps.map((step, index) => {
          const StepIcon = studentStepIcons[index] ?? Search;
          return (
            <div key={step.title} className="relative">
              <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center bg-orange-500 text-sm font-medium text-white">
                {index + 1}
              </div>
              <div className="bg-gray-50 p-6 pt-8">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 bg-orange-50 p-2">
                    <StepIcon className="h-5 w-5 text-orange-500" aria-hidden />
                  </div>
                  <h4 className="text-base font-medium text-gray-900">
                    {step.title}
                  </h4>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start text-xs text-gray-500"
                    >
                      <span className="mr-2 p-1">
                        <CheckCircle
                          className="h-3 w-3 text-orange-500"
                          aria-hidden
                        />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-6 flex items-center">
          <div className="mr-3 p-2">
            <Shield className="h-5 w-5 text-gray-600" aria-hidden />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            What you can expect
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="bg-gray-50 p-6">
            <div className="mb-3 flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-orange-500" aria-hidden />
              <h4 className="text-sm font-medium text-gray-900">
                Location context
              </h4>
            </div>
            <p className="text-xs text-gray-600">
              See how listings relate to your campus and commute.
            </p>
          </div>
          <div className="bg-gray-50 p-6">
            <div className="mb-3 flex items-center">
              <Lock className="mr-2 h-4 w-4 text-orange-500" aria-hidden />
              <h4 className="text-sm font-medium text-gray-900">
                Secure checkout
              </h4>
            </div>
            <p className="text-xs text-gray-600">
              Clear steps and confirmations so you know what happens next.
            </p>
          </div>
          <div className="bg-gray-50 p-6">
            <div className="mb-3 flex items-center">
              <Star className="mr-2 h-4 w-4 text-orange-500" aria-hidden />
              <h4 className="text-sm font-medium text-gray-900">
                Reviews you can use
              </h4>
            </div>
            <p className="text-xs text-gray-600">
              Use student feedback to shortlist with confidence.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function HostelFlow() {
  return (
    <>
      <div className="mb-12">
        <div className="mb-6 flex items-center">
          <div className="mr-3 p-2">
            <Building2 className="h-5 w-5 text-gray-600" aria-hidden />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Hostel owner process
          </h3>
        </div>
        <p className="leading-relaxed text-gray-600">
          List, verify, and manage your property with tools built for
          residential operators.
        </p>
      </div>

      <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {hostelHowSteps.map((step, index) => {
          const StepIcon = hostelStepIcons[index] ?? Building2;
          return (
            <div key={step.title} className="relative">
              <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center bg-orange-500 text-sm font-medium text-white">
                {index + 1}
              </div>
              <div className="bg-gray-50 p-6 pt-8">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 bg-orange-50 p-2">
                    <StepIcon className="h-5 w-5 text-orange-500" aria-hidden />
                  </div>
                  <h4 className="text-base font-medium text-gray-900">
                    {step.title}
                  </h4>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start text-xs text-gray-500"
                    >
                      <span className="mr-2 p-1">
                        <CheckCircle
                          className="h-3 w-3 text-orange-500"
                          aria-hidden
                        />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-6 flex items-center">
          <div className="mr-3 p-2">
            <Target className="h-5 w-5 text-gray-600" aria-hidden />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Owner advantages
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="bg-gray-50 p-6">
            <div className="mb-3 flex items-center">
              <Users className="mr-2 h-4 w-4 text-orange-500" aria-hidden />
              <h4 className="text-sm font-medium text-gray-900">
                Student reach
              </h4>
            </div>
            <p className="text-xs text-gray-600">
              Connect with students searching near your catchment.
            </p>
          </div>
          <div className="bg-gray-50 p-6">
            <div className="mb-3 flex items-center">
              <Search className="mr-2 h-4 w-4 text-orange-500" aria-hidden />
              <h4 className="text-sm font-medium text-gray-900">
                Discoverability
              </h4>
            </div>
            <p className="text-xs text-gray-600">
              Complete profiles surface better in search and filters.
            </p>
          </div>
          <div className="bg-gray-50 p-6">
            <div className="mb-3 flex items-center">
              <Shield className="mr-2 h-4 w-4 text-orange-500" aria-hidden />
              <h4 className="text-sm font-medium text-gray-900">
                Operational clarity
              </h4>
            </div>
            <p className="text-xs text-gray-600">
              Dashboards and notifications keep bookings organised.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
