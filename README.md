# Multi-Site SSO Ecosystem with Keycloak and OpenLDAP

This project is a complete, containerized Single Sign-On (SSO) ecosystem. It uses OpenLDAP for central user management, Keycloak as the OIDC Identity Provider, and three separate React/Vite frontends to demonstrate seamless authentication across multiple applications.



## Architecture

1. **OpenLDAP**: The backend database storing user accounts.
2. **phpLDAPadmin**: A web interface available at `http://localhost:8933` to easily manage OpenLDAP users.

username: cn=admin,dc=example,dc=org
password: admin

3. **Keycloak**: The SSO gateway available at `http://localhost:8050` that authenticates users and issues OIDC tokens.
4. **Company Portal (`sso-site`)**: React application running on port `5173`.
5. **HR Hub (`sso-hr`)**: React application running on port `5174`.
6. **IT Support Desk (`sso-it`)**: React application running on port `5175`.

---

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed.
- [Node.js](https://nodejs.org/) installed for running the frontend applications.

---

## Step 1: Start the Backend Services

1. Open a terminal in the root directory.
2. Run the Docker Compose stack:
   ```bash
   docker-compose up -d
   ```
3. Wait approximately 60 seconds for Keycloak to finish initializing its database.

---

## Step 2: Configure Keycloak

### A. Create the OIDC Clients
For each of the three React applications, you must create a Client inside Keycloak so it can authorize logins. Log in to Keycloak (`http://localhost:8050`) with username: `admin`, password: `admin`.

**Client 1: Company Portal**
1. In the left menu, click **Clients** -> **Create client**.
2. **Client type**: `OpenID Connect`
3. **Client ID**: `sso-site-client`
4. Click **Next** -> turn off **Client authentication** -> Click **Next**.
5. **Valid redirect URIs**: `http://localhost:5173/*`
6. **Web origins**: `http://localhost:5173` *(Crucial for avoiding CORS errors)*
7. Click **Save**.

**Client 2: HR Hub**
Repeat the steps above but use:
- **Client ID**: `sso-hr-client`
- **Valid redirect URIs**: `http://localhost:5174/*`
- **Web origins**: `http://localhost:5174`

**Client 3: IT Support**
Repeat the steps above but use:
- **Client ID**: `sso-it-client`
- **Valid redirect URIs**: `http://localhost:5175/*`
- **Web origins**: `http://localhost:5175`

### B. Add OpenLDAP Federation (Optional)
To sync users from the OpenLDAP container:
1. In the left menu, select **User federation**.
2. Click **Add new provider** and select **LDAP**.
3. Configure the LDAP provider:
   - Vendor: `Other`
   - Connection URL: `ldap://openldap:389`
   - Users DN: `dc=example,dc=org`
   - Bind DN: `cn=admin,dc=example,dc=org`
   - Bind Credential: `admin`
4. Save and click **Synchronize all users**.

### C. Create a Test User
If you didn't configure LDAP, create a user directly in Keycloak:
1. Go to **Users** -> **Add user**. Set a username (e.g., `testuser`).
2. Go to the **Credentials** tab, click **Set password**. Provide a password and set "Temporary" to **Off**.

---

## Step 3: Run the Frontend Applications

You must run the three React servers simultaneously. Open three separate terminal windows.

**Terminal 1:**
```bash
cd sso-site
npm install
npm run dev
```

**Terminal 2:**
```bash
cd sso-hr
npm install
npm run dev
```

**Terminal 3:**
```bash
cd sso-it
npm install
npm run dev
```

---

## Features Implemented

- **OIDC Authentication**: Uses standard OpenID Connect via `react-oidc-context`.
- **Silent SSO (Auto-Login)**: Each app checks for an active Keycloak session automatically in the background using a hidden iframe (`auth.signinSilent()`). If you log into the Company Portal and navigate to the HR Hub, the HR Hub will automatically sign you in instantly!
- **Global Sign-Out**: Clicking "Log Out" on any application securely terminates the global Keycloak session (`auth.signoutRedirect()`), logging the user out of all apps.
- **Graceful Session Expiration**: If the session is terminated on one app, the other apps silently detect the `"Session not active"` error and drop the user back to the login screen without showing a jarring error page.
