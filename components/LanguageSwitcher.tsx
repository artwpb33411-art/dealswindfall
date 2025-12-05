"use client";

import Image from "next/image";
import { useLangStore } from "@/lib/languageStore";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLangStore();

  return (
    <div className="flex gap-3 items-center">

      {/* EN / US FLAG */}
      <button
        onClick={() => setLang("en")}
        className={`p-1 rounded-md border transition ${
          lang === "en"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white"
        }`}
      >
        <Image
          src="/flags/us.png"
          alt="English"
          width={28}
          height={20}
          className="rounded-sm"
        />
      </button>

      {/* ES / SPAIN FLAG */}
      <button
        onClick={() => setLang("es")}
        className={`p-1 rounded-md border transition ${
          lang === "es"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white"
        }`}
      >
        <Image
          src="/flags/es.png"
          alt="Español"
          width={28}
          height={20}
          className="rounded-sm"
        />
      </button>

    </div>
  );
}
