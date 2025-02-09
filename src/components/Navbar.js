import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("refreshToken");
    window.location.href = "/login"; // Redirect to login after logout
  };

  return (
    <nav>
      <ul>
        {token ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><button onClick={logout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}
