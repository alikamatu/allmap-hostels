import { Building2, HelpCircle, Users } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { ownerFaqs, studentFaqs } from "./landing-content";

function FaqBlock({
  title,
  items,
}: {
  title: string;
  items: readonly { question: string; answer: string }[];
}) {
  return (
    <div className="mb-12">
      <h3 className="mb-6 text-lg font-medium text-gray-900">{title}</h3>
      <div className="divide-y divide-gray-200 border border-gray-200">
        {items.map((faq) => (
          <details
            key={faq.question}
            className="group bg-white px-4 open:bg-gray-50/80 sm:px-6"
          >
            <summary className="cursor-pointer list-none py-5 font-medium text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                <span>{faq.question}</span>
                <span className="shrink-0 text-orange-600 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </span>
            </summary>
            <div className="border-t border-gray-100 pb-5 pt-2 text-sm leading-relaxed text-gray-600">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export function LandingFaq() {
  return (
    <section
      id="faq"
      className="bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-4xl">
        <SectionHeader
          id="faq-heading"
          eyebrow="Knowledge base"
          title="Frequently asked questions"
          description="Answers for students and hostel owners. Expand a question to read the full response—no scripts required."
          icon={<HelpCircle className="h-5 w-5 text-orange-500" aria-hidden />}
        />

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1">
            <Users className="h-3.5 w-3.5 text-orange-500" aria-hidden />
            Student topics below
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1">
            <Building2 className="h-3.5 w-3.5 text-orange-500" aria-hidden />
            Owner topics below
          </span>
        </div>

        <FaqBlock title="For students" items={studentFaqs} />
        <FaqBlock title="For hostel owners" items={ownerFaqs} />

        <div className="grid grid-cols-2 gap-6 border-t border-gray-100 pt-12 md:grid-cols-4">
          {[
            ["24/7", "Support available"],
            ["98%", "Issues resolved quickly"],
            ["2h", "Typical first response"],
            ["5000+", "Questions answered"],
          ].map(([v, l]) => (
            <div key={l} className="text-center">
              <div className="mb-2 text-2xl font-light text-gray-900">{v}</div>
              <div className="text-sm text-gray-600">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
