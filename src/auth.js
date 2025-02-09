import axios from "axios";

const BACKEND_API_URL = "http://localhost:5000/api/auth"; // Adjust for production

export const useAuth = () => {
  const login = async (email, password, rememberMe) => {
    try {
      console.log("🔹 Logging in via backend:", email);

      // Call backend API for login
      const response = await axios.post(`${BACKEND_API_URL}/login`, { email, password });

      console.log("✅ Backend Login Response:", response.data);

      const { token, refresh_token } = response.data;

      if (!token || !refresh_token) {
        console.error("🔴 No token received:", response.data);
        throw new Error("Login failed, no token received.");
      }

      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refresh_token);
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("refreshToken", refresh_token);
      }

      console.log("✅ Tokens stored successfully.");
      window.location.href = "/dashboard";

      return { token, refresh_token };
    } catch (error) {
      console.error("🔴 Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  // 🔹 **Signup (Calls Your Backend, Not Keycloak Directly)**
  const signup = async (email, username, firstName, lastName, password) => {
    try {
      const response = await axios.post(`${BACKEND_API_URL}/signup`, {
        email,
        username,
        firstName,
        lastName,
        password,
      });
  
      alert(response.data.message); // Show success message
    } catch (error) {
      console.error("🔴 Signup failed:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Signup failed. Try again.");
    }
  };
  
  

  // 🔹 **Forgot Password (Calls Your Backend)**
  const forgotPassword = async (email) => {
    try {
      await axios.post(`${BACKEND_API_URL}/forgot-password`, { email });
      alert("Password reset email sent!");
    } catch (error) {
      console.error("Forgot password failed:", error.response?.data || error.message);
      alert("Failed to send reset email.");
    }
  };
  

  // 🔹 **Logout (Clear Tokens & Redirect)**
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.log("🔹 No refresh token found. Clearing local session.");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return;
      }

      console.log("🔹 Logging out user via backend...");
      await axios.post(`${BACKEND_API_URL}/logout`, { refreshToken });

      // ✅ Clear session after logout
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("refreshToken");

      window.location.href = "/login"; // Redirect after logout
    } catch (error) {
      console.error("🔴 Logout failed:", error);
      window.location.href = "/login"; // Ensure user is logged out even if backend fails
    }
  };

  return { login, signup, forgotPassword, logout };
};
