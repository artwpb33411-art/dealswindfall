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

export default function Home() {
  const [selectedStore, setSelectedStore] = useState("Recent Deals");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header section (fixed) */}
      <div className="flex-shrink-0">
        <SearchBar />
        <TopCategories onSelectCategory={setSelectedCategory} />
      </div>

     {/* Central grid — scroll panes */}
<div className="flex-1 grid grid-cols-[60px_220px_480px_1fr_160px] min-h-0 bg-white">
  <div className="bg-white border-r border-gray-200">
    <SideNav />
  </div>

  <div className="custom-scroll overflow-auto h-full">
    <StoreList selectedStore={selectedStore} onSelect={setSelectedStore} />
  </div>

  <div className="custom-scroll overflow-auto h-full">
    <DealsList
      selectedStore={selectedStore}
      selectedCategory={selectedCategory}
      onSelectDeal={setSelectedDeal}
    />
  </div>

  <div className="custom-scroll overflow-auto h-full">
    <DealDetail deal={selectedDeal} />
  </div>

  <div className="custom-scroll overflow-auto h-full">
    <AdPane />
  </div>
</div>




      {/* Footer (fixed) */}
      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
}
