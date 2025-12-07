import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AuctionDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");
  const [winner, setWinner] = useState(null);

  // ✅ Fetch auction + bids
  const fetchAuctionAndBids = async () => {
    try {
      const [auctionRes, bidsRes] = await Promise.all([
        fetch(`http://localhost:5219/api/Auctions/${id}`),
        fetch(`http://localhost:5219/api/Bids/auction/${id}`),
      ]);

      if (!auctionRes.ok || !bidsRes.ok)
        throw new Error("Failed to fetch data");

      const auctionData = await auctionRes.json();
      const bidsData = await bidsRes.json();

      setAuction(auctionData);
      setBids(bidsData);

      // 🏆 Determine winner when auction ends
      if (auctionData?.endDate && new Date(auctionData.endDate) < new Date()) {
        const topBid =
          bidsData.length > 0
            ? [...bidsData].sort((a, b) => b.amount - a.amount)[0]
            : null;
        setWinner(topBid);
      }
    } catch (err) {
      console.error("❌ Error fetching auction/bids:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Countdown timer
  const updateCountdown = (endTime) => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft("Auction Ended");
        fetchAuctionAndBids();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
    }, 1000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    fetchAuctionAndBids();
    const refreshInterval = setInterval(fetchAuctionAndBids, 5000);
    return () => clearInterval(refreshInterval);
  }, [id]);

  useEffect(() => {
    if (auction?.endDate) {
      const cleanup = updateCountdown(auction.endDate);
      return cleanup;
    }
  }, [auction]);

  // ✅ Place bid
  const handleBid = async (e) => {
    e.preventDefault();

    if (!user || (user.role !== "Buyer" && user.role !== "Admin")) {
      alert("🚫 Only Buyers can place bids.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Please log in to place a bid.");
      navigate("/login");
      return;
    }

    if (!bidAmount || isNaN(bidAmount)) {
      alert("Please enter a valid bid amount.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5219/api/Bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          auctionId: id,
          amount: parseFloat(bidAmount),
        }),
      });

      if (response.ok) {
        alert("✅ Bid placed successfully!");
        setBidAmount("");
        fetchAuctionAndBids();
      } else {
        const err = await response.json().catch(() => ({}));
        alert(`❌ Failed: ${err.message || "Server error"}`);
      }
    } catch (error) {
      console.error("❌ Error placing bid:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-600 text-lg">
        ⏳ Loading auction details...
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Auction not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-5xl overflow-hidden">
        {/* 🏆 Winner Banner with Glow Animation */}
        {winner && (
          <div className="bg-green-50 text-green-700 text-center py-4 font-semibold border-b border-green-300 relative">
            <span className="absolute left-5 text-3xl animate-bounce drop-shadow-md">
              🏅
            </span>
            <span className="text-xl animate-pulse">
              🏆 Winner: <b>{winner.bidderName}</b> — Rs.{" "}
              <b>{winner.amount.toLocaleString()}</b>
            </span>
          </div>
        )}

        {/* 🔹 Image + Info */}
        <div className="grid md:grid-cols-2 gap-8 p-8">
          <div>
            <img
              src={
                auction.imageUrl
                  ? `http://localhost:5219/${auction.imageUrl}`
                  : "/placeholder.png"
              }
              alt={auction.title}
              className="w-full h-96 object-cover rounded-xl shadow"
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-700 mb-3">
                {auction.title}
              </h1>
              <p className="text-gray-700 mb-4">{auction.description}</p>

              <p className="text-lg font-semibold text-gray-800 mb-1">
                💰 Current Price:{" "}
                <span className="text-green-600">
                  Rs. {auction.currentPrice.toLocaleString()}
                </span>
              </p>

              <p
                className={`font-medium mb-2 ${
                  timeLeft === "Auction Ended" ? "text-red-500" : "text-green-600"
                }`}
              >
                {timeLeft}
              </p>

              <p className="text-sm text-gray-500 mb-6">
                🕒 Ends on:{" "}
                {new Date(auction.endDate).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            {/* 💸 Bid Form */}
            {user && (user.role === "Buyer" || user.role === "Admin") ? (
              timeLeft !== "Auction Ended" ? (
                <form onSubmit={handleBid}>
                  <label className="block text-gray-700 font-medium mb-2">
                    Enter Your Bid Amount:
                  </label>
                  <input
                    type="number"
                    min={auction.currentPrice + 1}
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="submit"
                    className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-800 transition w-full"
                  >
                    Place Bid
                  </button>
                </form>
              ) : (
                <p className="text-red-500 mt-4 font-medium">
                  ⏰ This auction has ended.
                </p>
              )
            ) : (
              <p className="text-gray-600 mt-4">
                🔒 Log in as a Buyer to place bids.
              </p>
            )}
          </div>
        </div>

        {/* 📜 Bidding History */}
        <div className="border-t border-gray-200 p-8 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📜 Bidding History
          </h2>

          {bids.length === 0 ? (
            <p className="text-gray-600">No bids yet. Be the first to bid!</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {bids
                .sort(
                  (a, b) =>
                    new Date(b.placedAt).getTime() -
                    new Date(a.placedAt).getTime()
                )
                .map((bid) => (
                  <li
                    key={bid.id}
                    className="py-3 flex justify-between text-gray-700"
                  >
                    <span>
                      💸 <b>{bid.bidderName}</b> bid Rs.{" "}
                      <b>{bid.amount.toLocaleString()}</b>
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(bid.placedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </li>
                ))}
            </ul>
          )}

          {/* 🔙 Navigation Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-md transition"
            >
              ← Go Back
            </button>

            {user && user.role === "Buyer" && (
              <button
                onClick={() => navigate("/my-bids")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md transition"
              >
                🧾 View My Bids
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
