export const FLYER_TEXT = {
  en: {
    fallbackTitle: "Hot Deal!",
    off: "OFF",
    website: "www.dealswindfall.com",
  },
  es: {
    fallbackTitle: "Oferta Imperdible",
    off: "DE DESCUENTO",
    website: "www.dealswindfall.com",
  },
} as const;

export type FlyerLang = keyof typeof FLYER_TEXT;
