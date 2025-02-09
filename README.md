
---

## API Routes

The backend exposes the following authentication endpoints under `/api/auth`:

- **POST `/api/auth/login`**  
  _Description:_ Authenticate a user using their email and password via Keycloak.  
  _Response:_ Returns an access token, refresh token, and user email.

- **POST `/api/auth/signup`**  
  _Description:_ Create a new user in Keycloak. After creation, an email verification token is generated and emailed to the user.  
  _Response:_ Returns a success message indicating that the verification email has been sent.

- **POST `/api/auth/verify-email`**  
  _Description:_ Verify a user's email address. The user receives a secure verification token via email. When the token is posted to this endpoint, the corresponding user’s email is marked as verified in Keycloak.  
  _Response:_ Returns a success message upon successful verification.

- **POST `/api/auth/forgot-password`**  
  _Description:_ Generate a password reset token for a user and send a reset link via email.  
  _Response:_ Returns a message indicating that the password reset email was sent.

- **POST `/api/auth/reset-password`**  
  _Description:_ Verify the password reset token and update the user's password in Keycloak.  
  _Response:_ Returns a success message upon a successful password reset.

- **POST `/api/auth/logout`**  
  _Description:_ Logout a user by invalidating their refresh token in Keycloak.  
  _Response:_ Returns a message confirming successful logout.

---

## Environment Variables

The backend uses a `.env` file (located in the `/backend` directory) to manage configuration settings. Key variables include:

- **Server & Database:**
  - `PORT`: The port on which the server runs (default is 5000).
  - `DATABASE_URL`: Connection string for PostgreSQL (used for session storage).

- **Session Security:**
  - `SESSION_SECRET`: Secret key for Express session.
  - `SESSION_EXPIRY`: Session expiration time in milliseconds.

- **Keycloak Configuration:**
  - `KEYCLOAK_URL`: URL of your Keycloak instance.
  - `KEYCLOAK_REALM`: The Keycloak realm (e.g., `payco-realm`).
  - `KEYCLOAK_CLIENT_ID`: Client ID used by your application.
  - `KEYCLOAK_CLIENT_SECRET`: Client secret for the Keycloak client.
  - `KEYCLOAK_ADMIN_USERNAME` & `KEYCLOAK_ADMIN_PASSWORD`: Credentials for the Keycloak admin account.

- **JWT & Security:**
  - `JWT_SECRET`: A strong secret key for signing JWT tokens.
  - `JWT_EXPIRATION`: JWT token expiration time (e.g., `1d`).

- **Email (SMTP) Settings:**
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: SMTP server configuration (Mailgun settings in this example).
  - `SMTP_FROM`: The email address from which verification/reset emails are sent.
  - `FRONTEND_URL`: URL of your React frontend (e.g., `http://localhost:5173`).

Make sure to update these variables with your production or development credentials as required.

---

## Setup & Installation
npm server.js - Terminal
npm start - Terminal 2
### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- A PostgreSQL database (for session storage)
- A running Keycloak instance configured with a realm and client
- SMTP credentials (e.g., from Mailgun) for sending emails

### Installation Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/PAYCO-AUTH.git
   cd PAYCO-AUTH
