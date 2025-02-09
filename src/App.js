import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";  
import ResetPassword from "./pages/ResetPassword";  
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";  // ✅ Added Email Verification Page

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  console.log("🟡 Token Found:", token);

  if (!token) {
    console.log("🔴 No token found. Redirecting to login...");
    return <Navigate to="/login" />;
  }

  console.log("✅ User is authenticated. Showing dashboard.");
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} /> {/* ✅ New Route for Email Verification */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
