"use client";
import { useState } from "react";
import { Search, ArrowLeft, X } from "lucide-react"; // icons from lucide-react

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

  const handleSearch = () => {
    onSearch(query);
    setIsSearching(false);
  };

  
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
        onSearch(val);           // 🔁 live search while typing
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {  // ⌨️ hardware/software “Go” key
          e.preventDefault();
          handleSearch();
        }
      }}
      placeholder="Search deals..."
      className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      onClick={handleSearch}      // 🟦 blue Go button still works
      className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
    >
      Go
    </button>
  </div>
) : (
  // normal mode…


        // ── Normal mode ──
        <>
          {/* Stores Button */}
          <button
  onClick={() => {
    if (onToggleStores) onToggleStores(); // still toggles for normal cases
    if (onOpenStores) onOpenStores();     // new prop for forced open from DealDetail
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
  onClick={() => {
    if (onGoHome) onGoHome(); // ✅ trigger home reset
  }}
  className="h-9 max-h-9 object-contain translate-y-[1px] cursor-pointer active:scale-[0.97] transition"
/>

          {/* Search Button */}
          <button
            onClick={() => setIsSearching(true)}
            className="text-gray-600 hover:text-blue-600"
          >
            <Search className="w-5 h-5" />
          </button>
        </>
      )}
    </header>
  );
}