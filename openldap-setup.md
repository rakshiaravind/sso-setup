# Setting up OpenLDAP User Federation with Keycloak

To start using OpenLDAP as the source of truth for your users, you need to do two things: create a user in your OpenLDAP database, and then tell Keycloak to sync users from that database. 

Since the `docker-compose.yml` already includes `phpldapadmin`, you can use its web interface to easily create OpenLDAP users without needing any command-line tools.

## Step 1: Create a User in OpenLDAP (via phpLDAPadmin)

1. Open your browser and navigate to the phpLDAPadmin interface: **`http://localhost:8933`**
2. Click **login** on the left menu.
3. Log in with the default admin credentials (configured in your `docker-compose.yml`):
   - **Login DN**: `cn=admin,dc=example,dc=org`
   - **Password**: `admin`
4. In the left tree-view menu, expand `dc=example,dc=org`.
5. **Create an Organizational Unit (OU) for users (Optional but recommended):**
   - Click on `dc=example,dc=org` and select **Create a child entry**.
   - Choose **Generic: Organisational Unit**.
   - Set the `ou` to **users** and click **Create Object**, then **Commit**.
6. **Create a Group (Required for User Accounts):**
   - Click on the new `ou=users` entry on the left menu.
   - Select **Create a child entry**.
   - Choose **Generic: Posix Group**.
   - For the **Group name**, type `employees`.
   - Click **Create Object** and then **Commit**.
7. **Create the User:**
   - Click on the `ou=users` entry again.
   - Select **Create a child entry**.
   - Choose **Generic: User Account**.
   - Fill in the required details:
     - **GID Number**: Select the `employees` group you just created from the dropdown.
     - **Common Name (cn)**: e.g., `John Doe`
     - **User ID (uid)**: e.g., `johndoe` (this will be the login username)
     - **Last Name (sn)**: e.g., `Doe`
     - **Password**: Enter a secure password for this user.
   - Click **Create Object**, then **Commit**.

You now have a user existing directly inside your OpenLDAP database!

---

## Step 2: Configure Keycloak to Use OpenLDAP

Now you need to configure Keycloak's "User Federation" to connect to OpenLDAP and pull in the users.

1. Open Keycloak's Admin Console: **`http://localhost:8050`**
2. Log in with your admin credentials (username: `admin`, password: `admin`).
3. In the left menu, select **User federation**.
4. Click **Add new provider** and select **LDAP**.
5. Fill in the connection settings exactly like this (based on your Docker network):
   - **Vendor**: `Other`
   - **Connection URL**: `ldap://openldap:389`
   - **Users DN**: `ou=users,dc=example,dc=org` *(Use `dc=example,dc=org` if you didn't create the 'users' OU in step 1)*
   - **Bind Type**: `simple`
   - **Bind DN**: `cn=admin,dc=example,dc=org`
   - **Bind Credential**: `admin`
6. Scroll to the bottom and click **Save**.
7. Once saved, click the **Action** dropdown at the top right of the page (or click the **Synchronize all users** button at the bottom).
8. You should see a success message saying users were imported.

---

## Step 3: Verify the Setup

1. In the Keycloak left menu, click on **Users**.
2. Search for the user (`johndoe`) you created in OpenLDAP, or simply view all users. 
3. You should see your OpenLDAP user listed there!

Now, you can log out of the admin console and try logging into any of your React applications (like `http://localhost:5173`) using the `johndoe` credentials. Keycloak will verify the password directly against your OpenLDAP container.
