const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

console.log("🔹 ENV VARIABLES LOADED:");
console.log("KEYCLOAK_URL:", process.env.KEYCLOAK_URL);
console.log("KEYCLOAK_REALM:", process.env.KEYCLOAK_REALM);
console.log("KEYCLOAK_CLIENT_ID:", process.env.KEYCLOAK_CLIENT_ID);
console.log("KEYCLOAK_CLIENT_SECRET:", process.env.KEYCLOAK_CLIENT_SECRET);


dotenv.config();
const app = express();

// 🔹 CORS: Allow frontend to access backend API
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());
app.use(cookieParser());

// 🔹 PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 🔹 PostgreSQL Session Store
const pgStore = new pgSession({
  pool: pool,
  tableName: "session",
});

// ✅ Correct Keycloak Configuration
const keycloakConfig = {
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  bearerOnly: true,
  serverUrl: process.env.KEYCLOAK_URL,
  realm: process.env.KEYCLOAK_REALM,
  credentials: {
    secret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
};

// 🔹 Initialize Keycloak Middleware (Fixed)
const keycloak = new Keycloak({ store: pgStore }, keycloakConfig);

app.use(
  session({
    store: pgStore,
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 }, // 1 day
  })
);

// 🔹 Attach Keycloak Middleware
app.use(keycloak.middleware());

// ✅ Register Auth Routes (Login, Signup, Forgot Password)
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Keycloak Auth API is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
