import Link from "next/link";
import { Globe, Mail, MessageSquare } from "lucide-react";
import { BRAND } from "@/_components/brand";

export function LandingContact() {
  return (
    <section
      id="contact"
      className="border-t border-gray-100 bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2">
          <Globe className="h-5 w-5 text-gray-400" aria-hidden />
          <span className="text-xs tracking-widest text-gray-500 uppercase">
            Contact
          </span>
        </div>
        <h2
          id="contact-heading"
          className="mb-4 text-3xl font-light tracking-tight text-gray-900 md:text-4xl"
        >
          We are here to help
        </h2>
        <div className="mx-auto mb-6 h-px w-24 bg-gray-300" />
        <p className="mb-10 text-sm leading-relaxed text-gray-600">
          Bookings, listings, or product feedback—reach the team by email or
          send a structured message through our feedback page.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={`mailto:${BRAND.supportEmail}`}
            className="inline-flex items-center gap-2 border border-gray-300 px-6 py-3 text-sm font-medium text-gray-900 transition-colors hover:border-orange-500 hover:text-orange-700"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {BRAND.supportEmail}
          </a>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            <MessageSquare className="h-4 w-4" aria-hidden />
            Open feedback form
          </Link>
        </div>
      </div>
    </section>
  );
}
