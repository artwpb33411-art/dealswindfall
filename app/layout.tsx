import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import TrackPageView from "./TrackPageView";
import LangHydrator from "./LangHydrator";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SavedDealsProvider } from "@/lib/SavedDealsContext";

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ⭐ Replace this with your real GA4 Measurement ID
const GA_MEASUREMENT_ID = "G-W9CMFMYZW2";

// ⭐ Replace this with your real Hotjar ID
const HOTJAR_ID = 6577402;

export const metadata: Metadata = {
  title: "DealsWindfall — Your Daily Windfall of Savings",
  description: "The best daily deals from all major online stores.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* ---------------- GOOGLE ANALYTICS (GA4) ---------------- */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        {/* ---------------- HOTJAR HEATMAPS & RECORDINGS ---------------- */}
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hhjq||[]).push(arguments)};
              h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      </head>

     <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  <TrackPageView /> 

  <SavedDealsProvider>
          <LangHydrator>
            {children}
          </LangHydrator>
        </SavedDealsProvider>


  <Analytics />
  <SpeedInsights />
</body>

    </html>
  );
}
