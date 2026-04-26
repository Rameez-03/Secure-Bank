import React, { createContext, useReducer, useEffect } from "react";
import AuthReducer from "./AuthReducer";
import { setAccessToken, authAPI } from "../services/api";

const INITIAL_STATE = {
  user: null,
  isLoggedIn: false,
  accessToken: null,
  loading: true,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    // On app load: try to get a fresh access token via the httpOnly refresh cookie.
    // User profile is stored in localStorage only to avoid an extra round-trip
    // for non-sensitive display data (name, email).
    const tryRefresh = async () => {
      try {
        const { data } = await authAPI.refreshToken();
        const { accessToken, user } = data.data;
        setAccessToken(accessToken);
        // Merge with cached user if refresh didn't return one
        const cachedUser = user || JSON.parse(localStorage.getItem("user") || "null");
        if (cachedUser) {
          localStorage.setItem("user", JSON.stringify(cachedUser));
          dispatch({ type: "LOGIN_SUCCESS", payload: { user: cachedUser, accessToken } });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch {
        // Refresh cookie absent or expired — user must log in
        localStorage.removeItem("user");
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    tryRefresh();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        accessToken: state.accessToken,
        loading: state.loading,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
