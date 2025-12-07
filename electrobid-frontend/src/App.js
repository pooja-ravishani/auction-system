import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

// Components & Pages
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auctions from "./pages/Auctions";
import AuctionDetails from "./pages/AuctionDetails";
import CreateAuction from "./pages/CreateAuction";
import MyAuctions from "./pages/MyAuctions";
import MyBids from "./pages/MyBids";
import Payments from "./pages/Payments";
import AdminDashboard from "./pages/AdminDashboard"; // ✅ NEW IMPORT

// -----------------------------------------------------
// ✅ ProtectedRoute component
// -----------------------------------------------------
function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  // ⛔ Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ⚠️ Role mismatch (e.g., Buyer accessing Seller route)
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// -----------------------------------------------------
// ✅ Main App Component
// -----------------------------------------------------
function App() {
  const { user } = useContext(AuthContext) || {};

  return (
    <BrowserRouter>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* 🌍 Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auctions/:id" element={<AuctionDetails />} />

          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" replace />}
          />

          {/* 🔒 Seller Routes */}
          <Route
            path="/create-auction"
            element={
              <ProtectedRoute role="Seller">
                <CreateAuction />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-auctions"
            element={
              <ProtectedRoute role="Seller">
                <MyAuctions />
              </ProtectedRoute>
            }
          />

          {/* 🔒 Buyer Routes */}
          <Route
            path="/my-bids"
            element={
              <ProtectedRoute role="Buyer">
                <MyBids />
              </ProtectedRoute>
            }
          />

          {/* 🔒 Common Authenticated Route (Buyer or Admin) */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />

          {/* 🔒 Admin Dashboard */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 🚫 Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
