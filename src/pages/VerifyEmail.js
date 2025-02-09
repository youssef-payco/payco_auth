import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("key"); // Get token from URL

      if (!token) {
        setMessage("Invalid verification link.");
        return;
      }

      try {
        const response = await axios.post("http://localhost:5000/api/auth/verify-email", {
          token,
        });

        setMessage(response.data.message);

        // Redirect user to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setMessage("Email verification failed. Try again.");
        console.error("🔴 Verification Error:", error);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
