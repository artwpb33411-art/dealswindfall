"use client";
import { useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { useLangStore } from "@/lib/languageStore"; // ⭐ ADD THIS
import { useEffect } from "react";


export default function MobileHeader({
  onSearch,
  onToggleStores,
  onGoHome,
  onOpenStores,
}: {
  onSearch: (q: string) => void;
  onToggleStores: () => void;
  onGoHome: () => void;
  onOpenStores: () => void;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");

  const { lang, setLang, hydrated, hydrate } = useLangStore();
const [searchValue, setSearchValue] = useState("");
useEffect(() => {
  hydrate();
}, []);

if (!hydrated) return null;

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 h-14 px-4 shadow-sm md:hidden">
      {/* ── Search mode ── */}
      {isSearching ? (
        <div className="flex items-center w-full gap-2">
          <ArrowLeft
            className="text-gray-600 w-5 h-5 cursor-pointer"
            onClick={() => setIsSearching(false)}
          />

          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              onSearch(val);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearch?.(searchValue);
              }
            }}
            placeholder="Search deals..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => onSearch?.(searchValue)}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Go
          </button>
        </div>
      ) : (
        <>
          {/* Stores Button */}
          <button
            onClick={() => {
              if (onToggleStores) onToggleStores();
              if (onOpenStores) onOpenStores();
            }}
            className="flex items-center gap-1 text-gray-800 font-medium text-base px-3 py-1 rounded-md border border-transparent hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h18M3 10h18M3 16h18"
              />
            </svg>
            <span>Stores</span>
          </button>

          {/* Logo */}
          <img
  src="/dealswindfall-logoA.png"
  alt="DealsWindfall"
  onClick={() => { window.location.href = "/" }}
  className="h-9 max-h-9 object-contain translate-y-[1px] cursor-pointer active:scale-[0.97] transition"
/>


          {/* Right section with Search + Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearching(true)}
              className="text-gray-600 hover:text-blue-600"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* ⭐ Language Switcher ⭐ */}
           {/* ⭐ Language Switcher with Flags ⭐ */}
<div className="flex items-center gap-2 border rounded-md px-2 py-1">

  {/* English Flag */}
  <img
    src="/flags/us.png"
    alt="English"
    onClick={() => setLang("en")}
    className={`w-6 h-4 cursor-pointer ${
      lang === "en" ? "ring-2 ring-blue-500 rounded-sm" : ""
    }`}
  />

  {/* Spanish Flag */}
  <img
    src="/flags/es.png"
    alt="Español"
    onClick={() => setLang("es")}
    className={`w-6 h-4 cursor-pointer ${
      lang === "es" ? "ring-2 ring-blue-500 rounded-sm" : ""
    }`}
  />

</div>

          </div>
        </>
      )}
    </header>
  );
}
