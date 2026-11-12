import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
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
          className="max-w-2xl border-l-2 border-[#ff7a00] py-2 pl-6 md:pl-10"
          aria-labelledby="not-found-title"
        >
          <p className="mb-5 text-xs font-semibold tracking-[0.16em] text-[#db6c08]">
            ROUTE NOT FOUND <span className="ml-2 text-[#a6afaa]">/ 404</span>
          </p>
          <p className="mb-3 text-7xl font-semibold leading-none tracking-tight text-[#d9e0dc] md:text-8xl">
            404
          </p>
          <h1
            id="not-found-title"
            className="text-3xl font-semibold leading-tight md:text-4xl"
          >
            This page isn’t on the map.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-[#65716b]">
            The address may be outdated, or the page may have moved. Check the
            URL or return to an admin starting point.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              className="h-10 rounded-sm bg-[#172f26] px-4 text-white hover:bg-[#26483b]"
            >
              <Link href="/dashboard">
                <LayoutDashboard aria-hidden="true" />
                Open dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-sm border-[#d6ded9] bg-white px-4 text-[#34443c]"
            >
              <Link href="/">
                <ArrowLeft aria-hidden="true" />
                Return to sign in
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
