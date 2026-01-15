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

//console.log("HomeClient rendered");
function shuffle<T>(array: T[]) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
const [dealTotalViews, setDealTotalViews] = useState<number | null>(null);
  // ------------ STATE ------------
  const [selectedStore, setSelectedStore] = useState("Recent Deals");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedHoliday, setSelectedHoliday] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

  const [isStoreListOpen, setIsStoreListOpen] = useState(false);
  const [isClosingStoreList, setIsClosingStoreList] = useState(false);

  const [isDealDetailOpen, setIsDealDetailOpen] = useState(false);
  const [engagementDeals, setEngagementDeals] = useState<any[]>([]); // ✅ STEP 1
 // const [visibleDeals, setVisibleDeals] = useState<any[]>([]);       // (used later)

  //const [engagementDeals, setEngagementDeals] = useState<any[]>([]); // ✅ REQUIRED
//const [visibleDeals, setVisibleDeals] = useState<any[]>([]);       // (if using visibleDeals)


  const [staticPage, setStaticPage] = useState<string | null>(null);
  const [isClosingStaticPage, setIsClosingStaticPage] = useState(false);

  const [showHotDeals, setShowHotDeals] = useState(false);
  const [activeItem, setActiveItem] = useState("allStores");

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 350);
const [visibleDeals, setVisibleDeals] = useState<any[]>([]);

  // Scroll restoration for DealsList
  const dealsListRef = useRef<HTMLDivElement | null>(null);
 
  // ------------ Sync with URL (/?deal=ID) ------------
  useEffect(() => {
  const dealParam = searchParams.get("deal");

  if (!dealParam) {
    setSelectedDeal(null);
    setIsDealDetailOpen(false);
    setEngagementDeals([]); // ✅ reset
    return;
  }

  const id = Number(dealParam);
  if (Number.isNaN(id)) return;

  const fetchDealAndEngagement = async () => {
    const { data: deal } = await supabase
      .from("deals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!deal) return;

    setSelectedDeal(deal);
    setIsDealDetailOpen(true);

    // ✅ FETCH ENGAGEMENT DEALS HERE
    const { data: moreDeals } = await supabase
      .from("deals")
      .select(`
        id,
        slug,
        description,
        current_price,
        old_price,
        image_link,
        store_name
      `)
      .eq("status", "Published")
      .neq("id", deal.id)
      .order("published_at", { ascending: false })
      .limit(15);

   const normalized = (moreDeals || []).map((d) => ({
  id: d.id,
  slug: d.slug ?? "",
  title: d.description ?? "",
  price: d.current_price,
  old_price: d.old_price,
  image_url: d.image_link,
  store_name: d.store_name,
}));

const randomized = shuffle(normalized).slice(0, 5);

setEngagementDeals(randomized);


    console.log("Engagement deals loaded:", moreDeals?.length);
  };

  fetchDealAndEngagement();
}, [searchParams]);

  

  useEffect(() => {
  if (!selectedDeal?.id) {
    setDealTotalViews(null);
    return;
  }

  const fetchTotalViews = async () => {
    try {
      const res = await fetch(`/api/deals/${selectedDeal.id}/views-total`);
      const json = await res.json();
      setDealTotalViews(Number(json.total) || 0);
      console.log("views total raw:", json.total, typeof json.total);


    } catch {
      setDealTotalViews(null);
    }
  };

  fetchTotalViews();
}, [selectedDeal?.id]);

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
  setSelectedDeal(deal);
  setIsDealDetailOpen(true);

  const others = visibleDeals
    .filter((d) => d.id !== deal.id)
    .slice(0, 5);

  setEngagementDeals(others); // ✅ STEP 2
console.log("Engagement deals:", others);

  router.push(`/?deal=${deal.id}`, { scroll: false });
};


const handleBackToDeals = () => {
  setIsDealDetailOpen(false);
  setSelectedDeal(null);
  router.push("/", { scroll: false });
};



  const { lang, hydrated, hydrate } = useLangStore();

useEffect(() => {
  hydrate();
}, []);



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
         <div
  className={`absolute inset-0 bg-white transition-opacity ${
    isDealDetailOpen || isStoreListOpen || staticPage
      ? "opacity-0 pointer-events-none"
      : "opacity-100"
  }`}
>
  <DealsList
    selectedStore={selectedStore}
    selectedCategory={selectedCategory}
    selectedHoliday={selectedHoliday}
    searchQuery={debouncedSearch}
    showHotDeals={showHotDeals}
    onSelectDeal={handleSelectDeal}
    scrollRef={dealsListRef}
    onVisibleDealsChange={setVisibleDeals}
  />
</div>


          {/* Deal Detail */}
          {isDealDetailOpen && (
            <div className="absolute inset-0 bg-white overflow-y-auto custom-scroll z-30 animate-slide-in-right">
           
           <DealDetail
  deal={selectedDeal}
  totalViews={dealTotalViews ?? undefined}
  engagementDeals={engagementDeals}
   engagementLinkType="id" 
/>


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
          onSaved={() => {
    router.push("/saved");
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
        <DealDetail
  deal={selectedDeal}
  totalViews={dealTotalViews ?? undefined}
  engagementDeals={engagementDeals}
   engagementLinkType="id" 
/>


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
