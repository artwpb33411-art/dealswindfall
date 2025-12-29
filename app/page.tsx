import { Suspense } from "react";
import HomeClient from "./home-client";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // Normalize helper
  const getParam = (key: string): string | null => {
    const value = params[key];
    if (!value) return null;
    return Array.isArray(value) ? value[0] : value;
  };

  const store = getParam("store");
  const category = getParam("category");
  const holiday = getParam("holiday");

  // 🎯 Priority order: Holiday → Store → Category → Default
  if (holiday) {
    const label = holiday.replace(/-/g, " ");
    return {
      title: `${label} Deals & Discounts | DealsWindfall`,
      description: `Browse the best ${label} deals and limited-time discounts updated daily on DealsWindfall.`,
    };
  }

  if (store) {
    return {
      title: `${store} Deals & Discounts Today | DealsWindfall`,
      description: `Save money with the latest ${store} deals, coupons, and discounts updated daily on DealsWindfall.`,
    };
  }

  if (category) {
    return {
      title: `${category} Deals & Coupons | DealsWindfall`,
      description: `Find the best ${category} deals, offers, and discounts available today on DealsWindfall.`,
    };
  }

  // ✅ Default homepage
  return {
    title: "Best Online Deals & Discounts Today | DealsWindfall",
    description:
      "Discover the best online deals, discounts, and coupons updated daily. Save money on electronics, home, fashion, and more at DealsWindfall.",
  };
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <HomeClient />
    </Suspense>
  );
}
