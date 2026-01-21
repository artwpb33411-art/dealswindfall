export const SOCIAL_TEXT = {
  en: {
    dealAlert: "🔥 Deal Alert",
    limitedTime: "⏰ Price verified at time of posting.",
    moreDeals: "🌐 More verified deals at https://www.dealswindfall.com",
    linkInComments: "👇 Deal link in comments",
    grabNow: "👇 View the deal here:",
    viewDeal: "👉 View deal:",
    off: "OFF",
  },

  es: {
    dealAlert: "🔥 Oferta Destacada",
    limitedTime: "⏰ Precio verificado al momento de publicar.",
    moreDeals: "🌐 Más ofertas verificadas en https://www.dealswindfall.com",
    linkInComments: "👇 Enlace en los comentarios",
    grabNow: "👇 Ver la oferta aquí:",
    viewDeal: "👉 Ver oferta:",
    off: "DE DESCUENTO",
  },
} as const;

export type SocialLang = keyof typeof SOCIAL_TEXT;
