import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch live auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await fetch("http://localhost:5219/api/Auctions");
        const data = await response.json();
        setAuctions(data);
      } catch (error) {
        console.error("Error loading auctions:", error);
      }
    };

    fetchAuctions();
    const interval = setInterval(fetchAuctions, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Countdown timer
  const getCountdown = (endDate) => {
    if (!endDate) return "Ended";
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="bg-gradient-to-b from-blue-200 via-blue-100 to-white min-h-screen font-sans">
      {/* 🌟 HERO SECTION */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 py-24 max-w-7xl mx-auto">
        <div className="md:w-1/2 flex justify-center mb-10 md:mb-0">
          <img
            src="/home.png"
            alt="Auction Concept"
            className="w-[600px] md:w-[650px] h-auto drop-shadow-2xl transition-transform duration-500 hover:scale-105"
          />
        </div>

        <div className="md:w-1/2 md:pl-10 text-center md:text-left">
          <h4 className="text-red-500 text-sm font-semibold tracking-widest uppercase mb-3">
            Empowering Digital Bidding
          </h4>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Bid Smart. Win Big. <br /> Join ElectroBid Today!
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={() => navigate("/register")}
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 hover:shadow-lg transition"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/auctions")}
              className="border border-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-md transition"
            >
              View Auctions
            </button>
          </div>
        </div>
      </section>

      {/* ⚡ LIVE AUCTIONS SECTION */}
      <section className="bg-gradient-to-b from-white via-blue-50 to-blue-100 py-16 px-8 border-t border-gray-200 shadow-inner">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <span className="text-yellow-500 text-3xl mr-2">⚡</span> Live Auctions
          </h2>

          {auctions.length === 0 ? (
            <p className="text-gray-500 text-lg ml-8">
              No active auctions right now.
            </p>
          ) : (
            <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
              {auctions.slice(0, 6).map((auction) => {
                const countdown = getCountdown(auction.endDate);
                const ended = countdown === "Ended";

                return (
                  <div
                    key={auction.id}
                    className={`rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 border relative overflow-hidden ${
                      ended
                        ? "bg-gray-100 border-gray-300"
                        : "bg-gradient-to-br from-white to-blue-50 border-blue-200"
                    }`}
                  >
                    {/* Auction Image */}
                    <img
                      src={
                        auction.imageUrl
                          ? `http://localhost:5219${auction.imageUrl}`
                          : "/default.jpg"
                      }
                      alt={auction.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />

                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {auction.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {auction.description}
                    </p>

                    <p className="font-semibold text-blue-700 mb-2">
                      Rs.{" "}
                      {auction.currentPrice?.toLocaleString() ||
                        auction.startingPrice?.toLocaleString()}
                    </p>

                    <div
                      className={`text-sm font-medium mb-4 ${
                        ended ? "text-red-500" : "text-green-600"
                      }`}
                    >
                      {ended ? "Auction Ended" : `⏰ Ends in ${countdown}`}
                    </div>

                    <button
                      disabled={ended}
                      onClick={() => navigate(`/auctions/${auction.id}`)}
                      className={`w-full py-2 rounded-md font-semibold transition ${
                        ended
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {ended ? "Closed" : "Place Bid →"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
