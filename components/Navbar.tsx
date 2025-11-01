export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-600">DealsWindfall</h1>
        <div className="space-x-6">
          <a href="#" className="text-gray-600 hover:text-blue-600">Home</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Top Deals</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Categories</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Login</a>
        </div>
      </div>
    </nav>
  );
}
