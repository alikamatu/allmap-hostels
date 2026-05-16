import { landingStats } from "./landing-content";

export function LandingStats() {
  return (
    <section
      className="bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-label="Platform statistics"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {landingStats.map((row, idx) => (
          <div
            key={row.label}
            data-reveal
            style={{ transitionDelay: `${idx * 60}ms` }}
            className="p-6 text-center"
          >
            <div className="mb-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              {row.value}
            </div>
            <div className="text-sm font-medium text-gray-800">{row.label}</div>
            <div className="mt-1 text-xs text-gray-500">{row.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
