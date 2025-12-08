# Microsoft Entra ID - Fresh Start Guide

Follow these steps exactly to set up "Sign In with Microsoft" from scratch.

## 1. Create App Registration (Azure Portal)

1.  Go to **Microsoft Entra ID** > **App registrations**.
2.  Click **New registration**.
3.  **Name**: `Grace Frontend` (or similar).
4.  **Supported account types**: "Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)".
5.  **Redirect URI**:
    *   Select **Single-page application (SPA)**.
    *   Enter: `https://login.craftsoftware.co.za`
    *   *(Note: Do NOT add /dashboard or /auth/callback. Just the root domain.)*
6.  Click **Register**.

## 2. Configure Redirect URIs

1.  In your new app, go to **Authentication** (left menu).
2.  Ensure `https://login.craftsoftware.co.za` is listed under **Single-page application**.
3.  **Add URI** (for local testing):
    *   `http://localhost:5173`
4.  Check the boxes for **Access tokens** and **ID tokens** (optional but recommended for implicit flow, though MSAL uses auth code flow with PKCE).
5.  Click **Save**.

## 3. Get Credentials

1.  Go to **Overview**.
2.  Copy the **Application (client) ID**.
3.  Copy the **Directory (tenant) ID**.

## 4. Configure Application

You need to update your environment variables with the new IDs.

### Local Development (`.env`)
Update your `src/joburg-committee-craft/.env` file:

```env
VITE_AZURE_CLIENT_ID=<Your_New_Client_ID>
VITE_AZURE_TENANT_ID=<Your_New_Tenant_ID>
```

### Production (Azure Static Web Apps)
1.  Go to your **Static Web App** in the Azure Portal.
2.  Go to **Environment variables**.
3.  Add/Update:
    *   `VITE_AZURE_CLIENT_ID`: (Paste your new Client ID)
    *   `VITE_AZURE_TENANT_ID`: (Paste your new Tenant ID)
4.  Click **Apply**.

## 5. Deploy

Push your changes to GitHub to trigger a rebuild so the app picks up the cleanup we did in code.

```bash
git add .
git commit -m "chore: clean auth config for fresh start"
git push
```
