"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingPage } from "@repo/ui";

export default function SignUpRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?tab=signup");
  }, [router]);

  return <LoadingPage />;
}
