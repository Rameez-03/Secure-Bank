const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isLoggedIn: true,
        loading: false,
      };

    case "REGISTER_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isLoggedIn: true,
        loading: false,
      };

    case "LOGOUT":
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoggedIn: false,
        loading: false,
      };

    case "UPDATE_USER":
      // Update user in localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};

export default AuthReducer;