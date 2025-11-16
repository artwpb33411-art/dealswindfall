"use client";
import { useState } from "react";
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


export default function Home() {
  const [selectedStore, setSelectedStore] = useState("Recent Deals");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isStoreListOpen, setIsStoreListOpen] = useState(false);
  const [isDealDetailOpen, setIsDealDetailOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("allStores");
  const [showHotDeals, setShowHotDeals] = useState(false);
 const [staticPage, setStaticPage] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("allStores");





  // 🏠 Reset all filters and return home
  const goHome = () => {
    setSelectedStore("Recent Deals");
    setSelectedCategory("");
    setShowHotDeals(false);
    setSelectedDeal(null);
    setIsDealDetailOpen(false);
    setIsStoreListOpen(false);
    setStaticPage("");
    setActiveItem("allStores");
  };

  // 🏪 Store selection
  const handleSelectStore = (store: string) => {
    setSelectedStore(store);
    setShowHotDeals(false);
    setIsStoreListOpen(false);
    setIsDealDetailOpen(false);
    setActiveItem("");
  };

  // 💥 Deal selection (opens deal detail)
  const handleSelectDeal = (deal: any) => {
    setSelectedDeal(deal);
    setIsDealDetailOpen(true);
  };

  // 🔙 Back from detail to deals list
  const handleBackToDeals = () => {
    setIsDealDetailOpen(false);
  };

	const handleAllStores = () => {
  setActiveNav("allStores");
  setStaticPage(null);
  setShowHotDeals(false);
  setSelectedStore("Recent Deals");
  setSelectedCategory("");
  setSelectedDeal(null);
  setIsDealDetailOpen(false);
};

const handleHotDeals = () => {
  setActiveNav("hotDeals");
  setStaticPage(null);
  setShowHotDeals(true);
  setSelectedDeal(null);
  setIsDealDetailOpen(false);
};

const handleSelectPage = (page: string) => {
  setActiveNav(page);
  setStaticPage(page);
  setShowHotDeals(false);
  setSelectedDeal(null);
  setIsDealDetailOpen(false);
};







  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-50">
      {/* 📱 MOBILE LAYOUT */}
      <div className="md:hidden relative z-10 flex flex-col h-screen">
        <MobileHeader
          onSearch={(q) => console.log("Search:", q)}
          onToggleStores={() => setIsStoreListOpen(!isStoreListOpen)}
          onGoHome={goHome}
        />

        <TopCategories
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setIsStoreListOpen(false);
            setIsDealDetailOpen(false);
            setShowHotDeals(false);
            setActiveItem("");
          }}
          selectedCategory={selectedCategory}
        />

        <div className="flex-1 relative overflow-hidden">
          {/* Store List Drawer */}
          {isStoreListOpen && (
            <div className="absolute inset-0 z-20 bg-white overflow-y-auto custom-scroll animate-slide-in-left">
              <StoreList
                selectedStore={selectedStore}
                onSelect={handleSelectStore}
              />
            </div>
          )}

          {/* Deals List */}
          {!isDealDetailOpen && !isStoreListOpen && (
            <div className="absolute inset-0 z-10 bg-white overflow-y-auto custom-scroll animate-fade-in">
              <DealsList
                selectedStore={selectedStore}
                selectedCategory={selectedCategory}
                showHotDeals={showHotDeals}
                onSelectDeal={handleSelectDeal}
              />
            </div>
          )}

          {/* Deal Detail */}
          {isDealDetailOpen && (
            <div className="absolute inset-0 z-30 bg-white overflow-y-auto custom-scroll animate-slide-in-right min-h-full">
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
      </div>

      {/* 💻 DESKTOP LAYOUT */}
      <div className="hidden md:flex relative z-0 flex-col h-screen overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="flex-shrink-0">
          <SearchBar />
          <TopCategories
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setShowHotDeals(false);
              setActiveItem("");
            }}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Content Grid */}
        <div
          className="
            flex-1 grid min-h-0 overflow-hidden bg-white
            grid-cols-1
            md:grid-cols-[60px_220px_1fr]
            lg:grid-cols-[60px_220px_480px_1fr_160px]
            transition-all
          "
        >
          {/* Side Navigation */}
          <div className="bg-white border-r border-gray-100">
            <SideNav
              onAllStores={goHome}
              onHotDeals={() => {
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
          </div>

          {/* Store List */}
          <div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100">
            <StoreList
              selectedStore={selectedStore}
              onSelect={handleSelectStore}
            />
          </div>

          {/* Deals List */}
          <div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100">
            <DealsList
              selectedStore={selectedStore}
              selectedCategory={selectedCategory}
              showHotDeals={showHotDeals}
              onSelectDeal={handleSelectDeal}
            />
          </div>
{/* Deal Detail — hidden on mobile, modal planned */}
<div className="bg-white overflow-y-auto custom-scroll hidden md:block border-r border-gray-100">
  {staticPage === "about" && <AboutPage />}
  {staticPage === "privacy" && <PrivacyPage />}
  {staticPage === "contact" && <ContactPage />}
  {!staticPage && <DealDetail deal={selectedDeal} />}
</div>

        

          {/* Ad Pane */}
          <div className="bg-white overflow-y-auto custom-scroll hidden lg:block">
            <AdPane />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0">
          <Footer />
        </div>
      </div>
    </main>
  );
}
