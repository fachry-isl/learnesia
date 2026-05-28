import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const ACCESS_TOKEN_COOKIE = "accessToken";

function setAccessTokenCookie(token) {
  if (typeof document === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${token}; Path=/; SameSite=Lax`;
}

function clearAccessTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;
    setAccessToken(localStorage.getItem("accessToken") || null);
  }, []);

  const login = (tokens) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("accessToken", tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);
    }
    setAccessTokenCookie(tokens.access);
    setAccessToken(tokens.access);
  };

  const logout = () => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    clearAccessTokenCookie();
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
