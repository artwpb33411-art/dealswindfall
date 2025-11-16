export default function TopCategories({
  onSelectCategory,
  selectedCategory,
}: {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}) {
  const categories = [
    "Electronics",
    "Clothing & Apparel",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Grocery & Food",
    "Appliances",
    "Health & Wellness",
    "Pet Supplies",
  ];

  return (
    <header className="flex items-center justify-center bg-white border-b border-gray-200 shadow-sm h-14 px-4">
      <nav className="flex items-center gap-5 overflow-x-auto no-scrollbar whitespace-nowrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 text-sm rounded-md transition-all duration-200 font-medium ${
              selectedCategory === category
                ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            {category}
          </button>
        ))}
      </nav>
    </header>
  );
}
