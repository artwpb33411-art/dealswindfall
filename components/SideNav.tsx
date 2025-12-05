"use client";
import { Home, Flame, Info, Shield, Mail, FileText  } from "lucide-react";
import { useState } from "react";

export default function SideNav({
  onAllStores,
  onHotDeals,
  onSelectPage,
  activeItem,
}: {
  onAllStores: () => void;
  onHotDeals: () => void;
  onSelectPage: (page: string) => void;
  activeItem: string; // 👈 New prop
}) {
  const navItems = [
    { id: "allStores", name: "All Stores", icon: <Home size={20} />, onClick: onAllStores },
    { id: "hotDeals", name: "Super Hot Deals", icon: <Flame size={20} />, onClick: onHotDeals },
    { id: "about", name: "About", icon: <Info size={20} />, onClick: () => onSelectPage("about") },
    { id: "privacy", name: "Privacy", icon: <Shield size={20} />, onClick: () => onSelectPage("privacy") },
    { id: "contact", name: "Contact", icon: <Mail size={20} />, onClick: () => onSelectPage("contact") },
{ 
  id: "blog", 
  name: "Blog", 
  icon: <FileText size={20} />, 
  onClick: () => window.location.href = "/blog" 
},



  ];

  return (
    <nav className="bg-gray-50 border-r border-gray-200 h-[calc(100vh-120px)] flex flex-col items-center py-3 space-y-3">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          title={item.name}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-md transition
            ${activeItem === item.id
              ? "bg-blue-50 text-blue-600 scale-105"
              : "text-gray-600 hover:text-blue-700 hover:bg-gray-50"}`}
        >
          {item.icon}
        </button>
      ))}
    </nav>
  );
}

