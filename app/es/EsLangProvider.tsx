"use client";

import { useEffect } from "react";
import { useLangStore } from "@/lib/languageStore";

export default function EsLangProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setLang, hydrate, hydrated } = useLangStore();

  useEffect(() => {
    if (!hydrated) {
      hydrate();
      return;
    }
    console.log("✅ EsLangProvider mounted -> setting lang=es");
    setLang("es");
  }, [hydrated]);

  return <>{children}</>;
}
