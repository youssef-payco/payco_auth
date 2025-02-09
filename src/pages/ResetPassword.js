import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate(); // Hook to navigate to login

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
        token, 
        newPassword,
      });

      setMessage(response.data.message);

      // If password reset is successful, redirect to login after 3 seconds
      if (response.data.success) {
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setMessage("Failed to reset password. Try again.");
      console.error("🔴 Reset Password Error:", error);
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <input 
        type="password" 
        placeholder="New Password" 
        value={newPassword} 
        onChange={(e) => setNewPassword(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Confirm Password" 
        value={confirmPassword} 
        onChange={(e) => setConfirmPassword(e.target.value)} 
      />
      <button onClick={handleResetPassword}>Reset Password</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;
