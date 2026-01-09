"use client";
import { Home, Flame, Heart, Info, Shield, Mail, FileText } from "lucide-react";

export default function SideNav({
  onAllStores,
  onHotDeals,
  onSelectPage,
  activeItem,
}: {
  onAllStores: () => void;
  onHotDeals: () => void;
  onSelectPage: (page: string) => void;
  activeItem: string;
}) {
  const navItems = [
  { id: "allStores", name: "All Stores", icon: Home, onClick: onAllStores },
  { id: "hotDeals", name: "Super Hot Deals", icon: Flame, onClick: onHotDeals },

  // ❤️ Saved Deals
  {
    id: "saved",
    name: "Saved Deals",
    icon: Heart,
    onClick: () => (window.location.href = "/saved"),
  },

  { id: "about", name: "About", icon: Info, onClick: () => onSelectPage("about") },
  { id: "privacy", name: "Privacy", icon: Shield, onClick: () => onSelectPage("privacy") },
  { id: "contact", name: "Contact", icon: Mail, onClick: () => onSelectPage("contact") },
  { id: "blog", name: "Blog", icon: FileText, onClick: () => (window.location.href = "/blog") },
];


  return (
    <nav className="bg-gray-50 border-r border-gray-200 h-[calc(100vh-120px)] flex flex-col items-center py-3 space-y-3">
     {navItems.map((item) => {
  const Icon = item.icon;

  const isHot = item.id === "hotDeals";

        return (
    <button
      key={item.id}
      onClick={item.onClick}
      title={item.name}
      className={`flex flex-col items-center justify-center w-12 h-12 rounded-md transition
      ${
  activeItem === item.id
    ? item.id === "saved"
      ? "bg-red-50 text-red-600 scale-105"
      : "bg-blue-50 text-blue-600 scale-105"
    : "text-gray-600 hover:text-blue-700 hover:bg-gray-50"
}`}
    >
      <Icon
        size={22}
        className={
          isHot
            ? "animate-[flame-glow_1.4s_ease-in-out_infinite]"
            : ""
        }
      />
    </button>
        );
      })}
    </nav>
  );
}
