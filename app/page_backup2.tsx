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
//import TopCategories from "@/components/TopCategories";
import AboutPage from "@/components/static/AboutPage";
import PrivacyPage from "@/components/static/PrivacyPage";
import ContactPage from "@/components/static/ContactPage";

export default function Home() {
  const [selectedStore, setSelectedStore] = useState("Recent Deals");
  const [selectedDeal, setSelectedDeal] = useState(null);
     const [selectedCategory, setSelectedCategory] = useState("");
 const [isStoreListOpen, setIsStoreListOpen] = useState(false);
  const [isDealDetailOpen, setIsDealDetailOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

  const [activeItem, setActiveItem] = useState("allStores");
const goHome = () => {
  setSelectedStore("Recent Deals");
  setSelectedCategory("");
  setShowHotDeals(false);
  setSelectedDeal(null);
  setIsDealDetailOpen(false);
  setIsStoreListOpen(false);
  setActiveItem("allStores"); // highlight home icon
};

  
  // When a store is selected, open deals
  const handleSelectStore = (store: string) => {
    setSelectedStore(store);
    setIsStoreListOpen(false); // close store drawer on mobile
  };

  // When a deal is clicked, open detail view
  const handleSelectDeal = (deal: any) => {
    setSelectedDeal(deal);
    setIsDealDetailOpen(true);
  };

  // “Back” button inside DealDetail
  const handleBackToDeals = () => {
    setIsDealDetailOpen(false);
  };
  
  const [pageType, setPageType] = useState<"deals" | "about" | "privacy" | "contact">("deals");
const [showHotDeals, setShowHotDeals] = useState(false);

  
  return (
    <>
      {/* 📱 Mobile Layout */}
      <div className="flex flex-col md:hidden h-screen bg-gray-50">
      <MobileHeader
  onSearch={(q) => console.log("Search:", q)}
  onToggleStores={() => setIsStoreListOpen(!isStoreListOpen)}
  onOpenStores={() => {
    // ✅ if user is inside deal detail, this forces store list open
    setIsDealDetailOpen(false);
    setIsStoreListOpen(true);
  }}
  onGoHome={() => {
    setSelectedStore("Recent Deals");
    setSelectedDeal(null);
	 setSelectedCategory(""); 
    setIsStoreListOpen(false);
    setIsDealDetailOpen(false);
  }}
/>

<TopCategories
  onSelectCategory={(cat) => {
    setSelectedCategory(cat);
    setIsStoreListOpen(false);
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
                onSelectDeal={handleSelectDeal}
              />
            </div>
          )}
{/* Deal Detail */}

{isDealDetailOpen && ( <div className="absolute inset-0 z-30 bg-white overflow-y-auto custom-scroll animate-slide-in-right"> 
<button onClick={handleBackToDeals} className="m-3 px-4 py-2 bg-gray-200 rounded-md text-sm" > 
← Back </button> 
<DealDetail deal={selectedDeal} /> 
</div> )} 
          {/* Deal Detail / Static Pages */}
<div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100">
  {pageType === "deals" && <DealDetail deal={selectedDeal} />}
  {pageType === "about" && <AboutPage />}
  {pageType === "privacy" && <PrivacyPage />}
  {pageType === "contact" && <ContactPage />}
</div>
        </div>
      </div>
	  
	  
	  
	  
	  
	  
	  
	  {/* Header (fixed) */}
	   <div className="hidden md:flex flex-col h-screen overflow-hidden bg-gray-50">
      <div className="flex-shrink-0">
        <SearchBar />
       <TopCategories
  onSelectCategory={(cat) => {
    setSelectedCategory(cat);
    setActiveItem(""); // clear side nav highlight
  }}
  selectedCategory={selectedCategory}
/>

      </div>

      {/* Responsive Layout */}
      <div
        className="
          flex-1 grid min-h-0 overflow-hidden bg-white
          grid-cols-1
          md:grid-cols-[60px_220px_1fr]
          lg:grid-cols-[60px_220px_480px_1fr_160px]
          transition-all
        "
      >
        {/* SideNav (hidden on mobile) */}
        <div className="bg-white hidden md:block border-r border-gray-100">
		<SideNav
  onAllStores={() => {
    setSelectedStore("Recent Deals");
    setSelectedDeal(null);
    setShowHotDeals(false);
    setActiveItem("allStores");
  }}
  onHotDeals={() => {
    setShowHotDeals(true);
    setSelectedStore("");
    setActiveItem("hotDeals");
  }}
  onSelectPage={(page) => {
    setActiveItem(page);
    setStaticPage(page);
  }}
  activeItem={activeItem}
/>


<SideNav
  onAllStores={goHome}
  onHotDeals={() => {
    setShowHotDeals(true);
    setSelectedStore("Recent Deals");
    setSelectedCategory("");
    setActiveItem("allStores");
  }}
  onSelectPage={(page) => {
    setActiveItem(page);
    setStaticPage(page);
  }}
  activeItem={activeItem}
/>



		
          <SideNav />
        </div>

        {/* Store List */}
        <div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100">
          <StoreList
            selectedStore={selectedStore}
            onSelect={setSelectedStore}
          />
        </div>

        {/* Deals List */}
        <div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100">
          <DealsList
            selectedStore={selectedStore}
  selectedCategory={selectedCategory}
  showHotDeals={showHotDeals}
  onSelectDeal={setSelectedDeal}
			
          />
        </div>

        {/* Deal Detail — hidden on mobile, modal planned */}
        <div className="bg-white overflow-y-auto custom-scroll hidden md:block border-r border-gray-100">
          <DealDetail deal={selectedDeal} />
        </div>

        {/* Ad Pane — only visible on large screens */}
        <div className="bg-white overflow-y-auto custom-scroll hidden lg:block">
          <AdPane />
        </div>
      </div>

      {/* Footer (fixed) */}
      <div className="flex-shrink-0">
        <Footer />
      </div>
	  </div>
	 
    </>
  );
}
