"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LoginPage = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password, rememberMe);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#1d2722] selection:bg-[#f5dfcd] selection:text-[#1d2722]">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 h-full w-[72%] opacity-70"
        viewBox="0 0 1100 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern
            id="map-grid"
            width="42"
            height="42"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 42 0 L 0 0 0 42" stroke="#f0f3f1" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1100" height="900" fill="url(#map-grid)" />
        <path
          d="M-90 644C86 562 80 448 260 422c173-25 210 104 374 54 116-36 110-147 248-170 99-17 163 16 257-28"
          stroke="#e9eeeb"
          strokeWidth="1.5"
        />
        <path
          d="M-72 690C107 606 119 498 286 473c158-24 199 98 354 53 130-38 129-152 271-176 98-16 168 17 251-23"
          stroke="#e9eeeb"
          strokeWidth="1.5"
        />
        <path
          d="M-54 738C129 653 157 549 314 526c142-21 189 92 333 51 142-40 147-160 291-182 96-15 170 20 246-17"
          stroke="#e9eeeb"
          strokeWidth="1.5"
        />
        <path
          d="M128 900c22-93 99-120 112-198 14-86-52-126-35-211 15-75 87-102 95-178 8-69-30-112-16-184"
          stroke="#edf1ee"
          strokeWidth="1.5"
        />
        <path
          d="M177 900c24-89 95-113 108-190 15-85-48-125-30-208 16-76 82-101 94-176 11-68-22-113-4-181"
          stroke="#edf1ee"
          strokeWidth="1.5"
        />
        <circle cx="637" cy="470" r="5" fill="#e98136" />
        <circle cx="637" cy="470" r="13" stroke="#e98136" strokeOpacity=".22" />
        <path d="M637 483v19" stroke="#e98136" strokeOpacity=".5" />
      </svg>

      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col px-6 sm:px-10 lg:px-16">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-[#edf0ee]">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#f7eee7] text-[#d66b25]">
              <MapPin className="size-5" strokeWidth={2.2} aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-semibold">allmap</p>
              <p className="mt-1 text-[10px] font-medium tracking-[0.13em] text-[#8b9690]">
                ADMINISTRATION
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#68746d]">
            <ShieldCheck className="size-4 text-[#668271]" aria-hidden="true" />
            <span className="hidden sm:inline">
              Secure administrator access
            </span>
            <span className="sm:hidden">Secure access</span>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-16 py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-24 lg:py-16">
          <section className="relative z-10 hidden max-w-xl lg:block">
            <p className="mb-6 text-xs font-semibold tracking-[0.14em] text-[#d66b25]">
              ALLMAP OPERATIONS
            </p>
            <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] text-[#202923] sm:text-6xl">
              A clearer view of every stay.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#69756e]">
              Manage properties, bookings, and payments from one considered
              workspace.
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[#e8edea] pt-5 text-[11px] font-medium tracking-[0.1em] text-[#7b8780]">
              <span>PROPERTIES</span>
              <span
                className="size-1 rounded-full bg-[#e98136]"
                aria-hidden="true"
              />
              <span>BOOKINGS</span>
              <span
                className="size-1 rounded-full bg-[#e98136]"
                aria-hidden="true"
              />
              <span>PAYMENTS</span>
            </div>
          </section>

          <section
            className="relative z-10 w-full max-w-md justify-self-center lg:justify-self-end"
            aria-labelledby="sign-in-title"
          >
            <div className="mb-8">
              <p className="mb-3 text-xs font-medium text-[#d66b25]">
                ADMIN PORTAL
              </p>
              <h2
                id="sign-in-title"
                className="text-3xl font-semibold text-[#202923]"
              >
                Sign in
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#758078]">
                Use your administrator account to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#35423a]"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  inputMode="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-12 rounded-lg border-[#dce2de] bg-white px-3.5 text-sm text-[#202923] shadow-none placeholder:text-[#a0aaa4] focus-visible:border-[#d9874c] focus-visible:ring-[#d9874c]/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#35423a]"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="h-12 rounded-lg border-[#dce2de] bg-white px-3.5 pr-12 text-sm text-[#202923] shadow-none placeholder:text-[#a0aaa4] focus-visible:border-[#d9874c] focus-visible:ring-[#d9874c]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#7b8780] transition-colors hover:text-[#26372e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d9874c]"
                  >
                    {showPassword ? (
                      <EyeOff className="size-[18px]" aria-hidden="true" />
                    ) : (
                      <Eye className="size-[18px]" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex min-h-6 items-center justify-between gap-4 pt-1">
                <label
                  htmlFor="remember"
                  className="flex cursor-pointer items-center gap-2.5 text-sm text-[#5f6b64]"
                >
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="size-4 accent-[#d66b25] focus-visible:ring-2 focus-visible:ring-[#d9874c] focus-visible:ring-offset-2"
                  />
                  Keep me signed in
                </label>
                <span className="text-xs text-[#98a19b]">
                  Administrator only
                </span>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex gap-2.5 rounded-lg border border-[#f1d5d0] bg-[#fff8f6] px-3.5 py-3 text-sm text-[#a33d2f]"
                >
                  <TriangleAlert
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <p>{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="group mt-2 h-12 w-full justify-between rounded-lg bg-[#202923] px-4 text-sm font-medium text-white shadow-none transition-colors hover:bg-[#34443a] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{isLoading ? "Signing in…" : "Continue"}</span>
                {isLoading ? (
                  <span
                    className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                    aria-label="Loading"
                  />
                ) : (
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                )}
              </Button>
            </form>

            <div className="mt-7 flex items-start gap-2.5 border-t border-[#e8edea] pt-5 text-xs leading-5 text-[#7b8780]">
              <LockKeyhole
                className="mt-0.5 size-4 shrink-0 text-[#9aa49e]"
                aria-hidden="true"
              />
              <p>
                Access is restricted to authorized Allmap administrators. Your
                credentials are handled securely.
              </p>
            </div>
          </section>
        </main>

        <footer className="flex min-h-14 items-center justify-between gap-4 border-t border-[#edf0ee] text-[11px] text-[#929c96]">
          <span>© 2026 Allmap</span>
          <span>Administrator sign in</span>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
