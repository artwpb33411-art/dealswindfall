

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
import Disclaimer from "@/components/Disclaimer";

export default function Home() {
  const [selectedStore, setSelectedStore] = useState("Recent Deals");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isStoreListOpen, setIsStoreListOpen] = useState(false);
  const [isDealDetailOpen, setIsDealDetailOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("allStores");
  const [showHotDeals, setShowHotDeals] = useState(false);
 //const [staticPage, setStaticPage] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("allStores");
//const [staticPage, setStaticPage] = useState(null); 

//const [staticPage, setStaticPage] = useState<null | "about" | "privacy" | "contact">(null);

//const [showHotDeals, setHotDeals] = useState(false);
const [staticPage, setStaticPage] = useState<string | null>(null);
const [isClosingStaticPage, setIsClosingStaticPage] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
//const [searchQuery, setSearchQuery] = useState("");
const debouncedSearch = useDebounce(searchQuery, 350);
const [selectedHoliday, setSelectedHoliday] = useState<string>("");
const [isClosingStoreList, setIsClosingStoreList] = useState(false);





  // 🏠 Reset all filters and return home
  const goHome = () => {
    setSelectedStore("Recent Deals");
    setSelectedCategory("");
    setShowHotDeals(false);
    setSelectedDeal(null);
    setIsDealDetailOpen(false);
    closeStoreList();
    setStaticPage("");
    setActiveItem("allStores");
	//setStaticPage(null);
//  setSelectedStore("Recent Deals");
//  setSelectedDeal(null);
 // setIsDealDetailOpen(false);
 // setHotDeals(false);
 // setSelectedCategory("");
  setSearchQuery("");
  setSelectedHoliday("");    
	
	
  };

  // 🏪 Store selection
  const handleSelectStore = (store: string) => {
     if (selectedStore === store) {
    setSelectedStore("Recent Deals");  // Clear filter
    setSelectedCategory("");
    setSelectedHoliday("");
    closeStoreList();
    return;
  }

  // Otherwise normal selection
  setSelectedStore(store);
  setSelectedCategory("");
  setSelectedHoliday("");
  setShowHotDeals(false);
  closeStoreList();
  setIsDealDetailOpen(false);
  setActiveItem("");
  setStaticPage(null);
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

const closeStoreList = () => {
  setIsClosingStoreList(true);

  setTimeout(() => {
   setIsStoreListOpen(false);   // ✔ properly closes
    setIsClosingStoreList(false);
  }, 300); // matches animation duration
};

const handleSelectHoliday = (slug: string) => {
  // toggle behavior
  if (selectedHoliday === slug) {
    // clicking same event again → clear filter
    setSelectedHoliday("");
    setSelectedStore("Recent Deals");
  } else {
    // new event selected
    setSelectedHoliday(slug);
    setSelectedStore(""); // or keep Recent Deals
  }

  // always show the deals pane
  setStaticPage(null);
  setIsDealDetailOpen(false);

  // close drawer on mobile
  closeStoreList();
};


const handleSelectPage = (page) => {
  setStaticPage(page);       // show About/Privacy/Contact in middle pane
  setSelectedDeal(null);     // clear deal detail
};


const openStaticPage = (page: string) => {
  setIsClosingStaticPage(false);
  setStaticPage(page);
  setIsDealDetailOpen(false);
  closeStoreList();
};


const closeStaticPage = () => {
  if (!staticPage) return;

  setIsClosingStaticPage(true);

  // Wait for animation, then hide
  setTimeout(() => {
    setStaticPage(null);
    setIsClosingStaticPage(false);
  }, 300); // match CSS animation duration
};


//const closeStaticPage = () => setStaticPage(null);

const handleSearch = (q: string) => {
  setSearchQuery(q);

  // 🌟 Clear all filters when searching
  setSelectedStore("Recent Deals");
  setSelectedCategory(null);
  setShowHotDeals(false);
  setStaticPage(null);
  setSelectedDeal(null);
  setIsDealDetailOpen(false);
};


const [holidayEvents, setHolidayEvents] = useState([]);
useEffect(() => {
  fetch("/api/holiday-events?active=true")
    .then(r => r.json())
    .then(data => setHolidayEvents(data));
}, []);



  return (
    <main className="relative min-h-screen overflow-hidden bg-gray-50">
      {/* 📱 MOBILE LAYOUT */}
      <div className="md:hidden relative z-10 flex flex-col h-screen">
      <MobileHeader
  onSearch={(q) => {
    setSearchQuery(q);          // <-- THIS MAKES MOBILE SEARCH WORK
    setShowHotDeals(false);     // optional: clear hot deals
    setSelectedCategory("");    // optional: clear category filter
    setSelectedStore("Recent Deals");
  }}
onToggleStores={() => {
  if (isStoreListOpen) closeStoreList();
  else setIsStoreListOpen(true);
}}
  onGoHome={goHome}
  onOpenStores={() => setIsStoreListOpen(true)}
  
/>


       <TopCategories
  onSelectCategory={(cat) => {
    setSelectedCategory(cat);
    setSearchQuery("");            // <-- FIX
    closeStoreList();
    setIsDealDetailOpen(false);
    setShowHotDeals(false);
    setActiveItem("");
  }}
  selectedCategory={selectedCategory}
/>

		
		

        <div className="flex-1 relative overflow-hidden">
          {/* Store List Drawer */}
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
   holidayEvents={holidayEvents}   // 👈 ADD THIS
              />
            </div>
          )}
{/* Static Pages (full screen) */}
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
          {!isDealDetailOpen && !isStoreListOpen && (
            <div className="absolute inset-0 z-10 bg-white overflow-y-auto custom-scroll animate-fade-in">
              <DealsList
                selectedStore={selectedStore}
				searchQuery={debouncedSearch}
                selectedCategory={selectedCategory}
				selectedHoliday={selectedHoliday}   // 👈 NEW
                showHotDeals={showHotDeals}
		//	searchQuery={searchQuery}
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
		{/* ⭐ ADD MOBILE FOOTER NAV HERE — RIGHT BEFORE THIS DIV CLOSES */}
  <MobileBottomNav
    active={staticPage || (isDealDetailOpen ? "details" : "home")}
    onHome={() => {
      setStaticPage(null);
    //  setSelectedStore("Recent Deals");
      setIsDealDetailOpen(false);
      setSelectedDeal(null);
      setShowHotDeals(false);

  //setSelectedStore("Recent Deals");
  setSelectedCategory(null);
 // setHotDeals(false);
//  setStaticPage(null);
 // setIsDealDetailOpen(false);
 
 //onAllStores={goHome}
         setSelectedStore("");      
 
 
	  
    }}
    onHotDeals={() => {
      setStaticPage(null);
      setShowHotDeals(true);
      setIsDealDetailOpen(false);
      setSelectedDeal(null);
	   setSelectedStore("");
	    setSelectedCategory("");
	  setActiveItem("hotDeals");
    }}
    //onStores={() => setIsStoreListOpen(true)}
    onAbout={() => {
  if (staticPage === "about") closeStaticPage();
  else openStaticPage("about");
}}

onPrivacy={() => {
  if (staticPage === "privacy") closeStaticPage();
  else openStaticPage("privacy");
}}

onContact={() => {
  if (staticPage === "contact") closeStaticPage();
  else openStaticPage("contact");
}}
  />

</div>
        
		
  
			  
			  


      {/* 💻 DESKTOP LAYOUT */}
      <div className="hidden md:flex relative z-0 flex-col h-screen overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="flex-shrink-0">
       <SearchBar onSearch={handleSearch} />

  
		  
		  
		  
		  
		  
         <TopCategories
  onSelectCategory={(cat) => {
    setSelectedCategory(cat);
    setSearchQuery("");            // <-- FIX
    setShowHotDeals(false);
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
				  setStaticPage("");
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
			   selectedHoliday={selectedHoliday}              // 👈 NEW
  onSelectHoliday={handleSelectHoliday}           // 👈 NEW
			   holidayEvents={holidayEvents}   // 👈 ADD THIS
            />
          </div>

        
{/* Middle Pane */}
<div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100">
  {staticPage === "about" && <AboutPage />}
  {staticPage === "privacy" && <PrivacyPage />}
  {staticPage === "contact" && <ContactPage />}

  {!staticPage && (
      <DealsList
        selectedStore={selectedStore}
		searchQuery={debouncedSearch}
		 showHotDeals={showHotDeals}
        selectedCategory={selectedCategory}
		selectedHoliday={selectedHoliday}   // 👈 NEW
	//	searchQuery={searchQuery}
        onSelectDeal={(deal) => {
          setSelectedDeal(deal);
        }}
      />
  )}
</div>

<div className="bg-white overflow-y-auto custom-scroll border-r border-gray-100">
  <DealDetail deal={selectedDeal} />
  
  
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
