import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ Decode JWT safely
  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("❌ Failed to decode token:", err);
      return null;
    }
  };

  // ✅ Restore user session (run once)
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token) {
        // Decode the JWT to ensure claims are available
        const payload = decodeToken(token);

        if (!payload) {
          logout();
          return;
        }

        // Check token expiry (if present)
        const now = Date.now() / 1000;
        if (payload.exp && payload.exp < now) {
          console.warn("⚠️ Token expired — logging out.");
          logout();
          return;
        }

        // If user exists in storage, restore it
        if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
          setUser(JSON.parse(savedUser));
        } else {
          // Decode from JWT if local user not stored
          setUser({
            name:
              payload.name ||
              payload["unique_name"] ||
              payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
              "Unknown",
            email:
              payload.email ||
              payload["email"] ||
              payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
              "unknown@user.com",
            role:
              payload.role ||
              payload["role"] ||
              payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
              "Buyer",
          });
        }
      }
    } catch (error) {
      console.error("⚠️ Error restoring session:", error);
      logout();
    }
  }, []);

  // ✅ Login — persist user + token
  const login = (token, user) => {
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } else {
      console.error("⚠️ Invalid login data:", { token, user });
    }
  };

  // ✅ Logout — clear everything
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
