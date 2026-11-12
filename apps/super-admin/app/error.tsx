"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LayoutDashboard, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-[#17231f]">
      <header className="flex h-16 items-center justify-between border-b border-[#e4e9e6] bg-white px-6 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Allmap admin sign in"
        >
          <span className="flex size-8 items-center justify-center bg-[#172f26] text-sm font-bold text-white">
            A
          </span>
          <span className="text-xs font-semibold tracking-[0.12em]">
            ALLMAP <span className="font-normal text-[#75817b]">CONTROL</span>
          </span>
        </Link>
        <span className="hidden text-[11px] font-medium tracking-[0.12em] text-[#7b8781] sm:block">
          PLATFORM ADMINISTRATION
        </span>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-6 py-16 md:px-10">
        <section
          className="max-w-2xl border-l-2 border-[#c44832] py-2 pl-6 md:pl-10"
          aria-labelledby="error-title"
          role="alert"
        >
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#b63d2b]">
            <TriangleAlert className="size-4" aria-hidden="true" />
            SYSTEM ERROR
          </p>
          <h1
            id="error-title"
            className="text-3xl font-semibold leading-tight md:text-4xl"
          >
            This page hit a problem.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#65716b]">
            The page couldn’t finish loading. You can try again, or return to
            the dashboard.
          </p>
          {error.digest && (
            <p className="mt-4 font-mono text-xs text-[#8b9690]">
              Reference: {error.digest}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={reset}
              className="h-10 rounded-sm bg-[#172f26] px-4 text-white hover:bg-[#26483b]"
            >
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-sm border-[#d6ded9] bg-white px-4 text-[#34443c]"
            >
              <Link href="/dashboard">
                <LayoutDashboard aria-hidden="true" />
                Open dashboard
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
