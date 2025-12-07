import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  // 🚫 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Logged in but wrong role
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authorized
  return children;
}
