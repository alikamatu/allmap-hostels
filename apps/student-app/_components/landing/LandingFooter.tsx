import Link from "next/link";
import { Facebook, Instagram, Mail, Twitter } from "lucide-react";
import { BrandLogo, BRAND } from "@/_components/brand";
import { ADMIN_APP_URL } from "./landing-content";

const footerLinks = {
  Product: [
    { href: "/hostels", label: "Browse hostels" },
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#faq", label: "FAQ" },
  ],
  "For agents": [
    { href: "#agents", label: "Agent earnings" },
    { href: "/agents", label: "Full agent guide" },
    { href: ADMIN_APP_URL, label: "Agent portal", external: true },
  ],
  Company: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/feedback", label: "Feedback" },
  ],
} as const;

const socials = [
  { href: BRAND.socials.facebook, label: "Facebook", Icon: Facebook },
  { href: BRAND.socials.instagram, label: "Instagram", Icon: Instagram },
  { href: BRAND.socials.twitter, label: "Twitter", Icon: Twitter },
] as const;

export function LandingFooter() {
  return (
    <footer
      className="border-t border-gray-200 bg-white px-4 py-14 sm:px-6 lg:px-8"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_3fr]">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2"
              aria-label={`${BRAND.name} — home`}
            >
              <BrandLogo size={32} />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-gray-600">
              {BRAND.description}
            </p>
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="inline-flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-orange-700"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {BRAND.supportEmail}
            </a>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3"
          >
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {heading}
                </h3>
                <ul className="space-y-2 text-sm">
                  {links.map((link) => (
                    <li key={link.label}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          rel="noopener"
                          className="text-gray-700 transition-colors hover:text-orange-700"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-gray-700 transition-colors hover:text-orange-700"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>{BRAND.copyright}</p>
          <div className="flex items-center gap-3">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={`${BRAND.shortName} on ${label}`}
                rel="noopener"
                target="_blank"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-orange-600 hover:text-orange-700"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
