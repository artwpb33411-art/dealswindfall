"use client";

import { useState, useEffect } from "react";

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

/* ----------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------- */
export default function Home() {
  /* --------------------------------------------------
     STATE MANAGEMENT
  -------------------------------------------------- */
  const [selectedStore, setSelectedStore] = useState("Recent Deals");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedHoliday, setSelectedHoliday] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);

  const [isStoreListOpen, setIsStoreListOpen] = useState(false);
  const [isClosingStoreList, setIsClosingStoreList] = useState(false);

  const [isDealDetailOpen, setIsDealDetailOpen] = useState(false);

  const [staticPage, setStaticPage] = useState<string | null>(null);
  const [isClosingStaticPage, setIsClosingStaticPage] = useState(false);

  const [showHotDeals, setShowHotDeals] = useState(false);
  const [activeItem, setActiveItem] = useState("allStores");

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 350);

  const [holidayEvents, setHolidayEvents] = useState([]);

  /* --------------------------------------------------
     FETCH HOLIDAY EVENTS
  -------------------------------------------------- */
  useEffect(() => {
    fetch("/api/holiday-events?active=true")
      .then((r) => r.json())
      .then((data) => setHolidayEvents(data));
  }, []);

  /* --------------------------------------------------
     RESET EVERYTHING (HOME)
  -------------------------------------------------- */
  const goHome = () => {
    setSelectedStore("Recent Deals");
    setSelectedCategory("");
    setSelectedHoliday("");
    setShowHotDeals(false);
    setSelectedDeal(null);
    setIsDealDetailOpen(false);
    setSearchQuery("");
    setActiveItem("allStores");
    setStaticPage(null);
    closeStoreList();
  };

  /* --------------------------------------------------
     STORE FILTER (independent toggle)
  -------------------------------------------------- */
  // 🏪 STORE FILTER (independent toggle)
const handleSelectStore = (store: string) => {
  setSelectedStore((prev) => (prev === store ? "Recent Deals" : store));

  // Do NOT touch category or holiday – they stay combined
  setShowHotDeals(false);
  setStaticPage(null);
  setIsDealDetailOpen(false);
  closeStoreList();
};


  /* --------------------------------------------------
     CATEGORY FILTER (independent toggle)
  -------------------------------------------------- */
  // 🎨 CATEGORY FILTER (independent toggle)
const handleSelectCategory = (cat: string) => {
  setSelectedCategory((prev) => (prev === cat ? "" : cat));

  // Do NOT reset store or holiday
  setShowHotDeals(false);
  setStaticPage(null);
  setIsDealDetailOpen(false);
  closeStoreList();
};

  /* --------------------------------------------------
     HOLIDAY FILTER (independent toggle)
  -------------------------------------------------- */
// 🎁 HOLIDAY FILTER (independent toggle)
const handleSelectHoliday = (slug: string) => {
  setSelectedHoliday((prev) => (prev === slug ? "" : slug));

  // Do NOT reset store or category
  setShowHotDeals(false);
  setStaticPage(null);
  setIsDealDetailOpen(false);
  closeStoreList();
};


  /* --------------------------------------------------
     STORE DRAWER ANIMATION
  -------------------------------------------------- */
  const closeStoreList = () => {
    setIsClosingStoreList(true);
    setTimeout(() => {
      setIsStoreListOpen(false);
      setIsClosingStoreList(false);
    }, 300);
  };

  /* --------------------------------------------------
     STATIC PAGE ANIMATION
  -------------------------------------------------- */
  const openStaticPage = (page: string) => {
    setIsClosingStaticPage(false);
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

  /* --------------------------------------------------
     SEARCH HANDLER
  -------------------------------------------------- */
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setSelectedStore("Recent Deals");
    setSelectedCategory("");
    setSelectedHoliday("");
    setShowHotDeals(false);
    setIsDealDetailOpen(false);
    setStaticPage(null);
  };

  /* --------------------------------------------------
     DEAL DETAILS
  -------------------------------------------------- */
  const handleSelectDeal = (deal: any) => {
    setSelectedDeal(deal);
    setIsDealDetailOpen(true);
  };

  const handleBackToDeals = () => {
    setIsDealDetailOpen(false);
  };

  /* --------------------------------------------------
     RENDER
  -------------------------------------------------- */
  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-50">

      {/* ============= 📱 MOBILE LAYOUT ============= */}
      <div className="md:hidden relative z-10 flex flex-col h-screen">
        <MobileHeader
          onSearch={handleSearch}
          onToggleStores={() => {
  // Close deal detail if open
  if (isDealDetailOpen) setIsDealDetailOpen(false);

  // Toggle store list
  if (isStoreListOpen) closeStoreList();
  else setIsStoreListOpen(true);
}}

          onGoHome={goHome}
          onOpenStores={() => setIsStoreListOpen(true)}
        />

        <TopCategories
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
        />

        <div className="flex-1 relative overflow-hidden">
          {/* Store Drawer */}
          {isStoreListOpen && (
            <div
              className={`
                absolute inset-0 z-20 bg-white overflow-y-auto custom-scroll
                ${isClosingStoreList ? "animate-slide-out-left" : "animate-slide-in-left"}
              `}
            >
              <StoreList
                selectedStore={selectedStore}
                onSelect={handleSelectStore}
                selectedHoliday={selectedHoliday}
                onSelectHoliday={handleSelectHoliday}
                holidayEvents={holidayEvents}
              />
            </div>
          )}

          {/* Static Page (full screen slide) */}
          {staticPage && (
            <div
              className={`
                absolute inset-0 bg-white z-30 overflow-y-auto custom-scroll
                ${isClosingStaticPage ? "animate-slide-out-right" : "animate-slide-in-right"}
              `}
            >
              {staticPage === "about" && <AboutPage />}
              {staticPage === "privacy" && <PrivacyPage />}
              {staticPage === "contact" && <ContactPage />}
            </div>
          )}

          {/* Deals List */}
          {!isDealDetailOpen && !isStoreListOpen && !staticPage && (
            <div className="absolute inset-0 z-10 bg-white overflow-y-auto custom-scroll animate-fade-in">
              <DealsList
                selectedStore={selectedStore}
                selectedCategory={selectedCategory}
                selectedHoliday={selectedHoliday}
                searchQuery={debouncedSearch}
                showHotDeals={showHotDeals}
                onSelectDeal={(deal) => {
    setSelectedDeal(deal);
    setIsDealDetailOpen(true);
  }}
              />
            </div>
          )}

          {/* Deal Detail */}
          {isDealDetailOpen && (
            <div className="absolute inset-0 z-30 bg-white overflow-y-auto custom-scroll animate-slide-in-right">
              <button
                onClick={handleBackToDeals}
                className="m-3 px-4 py-2 bg-gray-200 rounded-md text-sm"
              >
                ← Back
              </button>
              <DealDetail deal={selectedDeal} />
            </div>
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav
          active={staticPage || (isDealDetailOpen ? "details" : "home")}
          onHome={goHome}
          onHotDeals={() => {
            setStaticPage(null);
            setShowHotDeals(true);
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

      {/* ============= 💻 DESKTOP LAYOUT ============= */}
      <div className="hidden md:flex flex-col h-screen overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="flex-shrink-0">
          <SearchBar onSearch={handleSearch} onHome={goHome} />

          <TopCategories
            onSelectCategory={handleSelectCategory}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Content Grid */}
        <div className="flex-1 grid min-h-0 bg-white grid-cols-1 md:grid-cols-[60px_220px_1fr] lg:grid-cols-[60px_220px_480px_1fr_160px]">
          
          {/* Side Navigation */}
          <SideNav
            onAllStores={goHome}
            onHotDeals={() => {
              setStaticPage(null);
              setShowHotDeals(true);
              setSelectedStore("");
              setSelectedCategory("");
              setActiveItem("hotDeals");
            }}
            onSelectPage={(page) => {
              setActiveItem(page);
              setStaticPage(page);
            }}
            activeItem={activeItem}
          />

          {/* Store List */}
		  <div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100 min-h-0 flex flex-col">


          <StoreList
            selectedStore={selectedStore}
            onSelect={handleSelectStore}
            selectedHoliday={selectedHoliday}
            onSelectHoliday={handleSelectHoliday}
            holidayEvents={holidayEvents}
          />
</div>
          {/* Middle Pane */}
<div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100 min-h-0 flex flex-col">
 
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
                onSelectDeal={(deal) => {
    setSelectedDeal(deal);
    setIsDealDetailOpen(true);
  }}
              />
            )}
          </div>

          {/* Deal Detail Pane */}
<div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100 min-h-0 flex flex-col">
  <DealDetail deal={selectedDeal} />
</div>

  
          {/* Right Ad Pane */}
          <div className="bg-white overflow-y-auto custom-scroll hidden lg:block">
            <AdPane />
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
