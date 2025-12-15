"use client";
import { useLangStore } from "@/lib/languageStore";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import SearchBar from "@/components/SearchBar";
import TopCategories from "@/components/TopCategories";
import SideNav from "@/components/SideNav";
import StoreList from "@/components/StoreList";
import DealsList from "@/components/DealsList";
import DealDetail from "@/components/DealDetail";
import AdPane from "@/components/AdPane";
import Footer from "@/components/Footer";
import MobileHeader from "@/components/MobileHeader";
import AboutPage from "@/components/static/AboutPage";
import PrivacyPage from "@/components/static/PrivacyPage";
import ContactPage from "@/components/static/ContactPage";
import MobileBottomNav from "@/components/MobileBottomNav";
import useDebounce from "@/hooks/useDebounce";
//import { initScrollDepthTracker } from "@/lib/analytics/scrollDepth";
//import { initDealScrollPauseTracker } from "@/lib/analytics/dealScrollPause";



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ------------ STATE ------------
  const [selectedStore, setSelectedStore] = useState("Recent Deals");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedHoliday, setSelectedHoliday] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

  const [isStoreListOpen, setIsStoreListOpen] = useState(false);
  const [isClosingStoreList, setIsClosingStoreList] = useState(false);

  const [isDealDetailOpen, setIsDealDetailOpen] = useState(false);

  const [staticPage, setStaticPage] = useState<string | null>(null);
  const [isClosingStaticPage, setIsClosingStaticPage] = useState(false);

  const [showHotDeals, setShowHotDeals] = useState(false);
  const [activeItem, setActiveItem] = useState("allStores");

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 350);

  // Scroll restoration for DealsList
  const dealsListRef = useRef<HTMLDivElement | null>(null);
  const savedScroll = useRef(0);
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);

  // ------------ Sync with URL (/?deal=ID) ------------
  useEffect(() => {
    const dealParam = searchParams.get("deal");

    if (!dealParam) {
      setSelectedDeal(null);
      setIsDealDetailOpen(false);
      return;
    }

    const id = Number(dealParam);
    if (Number.isNaN(id)) return;

    const fetchDeal = async () => {
      const { data } = await supabase
        .from("deals")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (data) {
        setSelectedDeal(data);
        setIsDealDetailOpen(true);
      }
    };

    fetchDeal();
  }, [searchParams]);

  // ------------ Restore scroll for mobile ------------
  useEffect(() => {
    if (!shouldRestoreScroll) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (dealsListRef.current) {
          dealsListRef.current.scrollTop = savedScroll.current;
        }
        setShouldRestoreScroll(false);
      });
    });
  }, [shouldRestoreScroll]);

  // ------------ Handlers ------------
  const goHome = () => {
    router.push("/", { scroll: false });
    setSelectedStore("Recent Deals");
    setSelectedCategory("");
    setSelectedHoliday("");
    setShowHotDeals(false);
    setSelectedDeal(null);
    setIsDealDetailOpen(false);
    setStaticPage(null);
    setActiveItem("allStores");
  };

  const handleSelectStore = (store: string) => {
    setSelectedStore((prev) => (prev === store ? "Recent Deals" : store));
    setShowHotDeals(false);
    setStaticPage(null);
    setIsDealDetailOpen(false);
  //  setIsStoreListOpen(false);
	if (isStoreListOpen) closeStoreList();
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory((prev) => (prev === cat ? "" : cat));
    setShowHotDeals(false);
    setStaticPage(null);
    setIsDealDetailOpen(false);
  };

  const handleSelectHoliday = (slug: string) => {
    setSelectedHoliday((prev) => (prev === slug ? "" : slug));
    setShowHotDeals(false);
    setStaticPage(null);
    setIsDealDetailOpen(false);
	if (isStoreListOpen) closeStoreList();
  };

  const closeStoreList = () => {
    setIsClosingStoreList(true);
    setTimeout(() => {
      setIsStoreListOpen(false);
      setIsClosingStoreList(false);
    }, 300);
  };

  const openStaticPage = (page: string) => {
    setStaticPage(page);
    setIsDealDetailOpen(false);
    closeStoreList();
  };

  const closeStaticPage = () => {
    setIsClosingStaticPage(true);
    setTimeout(() => {
      setStaticPage(null);
      setIsClosingStaticPage(false);
    }, 300);
  };

  const handleSearch = (q: string) => {
    router.push("/", { scroll: false });
    setSearchQuery(q);
    setSelectedStore("Recent Deals");
    setSelectedCategory("");
    setSelectedHoliday("");
    setShowHotDeals(false);
    setIsDealDetailOpen(false);
    setStaticPage(null);
  };

  const handleSelectDeal = (deal: any) => {
    if (dealsListRef.current) {
      savedScroll.current = dealsListRef.current.scrollTop;
    }

    setSelectedDeal(deal);
    setIsDealDetailOpen(true);
    router.push(`/?deal=${deal.id}`, { scroll: false });
  };

  const handleBackToDeals = () => {
    setIsDealDetailOpen(false);
    setSelectedDeal(null);
    router.push("/", { scroll: false });
    setShouldRestoreScroll(true);
  };
  
  
  const { lang, hydrated, hydrate } = useLangStore();

useEffect(() => {
  hydrate();
}, []);


// ------------ Analytics (Scroll + Intent) ------------
/*useEffect(() => {
  if (typeof window === "undefined") return;

  let visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("visitor_id", visitorId);
  }

  const cleanupScroll = initScrollDepthTracker(visitorId);
  const cleanupIntent = initDealScrollPauseTracker(visitorId);

  return () => {
    cleanupScroll();
    cleanupIntent();
  };
}, []);
*/

if (!hydrated) return null;

  // ------------ RENDER ------------
  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-50">
      {/* ========== MOBILE VIEW ========== */}
      <div className="md:hidden flex flex-col h-screen relative z-10">

        <MobileHeader
          onSearch={handleSearch}
          onToggleStores={() => {
            if (isDealDetailOpen) setIsDealDetailOpen(false);
            if (isStoreListOpen) closeStoreList();
            else setIsStoreListOpen(true);
          }}
          onGoHome={goHome}
          onOpenStores={() => setIsStoreListOpen(true)}
        />

        <TopCategories
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        <div className="flex-1 relative min-h-0">

          {/* Store Drawer */}
          {isStoreListOpen && (
            <div
              className={`absolute inset-0 bg-white overflow-y-auto custom-scroll z-20 ${
                isClosingStoreList
                  ? "animate-slide-out-left"
                  : "animate-slide-in-left"
              }`}
            >
              <StoreList
                selectedStore={selectedStore}
                onSelect={handleSelectStore}
                selectedHoliday={selectedHoliday}
                onSelectHoliday={handleSelectHoliday}
              />
            </div>
          )}

          {/* Static Pages */}
          {staticPage && (
            <div
              className={`absolute inset-0 bg-white overflow-y-auto custom-scroll z-30 ${
                isClosingStaticPage
                  ? "animate-slide-out-right"
                  : "animate-slide-in-right"
              }`}
            >
              {staticPage === "about" && <AboutPage />}
              {staticPage === "privacy" && <PrivacyPage />}
              {staticPage === "contact" && <ContactPage />}
            </div>
          )}

          {/* Deals List */}
          {!isDealDetailOpen && !isStoreListOpen && !staticPage && (
            <div className="absolute inset-0 bg-white">
              <DealsList
                selectedStore={selectedStore}
                selectedCategory={selectedCategory}
                selectedHoliday={selectedHoliday}
                searchQuery={debouncedSearch}
                showHotDeals={showHotDeals}
                onSelectDeal={handleSelectDeal}
                scrollRef={dealsListRef}
              />
            </div>
          )}

          {/* Deal Detail */}
          {isDealDetailOpen && (
            <div className="absolute inset-0 bg-white overflow-y-auto custom-scroll z-30 animate-slide-in-right">
              <button
                onClick={handleBackToDeals}
                className="sticky top-0 bg-white/90 backdrop-blur px-4 py-2 text-gray-700 z-40 border-b border-gray-200"
              >
                ← Back
              </button>

              <DealDetail deal={selectedDeal} />
            </div>
          )}
        </div>

        <MobileBottomNav
          active={staticPage || (isDealDetailOpen ? "details" : "home")}
          onHome={goHome}
          onHotDeals={() => {
            setShowHotDeals(true);
            setStaticPage(null);
            setSelectedDeal(null);
            setSelectedStore("");
            setSelectedCategory("");
            setActiveItem("hotDeals");
          }}
          onAbout={() =>
            staticPage === "about" ? closeStaticPage() : openStaticPage("about")
          }
          onPrivacy={() =>
            staticPage === "privacy"
              ? closeStaticPage()
              : openStaticPage("privacy")
          }
          onContact={() =>
            staticPage === "contact"
              ? closeStaticPage()
              : openStaticPage("contact")
          }
        />
      </div>

      {/* ========== DESKTOP VIEW ========== */}
      <div className="hidden md:flex flex-col h-screen overflow-hidden">

        <SearchBar onSearch={handleSearch} onHome={goHome} />

        <TopCategories
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        <div className="flex-1 grid min-h-0 bg-white grid-cols-1 md:grid-cols-[60px_220px_1fr] lg:grid-cols-[60px_220px_480px_1fr_160px]">

          {/* Sidebar */}
          <SideNav
            activeItem={activeItem}
            onAllStores={goHome}
            onHotDeals={() => {
              setShowHotDeals(true);
              setSelectedStore("");
              setSelectedCategory("");
              setActiveItem("hotDeals");
            }}
            onSelectPage={(page) => {
              setActiveItem(page);
              openStaticPage(page);
            }}
          />

          {/* Store List */}
          <div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100 min-h-0">
            <StoreList
              selectedStore={selectedStore}
              onSelect={handleSelectStore}
              selectedHoliday={selectedHoliday}
              onSelectHoliday={handleSelectHoliday}
            />
          </div>

          {/* Deals */}
          <div className="bg-white border-r border-gray-100 min-h-0 flex flex-col">
            {staticPage === "about" && <AboutPage />}
            {staticPage === "privacy" && <PrivacyPage />}
            {staticPage === "contact" && <ContactPage />}

            {!staticPage && (
              <DealsList
                selectedStore={selectedStore}
                selectedCategory={selectedCategory}
                selectedHoliday={selectedHoliday}
                searchQuery={debouncedSearch}
                showHotDeals={showHotDeals}
                onSelectDeal={handleSelectDeal}
                scrollRef={dealsListRef}
              />
            )}
          </div>

          {/* Deal Detail */}
          <div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100 min-h-0">
            <DealDetail deal={selectedDeal} />
          </div>

          {/* Right-Side Ads */}
          <div className="bg-white overflow-y-auto custom-scroll hidden lg:block">
            <AdPane />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
