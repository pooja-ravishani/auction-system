import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showActive, setShowActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch all auctions
  const fetchAuctions = async () => {
    try {
      const res = await fetch("http://localhost:5219/api/Auctions");
      if (!res.ok) throw new Error("Failed to fetch auctions");

      const data = await res.json();
      setAuctions(data);
      setFiltered(data);
    } catch (err) {
      console.error("❌ Error fetching auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Auto-refresh every 10 seconds
  useEffect(() => {
    fetchAuctions();
    const interval = setInterval(fetchAuctions, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🔍 Filter auctions dynamically
  useEffect(() => {
    const now = new Date();

    const filteredList = auctions.filter((a) => {
      const matchesSearch = a.title
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory =
        category === "All" || a.category === category;
      const isActive = new Date(a.endDate) > now;

      return matchesSearch && matchesCategory && (showActive ? isActive : !isActive);
    });

    setFiltered(filteredList);
  }, [search, category, showActive, auctions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-600 text-lg">
        ⏳ Loading auctions...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          🏷️ Browse Auctions
        </h1>

        {/* 🔎 Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          {/* Search */}
          <input
            type="text"
            placeholder="Search auctions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
          />

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-1/4 focus:ring-2 focus:ring-blue-400"
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Home Appliances">Appliances</option>
            <option value="Tools">Tools</option>
            <option value="Other">Other</option>
          </select>

          {/* Active/Ended Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-medium">
              {showActive ? "🟢 Active" : "🔴 Ended"}
            </label>
            <button
              onClick={() => setShowActive(!showActive)}
              className={`px-4 py-2 rounded-md font-medium transition ${
                showActive
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {showActive ? "Show Ended" : "Show Active"}
            </button>
          </div>
        </div>

        {/* 🧾 Auction Cards */}
        {filtered.length === 0 ? (
          <p className="text-gray-600 text-center">
            No auctions found.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((auction) => {
              const ended = new Date(auction.endDate) < new Date();

              return (
                <div
                  key={auction.id}
                  className={`rounded-xl shadow-md border border-gray-200 bg-white hover:shadow-lg transition transform hover:-translate-y-1 overflow-hidden ${
                    ended ? "opacity-75" : ""
                  }`}
                >
                  <img
                    src={
                      auction.imageUrl
                        ? `http://localhost:5219/${auction.imageUrl}`
                        : "/placeholder.png"
                    }
                    alt={auction.title}
                    className="w-full h-48 object-cover"
                  />

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {auction.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {auction.description}
                    </p>
                    <p className="text-gray-800 font-medium mb-1">
                      💰 Rs. {auction.currentPrice.toLocaleString()}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        ended ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {ended
                        ? "⏰ Auction Ended"
                        : `⏳ Ends: ${new Date(
                            auction.endDate
                          ).toLocaleDateString()}`}
                    </p>

                    <button
                      onClick={() => navigate(`/auctions/${auction.id}`)}
                      className="mt-3 w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
