import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, auctionsRes, paymentsRes] = await Promise.all([
          fetch("http://localhost:5219/api/Users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5219/api/Auctions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5219/api/Payments", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const usersData = await usersRes.json();
        const auctionsData = await auctionsRes.json();
        const paymentsData = await paymentsRes.json();

        setUsers(usersData);
        setAuctions(auctionsData);
        setPayments(paymentsData);
      } catch (err) {
        console.error("❌ Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-blue-600 text-lg">
        ⏳ Loading Dashboard...
      </div>
    );
  }

  // Chart Data
  const userRoleData = [
    { name: "Buyers", value: users.filter(u => u.role === "Buyer").length },
    { name: "Sellers", value: users.filter(u => u.role === "Seller").length },
    { name: "Admins", value: users.filter(u => u.role === "Admin").length },
  ];

  const paymentStatusData = [
    { name: "Completed", count: payments.filter(p => p.status === "Completed").length },
    { name: "Pending", count: payments.filter(p => p.status === "Pending").length },
  ];

  const COLORS = ["#3B82F6", "#16A34A", "#F59E0B"];

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">🧩 Admin Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-md p-6 rounded-lg text-center">
            <h2 className="text-gray-600 text-sm font-semibold">Total Users</h2>
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg text-center">
            <h2 className="text-gray-600 text-sm font-semibold">Total Auctions</h2>
            <p className="text-3xl font-bold text-green-600">{auctions.length}</p>
          </div>
          <div className="bg-white shadow-md p-6 rounded-lg text-center">
            <h2 className="text-gray-600 text-sm font-semibold">Total Payments</h2>
            <p className="text-3xl font-bold text-purple-600">{payments.length}</p>
          </div>
        </div>

        {/* ===================== CHARTS SECTION ===================== */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* USER ROLE PIE CHART */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              👥 User Roles Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* PAYMENT STATUS BAR CHART */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              💳 Payment Status Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" barSize={50} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* ===================== END CHARTS SECTION ===================== */}

        {/* User Table */}
        <div className="bg-white shadow-lg rounded-lg mb-10 overflow-hidden">
          <h2 className="bg-blue-700 text-white px-6 py-3 text-lg font-semibold">
            👤 User List
          </h2>
          <table className="w-full text-left">
            <thead className="bg-blue-50">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="py-2 px-4">{u.fullName}</td>
                  <td className="py-2 px-4">{u.email}</td>
                  <td className="py-2 px-4 font-semibold">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Auctions Table */}
        <div className="bg-white shadow-lg rounded-lg mb-10 overflow-hidden">
          <h2 className="bg-green-700 text-white px-6 py-3 text-lg font-semibold">
            📦 Active Auctions
          </h2>
          <table className="w-full text-left">
            <thead className="bg-green-50">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">End Date</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="py-2 px-4">{a.title}</td>
                  <td className="py-2 px-4">{a.sellerName}</td>
                  <td className="py-2 px-4">Rs. {a.currentPrice.toLocaleString()}</td>
                  <td className="py-2 px-4">
                    {new Date(a.endDate).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payments Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <h2 className="bg-purple-700 text-white px-6 py-3 text-lg font-semibold">
            💳 Payments
          </h2>
          <table className="w-full text-left">
            <thead className="bg-purple-50">
              <tr>
                <th className="py-3 px-4">Auction ID</th>
                <th className="py-3 px-4">Buyer ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2 px-4">{p.auctionId}</td>
                  <td className="py-2 px-4">{p.userId}</td>
                  <td className="py-2 px-4">Rs. {p.amount.toLocaleString()}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        p.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
