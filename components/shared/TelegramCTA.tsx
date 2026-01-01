"use client";

import { FaTelegramPlane } from "react-icons/fa";
import { useLangStore } from "@/lib/languageStore";

export default function TelegramCTA() {
  const { lang, hydrated } = useLangStore();

  // Prevent hydration mismatch
  if (!hydrated) return null;

  const headline =
    lang === "es"
      ? "Recibe ofertas como esta al instante"
      : "Get deals like this instantly";

  const description =
    lang === "es"
      ? "Únete a nuestro canal de Telegram para alertas de ofertas en tiempo real y bajadas de precio."
      : "Join our Telegram channel for real-time deal alerts and price drops.";

  const buttonText =
    lang === "es"
      ? "Unirse a Telegram"
      : "Join Telegram Channel";

  return (
    <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-2 text-center">
      <div className="flex items-center justify-center gap-2 text-blue-700 font-semibold text-sm">
        <FaTelegramPlane className="text-sm" />
        <span>{headline}</span>
      </div>

      <p className="mt-1 text-sm text-slate-600">
        {description}
      </p>

      <a
        href="https://t.me/dealswindfall"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
      >
        {buttonText}
      </a>
    </div>
  );
}
