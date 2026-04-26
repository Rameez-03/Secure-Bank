import { setAccessToken } from "../services/api";

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      setAccessToken(action.payload.accessToken);
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isLoggedIn: true,
        loading: false,
      };

    case "LOGOUT":
      setAccessToken(null);
      localStorage.removeItem("user");
      return {
        ...state,
        user: null,
        accessToken: null,
        isLoggedIn: false,
        loading: false,
      };

    case "UPDATE_USER":
      localStorage.setItem("user", JSON.stringify(action.payload));
      return { ...state, user: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    default:
      return state;
  }
};

export default AuthReducer;
