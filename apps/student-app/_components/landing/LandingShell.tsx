import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-landing-mont",
  display: "swap",
});

export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${montserrat.variable} min-h-screen bg-white text-black antialiased selection:bg-orange-600 selection:text-white`}
      style={{ fontFamily: "var(--font-landing-mont), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
