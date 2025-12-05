"use client";

import { useLangStore } from "@/lib/languageStore";
import { useEffect } from "react";

export default function TopCategories({
  onSelectCategory,
  selectedCategory,
}: {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}) {
  const { lang, hydrated, hydrate } = useLangStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (!hydrated) return null;

  // EN → ES translations
  const categoryMap: Record<string, string> = {
    "Electronics": "Electrónica",
    "Clothing & Apparel": "Ropa y Vestimenta",
    "Kids & Toys": "Niños y Juguetes",
    "Home & Kitchen": "Hogar y Cocina",
    "Beauty & Personal Care": "Belleza y Cuidado Personal",
    "Grocery & Food": "Comestibles y Alimentos",
    "Appliances": "Electrodomésticos",
    "Health & Wellness": "Salud y Bienestar",
    "Pet Supplies": "Artículos para Mascotas",
  };

  const categories = Object.keys(categoryMap);

  return (
    <header className="flex items-center justify-center bg-white border-b border-gray-200 shadow-sm h-14 px-4">
      <nav className="flex items-center gap-5 overflow-x-auto no-scrollbar whitespace-nowrap">

        {categories.map((category) => {
          const translated = lang === "en" ? category : categoryMap[category];

          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-200 font-medium ${
                selectedCategory === category
                  ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              {translated}
            </button>
          );
        })}

      </nav>
    </header>
  );
}
