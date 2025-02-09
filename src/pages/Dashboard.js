import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      console.log("🔴 No token found. Redirecting to login...");
      navigate("/login");
    } else {
      // ✅ Decode Token to Extract User Data
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      console.log("✅ Decoded User Info:", decodedToken);

      setUser({
        email: decodedToken.email,
        username: decodedToken.preferred_username,
        firstName: decodedToken.given_name,
        lastName: decodedToken.family_name,
      });
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
    window.location.href = "/login"; // Redirect after logout
  };

  return (
    <div>
      <h1>Welcome to Dashboard</h1>
      {user ? (
        <>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>First Name:</strong> {user.firstName}</p>
          <p><strong>Last Name:</strong> {user.lastName}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Loading user info...</p>
      )}
    </div>
  );
};

export default Dashboard;
