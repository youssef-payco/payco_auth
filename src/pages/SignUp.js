import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth"; // Import authentication functions

export default function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(""); // ✅ Store success message
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const response = await signup(email, username, firstName, lastName, password);
      setLoading(false);
      
      // ✅ Show success message
      setMessage("Signup successful! Please check your email to verify your account.");
      
      // ✅ Redirect after 5 seconds
      setTimeout(() => navigate("/login"), 5000);
    } catch (error) {
      setLoading(false);
      setError("Signup failed. Please try again.");
      console.error("🔴 Signup Error:", error);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {message && <p style={{ color: "green" }}>{message}</p>} {/* ✅ Show success message */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSignup}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Signing up..." : "Sign Up"}</button>
      </form>
      <p>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
}
