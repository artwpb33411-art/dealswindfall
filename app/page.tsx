import Navbar from "../components/Navbar";
import DealCard from "../components/DealCard";
import Footer from "../components/Footer";

export default function Home() {
  const sampleDeals = [
    {
      title: "Apple AirPods Pro (2nd Gen)",
      price: "$189.99",
      link: "#",
      votes: 123,
      image: "https://via.placeholder.com/300x200.png?text=AirPods+Pro",
    },
    {
      title: "Samsung 55\" 4K Smart TV",
      price: "$379.00",
      link: "#",
      votes: 87,
      image: "https://via.placeholder.com/300x200.png?text=Samsung+TV",
    },
    {
      title: "Instant Pot Duo 7-in-1 Cooker",
      price: "$79.99",
      link: "#",
      votes: 45,
      image: "https://via.placeholder.com/300x200.png?text=Instant+Pot",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleDeals.map((deal, index) => (
          <DealCard key={index} {...deal} />
        ))}
      </main>
      <Footer />
    </div>
  );
}
