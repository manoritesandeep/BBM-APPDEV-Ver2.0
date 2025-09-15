import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  signOutFromGoogle,
  signOutFromFacebook,
  signOutFromApple,
} from "../util/socialAuth";

export const AuthContext = createContext({
  token: null,
  userId: null,
  refreshToken: null,
  authProvider: null,
  isAuthenticated: false,
  authenticate: (token, userId, provider, refreshToken) => {},
  logout: () => {},
});

function AuthContextProvider({ children }) {
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authProvider, setAuthProvider] = useState(null);
  const [authRefreshToken, setAuthRefreshToken] = useState(null);

  // Persist token, userId, provider, and refresh token on authenticate
  function authenticate(
    token,
    userId,
    provider = "email",
    refreshToken = null
  ) {
    setAuthToken(token);
    setUserId(userId);
    setAuthProvider(provider);
    setAuthRefreshToken(refreshToken);
    AsyncStorage.setItem("token", token);
    AsyncStorage.setItem("userId", userId);
    AsyncStorage.setItem("authProvider", provider);
    if (refreshToken) {
      AsyncStorage.setItem("refreshToken", refreshToken);
    }
  }

  // Remove token, userId, and provider on logout
  async function logout() {
    try {
      // Sign out from respective social provider
      if (authProvider === "google") {
        await signOutFromGoogle();
      } else if (authProvider === "facebook") {
        await signOutFromFacebook();
      } else if (authProvider === "apple") {
        await signOutFromApple();
      }

      setAuthToken(null);
      setUserId(null);
      setAuthProvider(null);
      setAuthRefreshToken(null);
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("userId");
      AsyncStorage.removeItem("authProvider");
      AsyncStorage.removeItem("refreshToken");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still clear local state even if social logout fails
      setAuthToken(null);
      setUserId(null);
      setAuthProvider(null);
      setAuthRefreshToken(null);
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("userId");
      AsyncStorage.removeItem("authProvider");
      AsyncStorage.removeItem("refreshToken");
    }
  }

  // Auto-login on app start
  useEffect(() => {
    async function loadStoredAuth() {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedProvider = await AsyncStorage.getItem("authProvider");
      const storedRefreshToken = await AsyncStorage.getItem("refreshToken");
      if (storedToken && storedUserId) {
        setAuthToken(storedToken);
        setUserId(storedUserId);
        setAuthProvider(storedProvider || "email");
        setAuthRefreshToken(storedRefreshToken);
      }
    }
    loadStoredAuth();
  }, []);

  const value = {
    token: authToken,
    userId,
    authProvider,
    refreshToken: authRefreshToken,
    isAuthenticated: !!authToken,
    authenticate,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;
