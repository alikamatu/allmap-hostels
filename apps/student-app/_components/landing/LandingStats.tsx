import { landingStats } from "./landing-content";

export function LandingStats() {
  return (
    <section
      className="bg-white px-4 py-16 sm:px-6 lg:px-8"
      aria-label="Platform statistics"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {landingStats.map((row) => (
          <div key={row.label} className="p-6 text-center">
            <div className="mb-2 text-3xl font-light text-gray-900">
              {row.value}
            </div>
            <div className="text-sm text-gray-600">{row.label}</div>
            <div className="mt-2 text-xs text-gray-400">{row.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
