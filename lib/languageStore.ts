"use client";

import { create } from "zustand";

type LangState = {
  lang: "en" | "es";
  hydrated: boolean;
  setLang: (lang: "en" | "es") => void;
  hydrate: () => void;
};

export const useLangStore = create<LangState>((set) => ({
  lang: "en",
  hydrated: false,

  setLang: (lang) => set({ lang }),

  hydrate: () => set({ hydrated: true }),
}));
