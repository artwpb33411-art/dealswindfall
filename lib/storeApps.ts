type StoreAppConfig = {
  label: string;
  getDeepLink: (url: string) => string;
};

export const STORE_APP_CONFIG: Record<string, StoreAppConfig> = {
  Amazon: {
    label: "Open in Amazon App (Recommended)",
    getDeepLink: (url) => {
      // fallback: convert product URL to amazon://
      return url.replace(
        /^https?:\/\/(www\.)?amazon\.com/,
        "amazon://"
      );
    },
  },

  Walmart: {
    label: "Open in Walmart App",
    getDeepLink: (url) => {
      return `walmart://deeplink?url=${encodeURIComponent(url)}`;
    },
  },

  eBay: {
    label: "Open in eBay App",
    getDeepLink: (url) => {
      return `ebay://launch?url=${encodeURIComponent(url)}`;
    },
  },
};
