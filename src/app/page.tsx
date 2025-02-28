import HomeBanner from "./components/shop/HomeBanner";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HomeBanner />

      {/* We'll add product listings here later */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Product cards will go here later */}
          <div className="bg-gray-100 h-64 rounded-lg animate-pulse"></div>
          <div className="bg-gray-100 h-64 rounded-lg animate-pulse"></div>
          <div className="bg-gray-100 h-64 rounded-lg animate-pulse"></div>
          <div className="bg-gray-100 h-64 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
