import React, { createContext, useReducer, useEffect } from "react";
import AuthReducer from "./AuthReducer";

const INITIAL_STATE = {
  user: null,
  isLoggedIn: false,
  accessToken: null,
  refreshToken: null,
  loading: true,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const user = localStorage.getItem("user");

    if (accessToken && user) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: JSON.parse(user),
          accessToken,
          refreshToken,
        },
      });
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        loading: state.loading,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
