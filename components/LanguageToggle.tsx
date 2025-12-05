"use client";

import { useLangStore } from "@/lib/languageStore";
import Image from "next/image";

export default function LanguageToggle() {
  const { lang, setLang, hydrated, hydrate } = useLangStore();

  if (!hydrated) { 
    hydrate();
    return null; 
  }

  return (
    <div className="flex items-center gap-3">

      {/* 🇺🇸 English */}
      <button
        onClick={() => setLang("en")}
        className={`p-1 rounded-md border ${
          lang === "en"
            ? "border-blue-500 bg-blue-100"
            : "border-gray-300 hover:bg-gray-100"
        }`}
      >
        <Image
          src="/flags/us.png"
          alt="English"
          width={28}
          height={20}
        />
      </button>

      {/* 🇪🇸 Spanish */}
      <button
        onClick={() => setLang("es")}
        className={`p-1 rounded-md border ${
          lang === "es"
            ? "border-blue-500 bg-blue-100"
            : "border-gray-300 hover:bg-gray-100"
        }`}
      >
        <Image
          src="/flags/es.png"
          alt="Español"
          width={28}
          height={20}
        />
      </button>

    </div>
  );
}
