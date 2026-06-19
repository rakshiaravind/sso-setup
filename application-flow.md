# Application SSO Flow

This document explains the overall authentication and Single Sign-On (SSO) flow for the Multi-Site SSO Ecosystem.

## Architecture Components

The application consists of the following key components:

1.  **OpenLDAP (Backend User Database)**: The central source of truth for user identities and credentials.
2.  **Keycloak (OIDC Identity Provider & SSO Gateway)**: Connects to OpenLDAP via user federation. It handles the actual authentication process and issues JSON Web Tokens (JWTs) using the OpenID Connect (OIDC) protocol.
3.  **Frontend Applications (React / Vite)**:
    *   **Company Portal (`sso-site`)** on port `5173`
    *   **HR Hub (`sso-hr`)** on port `5174`
    *   **IT Support Desk (`sso-it`)** on port `5175`

## 1. Initial Login Flow (Authorization Code Flow with PKCE)

When a user tries to access any of the frontend applications for the first time:

1.  **Access Request**: The user navigates to an application (e.g., Company Portal on `http://localhost:5173`).
2.  **Redirect to Keycloak**: The React application detects that the user is unauthenticated. Using the `react-oidc-context` library, it redirects the browser to the Keycloak SSO gateway (`http://localhost:8050`).
3.  **Authentication Prompt**: Keycloak presents a login screen to the user.
4.  **Credential Validation**: The user enters their username and password. Keycloak validates these credentials. If OpenLDAP federation is configured, Keycloak checks the credentials against the OpenLDAP directory.
5.  **Authorization Code**: Upon successful login, Keycloak redirects the user's browser back to the Company Portal along with a temporary authorization code.
6.  **Token Exchange**: The React application exchanges this authorization code for an ID Token and Access Token (JWTs) via a secure PKCE flow.
7.  **Authenticated State**: The user is now successfully logged into the Company Portal.

## 2. Silent SSO Flow (Auto-Login across Apps)

This is the core of the Single Sign-On experience. Now that the user is logged into the Company Portal, let's see what happens when they visit a second app:

1.  **Navigate to Second App**: The user navigates to the HR Hub (`http://localhost:5174`).
2.  **Silent Check**: The HR Hub application loads. Instead of immediately redirecting the user to a Keycloak login page, it runs a background check.
3.  **Hidden Iframe (`signinSilent`)**: The app uses a hidden iframe to communicate with Keycloak (`auth.signinSilent()`). It checks if there is already an active global session for this user in Keycloak.
4.  **Instant Login**: Because the user logged in earlier via the Company Portal, Keycloak confirms the active session and silently returns a new set of tokens specifically for the HR Hub application.
5.  **Seamless Experience**: The user is instantly logged into the HR Hub without ever seeing a login screen or entering credentials again.

## 3. Global Sign-Out Flow

1.  **Initiate Logout**: The user clicks the "Log Out" button on *any* of the connected applications (e.g., IT Support Desk).
2.  **Redirect to Keycloak**: The application redirects the browser to Keycloak to terminate the global session (`auth.signoutRedirect()`).
3.  **Session Terminated**: Keycloak destroys the central SSO session for that user.
4.  **Graceful Expiration for Other Apps**: The other applications (Company Portal and HR Hub) are continuously monitoring the session state. When they attempt to renew their tokens or check session status, they will receive a "Session not active" error.
5.  **Return to Login**: Upon detecting the terminated session, the other apps will gracefully drop the user back to the login screen, ensuring security across the entire ecosystem.
