import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Close menu after navigation
  const handleNavClick = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Left: Brand */}
        <div
          onClick={() => handleNavClick("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="text-yellow-400 text-2xl">⚡</span>
          <h1 className="text-2xl font-extrabold tracking-tight">ElectroBid</h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6 text-[16px] font-medium">
          <Link
            to="/"
            className={`transition duration-200 ${
              isActive("/") ? "text-yellow-300" : "hover:text-yellow-300"
            }`}
          >
            Home
          </Link>

          <Link
            to="/auctions"
            className={`transition duration-200 ${
              isActive("/auctions") ? "text-yellow-300" : "hover:text-yellow-300"
            }`}
          >
            Auctions
          </Link>

          {/* Seller-only */}
          {user?.role === "Seller" && (
            <>
              <Link
                to="/create-auction"
                className={`transition duration-200 ${
                  isActive("/create-auction")
                    ? "text-yellow-300"
                    : "hover:text-yellow-300"
                }`}
              >
                Create Auction
              </Link>
              <Link
                to="/my-auctions"
                className={`transition duration-200 ${
                  isActive("/my-auctions")
                    ? "text-yellow-300"
                    : "hover:text-yellow-300"
                }`}
              >
                My Auctions
              </Link>
            </>
          )}

          {/* Buyer-only */}
          {user?.role === "Buyer" && (
            <Link
              to="/my-bids"
              className={`transition duration-200 ${
                isActive("/my-bids")
                  ? "text-yellow-300"
                  : "hover:text-yellow-300"
              }`}
            >
              My Bids
            </Link>
          )}

          {/* Payments - Buyer or Admin */}
          {user && (user.role === "Buyer" || user.role === "Admin") && (
            <Link
              to="/payments"
              className={`transition duration-200 ${
                isActive("/payments")
                  ? "text-yellow-300"
                  : "hover:text-yellow-300"
              }`}
            >
              💳 Payments
            </Link>
          )}

          {/* 🧩 Admin Dashboard */}
          {user && user.role === "Admin" && (
            <Link
              to="/admin-dashboard"
              className={`transition duration-200 ${
                isActive("/admin-dashboard")
                  ? "text-yellow-300"
                  : "hover:text-yellow-300"
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right: Auth Controls */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 rounded-md border border-white hover:bg-white hover:text-blue-700 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2 bg-white text-blue-700 rounded-md font-semibold hover:bg-yellow-300 hover:text-blue-900 transition"
              >
                Register
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-blue-900 px-4 py-2 rounded-md">
                <span className="text-lg">👤</span>
                <span className="font-semibold">
                  {user.name}{" "}
                  <span
                    className={`ml-1 text-sm font-medium ${
                      user.role === "Seller"
                        ? "text-yellow-300"
                        : user.role === "Admin"
                        ? "text-red-300"
                        : "text-green-300"
                    }`}
                  >
                    ({user.role})
                  </span>
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖️" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 text-white px-6 py-4 space-y-4 shadow-inner animate-slideDown">
          <Link
            to="/"
            onClick={() => handleNavClick("/")}
            className={`block ${
              isActive("/") ? "text-yellow-300" : "hover:text-yellow-300"
            }`}
          >
            Home
          </Link>

          <Link
            to="/auctions"
            onClick={() => handleNavClick("/auctions")}
            className={`block ${
              isActive("/auctions")
                ? "text-yellow-300"
                : "hover:text-yellow-300"
            }`}
          >
            Auctions
          </Link>

          {user?.role === "Seller" && (
            <>
              <Link
                to="/create-auction"
                onClick={() => handleNavClick("/create-auction")}
                className={`block ${
                  isActive("/create-auction")
                    ? "text-yellow-300"
                    : "hover:text-yellow-300"
                }`}
              >
                Create Auction
              </Link>
              <Link
                to="/my-auctions"
                onClick={() => handleNavClick("/my-auctions")}
                className={`block ${
                  isActive("/my-auctions")
                    ? "text-yellow-300"
                    : "hover:text-yellow-300"
                }`}
              >
                My Auctions
              </Link>
            </>
          )}

          {user?.role === "Buyer" && (
            <Link
              to="/my-bids"
              onClick={() => handleNavClick("/my-bids")}
              className={`block ${
                isActive("/my-bids")
                  ? "text-yellow-300"
                  : "hover:text-yellow-300"
              }`}
            >
              My Bids
            </Link>
          )}

          {user && (user.role === "Buyer" || user.role === "Admin") && (
            <Link
              to="/payments"
              onClick={() => handleNavClick("/payments")}
              className={`block ${
                isActive("/payments")
                  ? "text-yellow-300"
                  : "hover:text-yellow-300"
              }`}
            >
              Payments
            </Link>
          )}

          {/* 🧩 Admin Dashboard (Mobile) */}
          {user && user.role === "Admin" && (
            <Link
              to="/admin-dashboard"
              onClick={() => handleNavClick("/admin-dashboard")}
              className={`block ${
                isActive("/admin-dashboard")
                  ? "text-yellow-300"
                  : "hover:text-yellow-300"
              }`}
            >
              Dashboard
            </Link>
          )}

          {/* Auth Controls */}
          {!user ? (
            <>
              <button
                onClick={() => handleNavClick("/login")}
                className="block w-full bg-white text-blue-700 py-2 rounded-md font-semibold hover:bg-yellow-300 transition"
              >
                Login
              </button>
              <button
                onClick={() => handleNavClick("/register")}
                className="block w-full bg-yellow-400 text-blue-900 py-2 rounded-md font-semibold hover:bg-yellow-300 transition"
              >
                Register
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                logout();
                handleNavClick("/login");
              }}
              className="block w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md font-medium transition"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
