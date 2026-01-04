"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "dw_saved_deals";

export type SavedDeal = {
  id: number;
  title?: string;
  image_link?: string | null;
  current_price?: number | null;
  old_price?: number | null;
  store_name?: string | null;
  slug?: string;
};

type SavedDealsContextType = {
  savedDeals: Record<number, SavedDeal>;
  isSaved: (id: number) => boolean;
  toggleSave: (deal: SavedDeal) => void;
};

const SavedDealsContext = createContext<SavedDealsContextType | null>(null);

export function SavedDealsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savedDeals, setSavedDeals] =
    useState<Record<number, SavedDeal>>({});

  // Load once
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSavedDeals(JSON.parse(raw));
      } catch {
        setSavedDeals({});
      }
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(savedDeals)
    );
  }, [savedDeals]);


  useEffect(() => {
  console.log(
    "%c[SavedDealsProvider MOUNTED]",
    "color: green; font-weight: bold",
    Object.keys(savedDeals)
  );

  return () => {
    console.log(
      "%c[SavedDealsProvider UNMOUNTED]",
      "color: red; font-weight: bold"
    );
  };
}, []);

  const isSaved = (id: number) => !!savedDeals[id];

  const toggleSave = (deal: SavedDeal) => {
    setSavedDeals((prev) => {
         console.log("[toggleSave] BEFORE:", Object.keys(prev));
      const copy = { ...prev };

      if (copy[deal.id]) {
        delete copy[deal.id];
      } else {
        copy[deal.id] = deal;
      }
 console.log("[toggleSave] AFTER:", Object.keys(copy));
      return copy;
    });
  };

  return (
    <SavedDealsContext.Provider
      value={{ savedDeals, isSaved, toggleSave }}
    >
      {children}
    </SavedDealsContext.Provider>
  );
}

export function useSavedDeals() {
  const ctx = useContext(SavedDealsContext);
  if (!ctx) {
    throw new Error(
      "useSavedDeals must be used within SavedDealsProvider"
    );
  }
  return ctx;
}
