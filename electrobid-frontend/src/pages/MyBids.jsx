import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyBids() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBids = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("⚠️ Please log in again.");
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5219/api/Bids/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch your bids.");
        }

        const data = await response.json();
        setBids(data);
      } catch (error) {
        console.error("❌ Error fetching bids:", error);
        alert("Unable to load your bids. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyBids();
  }, [navigate]);

  // 🔒 Access control
  if (!user || (user.role !== "Buyer" && user.role !== "Admin")) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <h2 className="text-xl font-semibold text-gray-700">
          🚫 Access Denied — Only Buyers can view their bids.
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-600 text-lg">
        ⏳ Loading your bids...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">🎯 My Bids</h1>

        {bids.length === 0 ? (
          <p className="text-gray-600 text-center">
            You haven’t placed any bids yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Auction ID</th>
                  <th className="py-3 px-4 text-left">Bid Amount (Rs)</th>
                  <th className="py-3 px-4 text-left">Placed At</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid) => (
                  <tr
                    key={bid.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-2 px-4 text-gray-800">
                      {bid.auctionId.slice(0, 8)}...
                    </td>
                    <td className="py-2 px-4 font-medium text-blue-700">
                      Rs. {bid.amount.toLocaleString()}
                    </td>
                    <td className="py-2 px-4 text-gray-600">
                      {new Date(bid.placedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => navigate(`/auctions/${bid.auctionId}`)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
                      >
                        View Auction
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
