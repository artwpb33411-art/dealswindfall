export const SOCIAL_TEXT = {
  en: {
    dealAlert: "🔥 Deal Alert",
    limitedTime: "⏰ Limited-time deal — prices may change fast.",
    moreDeals: "🌐 More deals at DealsWindfall.com",
    linkInComments: "👇 Deal link in comments",
    grabNow: "👇 Grab it now:",
    viewDeal: "👉 View deal:",
    off: "OFF", // ✅ ADD
  },

  es: {
    dealAlert: "🔥 Oferta Imperdible",
    limitedTime: "⏰ Oferta por tiempo limitado — el precio puede cambiar.",
    moreDeals: "🌐 Más ofertas en DealsWindfall.com",
    linkInComments: "👇 Enlace en los comentarios",
    grabNow: "👇 Consíguelo aquí:",
    viewDeal: "👉 Ver oferta:",
    off: "DE DESCUENTO", // ✅ ADD
  },
} as const;


export type SocialLang = keyof typeof SOCIAL_TEXT;
