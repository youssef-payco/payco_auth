const express = require("express");
require("dotenv").config();

const jwt = require("jsonwebtoken"); // Import JWT for secure tokens

const nodemailer = require("nodemailer");
const router = express.Router();

// ✅ Utility Function: Get Admin Token
async function getAdminToken() {
  const response = await fetch(`${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      client_id: "admin-cli",
      username: process.env.KEYCLOAK_ADMIN_USERNAME,
      password: process.env.KEYCLOAK_ADMIN_PASSWORD,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error("Failed to get admin token");
  }

  return data.access_token;
}

// 🔹 **Login Route (Password Grant Flow)**
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const tokenEndpoint = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

    console.log("🔹 Authenticating user in Keycloak...");

    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "password",
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        username: email,
        password,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token || !tokenData.refresh_token) {
      console.error("🔴 Authentication failed:", tokenData);
      return res.status(401).json({ error: "Invalid credentials", details: tokenData });
    }

    console.log("✅ User authenticated:", email);

    res.json({
      token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      user: { email },
    });
  } catch (error) {
    console.error("🔴 Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 **Signup Route**

router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, username } = req.body;

    // Step 1: Get Admin Token
    const access_token = await getAdminToken();

    // Step 2: Create User in Keycloak
    const createUserResponse = await fetch(
      `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email,
          firstName,
          lastName,
          enabled: true,
          emailVerified: false, // Ensure the user still needs verification
          credentials: [{ type: "password", value: password, temporary: false }],
        }),
      }
    );

    if (!createUserResponse.ok) {
      const errorDetails = await createUserResponse.json();
      console.error("🔴 Keycloak Signup Failed:", errorDetails);
      return res.status(400).json({ error: "Signup failed", details: errorDetails });
    }

    console.log("✅ User created successfully:", email);

    // Step 3: Get the User ID
    const userSearchResponse = await fetch(
      `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users?email=${email}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const users = await userSearchResponse.json();
    if (!users.length) {
      return res.status(500).json({ error: "User not found after creation." });
    }

    const userId = users[0].id;

    // Step 4: Generate a Secure Email Verification Token
    const verificationToken = jwt.sign(
      { sub: userId, email: email },
      process.env.JWT_SECRET, // Use a strong secret key
      { expiresIn: "12h" } // Token expires in 12 hours
    );

    // Step 5: Generate a Custom Verification Link
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?key=${verificationToken}`;
    console.log("✅ Email verification link:", verificationLink);

    // Step 6: Send Verification Email using Nodemailer (Mailgun)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Verify Your Email",
      text: `Click the link below to verify your email:\n\n${verificationLink}\n\nThis link expires in 12 hours.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Signup successful! Verification email sent." });

  } catch (error) {
    console.error("🔴 Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required." });
    }

    // Step 1: Get Admin Token
    const access_token = await getAdminToken();

    // Step 2: Decode Token (Extract User ID)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || !decoded.sub) {
        throw new Error("Invalid token.");
      }
    } catch (error) {
      return res.status(400).json({ error: "Invalid verification token." });
    }

    const userId = decoded.sub;

    // Step 3: Mark Email as Verified in Keycloak
    const verifyResponse = await fetch(
      `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailVerified: true,
        }),
      }
    );

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      throw new Error(`Failed to verify email: ${errorText}`);
    }

    console.log(`✅ Email verified for user: ${userId}`);
    res.json({ success: true, message: "Email successfully verified! Redirecting to login..." });

  } catch (error) {
    console.error("🔴 Email Verification Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});





router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Step 1: Get Admin Token
    const access_token = await getAdminToken();

    // Step 2: Find User by Email
    const userResponse = await fetch(
      `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users?email=${email}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const users = await userResponse.json();
    if (!users.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Step 3: Generate a Secure Reset Token (Valid for 15 minutes)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email }, 
      process.env.JWT_SECRET, // Use a strong secret key
      { expiresIn: "15m" } // Token expires in 15 minutes
    );

    // Step 4: Generate Reset Link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    console.log("✅ Secure password reset link:", resetLink);

    // ✅ Step 5: Send Email using Mailgun SMTP via Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Reset Your Password",
      text: `Click the link below to reset your password: \n\n ${resetLink} \n\n This link expires in 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent!" });
  } catch (error) {
    console.error("🔴 Forgot Password Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Step 1: Verify Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const userId = decoded.userId; // Extract userId securely

    // Step 2: Get Admin Token
    const access_token = await getAdminToken();

    // Step 3: Update Password in Keycloak
    const resetResponse = await fetch(
      `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${userId}/reset-password`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "password",
          value: newPassword,
          temporary: false,
        }),
      }
    );

    if (!resetResponse.ok) {
      const errorText = await resetResponse.text();
      throw new Error(`Failed to reset password: ${errorText}`);
    }

    console.log("✅ Password successfully reset for user:", userId);
    
    // Send success message indicating redirection
    res.json({ 
      success: true, 
      message: "Password successfully reset! Redirecting to login..." 
    });

  } catch (error) {
    console.error("🔴 Reset Password Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// 🔹 **Logout Route**
router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: "Missing refresh token" });
    }

    console.log("🔹 Logging out user...");

    const logoutUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`;

    const response = await fetch(logoutUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error("🔴 Failed to logout from Keycloak:", await response.text());
      return res.status(500).json({ error: "Failed to logout" });
    }

    console.log("✅ User logged out.");
    res.json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error("🔴 Logout Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
