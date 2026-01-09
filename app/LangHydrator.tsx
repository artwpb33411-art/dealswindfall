"use client";

import { useEffect } from "react";
import { useLangStore } from "@/lib/languageStore";

export default function LangHydrator({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hydrate, hydrated } = useLangStore();

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated]);

  return <>{children}</>;
}
