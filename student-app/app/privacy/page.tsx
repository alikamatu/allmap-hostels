'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-black">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>

      <p className="text-sm mb-6">
        This Privacy Policy explains how AllMap Hostels (&quots;AllMapHostels&quots;, &quots;we&quots;,
        &quots;our&quots;, or &quots;us&quots;) collects, uses, discloses, and protects your personal
        information when you use our website and services.
      </p>

      <p className="text-sm mb-8">
        This policy is written in accordance with the Ghana Data Protection Act,
        2012 (Act 843).
      </p>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg font-bold">1. Information We Collect</h2>
        <p className="text-sm">
          We may collect the following types of information:
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Account information such as name, phone number, and email address</li>
          <li>Login and authentication details</li>
          <li>Search activity, filters, and preferences within the app</li>
          <li>Communication data when you contact us</li>
          <li>Technical data such as device type, browser, and IP address</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg font-bold">2. How We Use Your Information</h2>
        <p className="text-sm">We use your information to:</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Create and manage user accounts</li>
          <li>Provide hostel listings and booking-related features</li>
          <li>Improve platform performance and user experience</li>
          <li>Communicate important updates or support messages</li>
          <li>Ensure platform security and prevent abuse</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg font-bold">3. Legal Basis for Processing</h2>
        <p className="text-sm">
          We process personal data based on one or more of the following lawful
          grounds:
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Your consent</li>
          <li>Performance of a contract or service</li>
          <li>Compliance with legal obligations under Ghanaian law</li>
          <li>Legitimate business interests</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg font-bold">4. Sharing of Information</h2>
        <p className="text-sm">
          We do not sell your personal data. We may share information only when
          necessary with:
        </p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Hostel managers for booking or inquiry purposes</li>
          <li>Service providers who help operate the platform</li>
          <li>Law enforcement or regulators when required by law</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg font-bold">5. Data Retention</h2>
        <p className="text-sm">
          We retain personal data only for as long as necessary to fulfill the
          purposes outlined in this policy or as required by law.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg font-bold">6. Your Rights Under Ghana Law</h2>
        <p className="text-sm">Under the Data Protection Act, you have the right to:</p>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Request access to your personal data</li>
          <li>Request correction or deletion of inaccurate data</li>
          <li>Withdraw consent where processing is based on consent</li>
          <li>Object to processing in certain circumstances</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg font-bold">7. Data Security</h2>
        <p className="text-sm">
          We implement reasonable technical and organizational measures to protect
          personal data against unauthorized access, loss, or misuse.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg font-bold">8. Cookies and Analytics</h2>
        <p className="text-sm">
          We may use cookies or similar technologies to improve functionality and
          understand usage patterns. You can control cookies through your browser
          settings.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-lg font-bold">9. Changes to This Policy</h2>
        <p className="text-sm">
          We may update this Privacy Policy from time to time. Any changes will be
          posted on this page with an updated effective date.
        </p>
      </section>

      <section className="space-y-4 mb-12">
        <h2 className="text-lg font-bold">10. Contact Us</h2>
        <p className="text-sm">
          If you have questions about this Privacy Policy or how we handle your
          data, please contact us at:
        </p>
        <p className="text-sm">
          <strong>Email:</strong> alikamatuosama@gmail.com
        </p>
      </section>

      <Link href="allmaphostels.com" className="text-sm underline">
        Back to Home
      </Link>
    </main>
  );
}