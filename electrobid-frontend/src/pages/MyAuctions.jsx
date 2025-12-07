import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyAuctions() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // Track deleting auction ID

  // ✅ Fetch seller’s auctions
  const fetchMyAuctions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("⚠️ Please log in again.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5219/api/Auctions/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to load your auctions");

      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error("❌ Error fetching seller auctions:", error);
      alert("Unable to load your auctions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  // ✅ Delete auction
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this auction?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("⚠️ Please log in again.");
      navigate("/login");
      return;
    }

    try {
      setDeleting(id);
      const response = await fetch(`http://localhost:5219/api/Auctions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 204) {
        alert("✅ Auction deleted successfully!");
        setAuctions((prev) => prev.filter((a) => a.id !== id));
      } else if (response.status === 404) {
        alert("❌ Auction not found or you don’t have permission.");
      } else {
        const err = await response.json().catch(() => ({}));
        alert(`⚠️ Failed to delete: ${err.message || "Server error"}`);
      }
    } catch (error) {
      console.error("❌ Error deleting auction:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (!user || (user.role !== "Seller" && user.role !== "Admin")) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <h2 className="text-xl font-semibold text-gray-700">
          🚫 Access Denied — Only Sellers can view their auctions.
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-600 text-lg">
        ⏳ Loading your auctions...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">
          🧾 My Auctions
        </h1>

        {auctions.length === 0 ? (
          <p className="text-gray-600 text-center">
            You haven’t created any auctions yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                className="border border-gray-200 rounded-xl shadow-md p-4 hover:shadow-lg transition bg-white flex flex-col"
              >
                <img
                  src={
                    auction.imageUrl
                      ? `http://localhost:5219/${auction.imageUrl}`
                      : "/placeholder.png"
                  }
                  alt={auction.title}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {auction.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {auction.description}
                </p>
                <p className="text-gray-800 font-medium mb-1">
                  💰 Rs. {auction.startingPrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  ⏳ Ends on:{" "}
                  {new Date(auction.endDate).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>

                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => navigate(`/auctions/${auction.id}`)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(auction.id)}
                    disabled={deleting === auction.id}
                    className={`flex-1 py-2 rounded-md transition text-white ${
                      deleting === auction.id
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {deleting === auction.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
