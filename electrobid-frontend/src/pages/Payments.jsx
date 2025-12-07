import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Payments() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch payments from API
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("⚠️ Please log in again.");
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:5219/api/Payments/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error("❌ Error fetching payments:", err);
      alert("Unable to load payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Simulate "Pay Now"
  const handlePayment = async (paymentId) => {
    if (!window.confirm("Proceed to complete this payment?")) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:5219/api/Payments/pay/${paymentId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        alert("✅ Payment completed successfully!");
        fetchPayments();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`❌ Failed: ${err.message || "Server error"}`);
      }
    } catch (error) {
      console.error("❌ Error during payment:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (!user || (user.role !== "Buyer" && user.role !== "Admin")) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <h2 className="text-xl font-semibold text-gray-700">
          🚫 Access Denied — Only Buyers can view payments.
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-600 text-lg">
        ⏳ Loading your payments...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">💳 My Payments</h1>

        {payments.length === 0 ? (
          <p className="text-gray-600 text-center">
            You have no payments yet. Win an auction to get started!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-100 text-blue-800">
                  <th className="py-3 px-4 rounded-tl-lg">Auction</th>
                  <th className="py-3 px-4">Amount (Rs)</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-gray-50 transition text-gray-700"
                  >
                    <td className="py-3 px-4 font-medium">{p.auctionTitle}</td>
                    <td className="py-3 px-4 font-semibold text-green-700">
                      {p.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(p.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          p.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {p.status === "Pending" ? (
                        <button
                          onClick={() => handlePayment(p.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 🔙 Navigation */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-md transition"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate("/auctions")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition"
          >
            ⚡ Browse More Auctions
          </button>
        </div>
      </div>
    </div>
  );
}
