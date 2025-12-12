# Microsoft Entra ID Setup (From Scratch)

This guide assumes you are starting fresh. Follow these steps to configure authentication for your application.

## 1. Create a Fresh App Registration in Azure

1.  Log in to the [Azure Portal](https://portal.azure.com/).
2.  Search for **Microsoft Entra ID**.
3.  Click **App registrations** > **New registration**.
4.  **Name**: `Grace App` (or your preferred name).
5.  **Supported account types**:
    *   Choose **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)**.
    *   *Why? This allows users from other organizations to sign in, which is standard for SaaS apps.*
6.  **Redirect URI**:
    *   Select **Single-page application (SPA)**.
    *   Enter your **Production URL**: `https://login.gracesoftware.co.za` (NO trailing slash!).
7.  Click **Register**.

## 2. Configure Authentication Settings

1.  In your new app's menu, click **Authentication**.
2.  Under **Platform configurations** > **Single-page application**:
    *   Ensure `https://login.gracesoftware.co.za` is listed.
    *   **Add URI**: Add `http://localhost:5173` to allow local testing.
3.  Scroll down to **Implicit grant and hybrid flows**:
    *   **Check** [x] Access tokens (used for implicit flows).
    *   **Check** [x] ID tokens (used for implicit and hybrid flows).
4.  Click **Save**.

## 3. Get Your IDs

1.  Go to the **Overview** blade.
2.  Copy the **Application (client) ID**.
3.  Copy the **Directory (tenant) ID**.

## 4. Configure Your Application

You must set these values in your environment variables.

### For Local Development (`.env`)
Create or edit `.env` in the project root:

```env
VITE_AZURE_CLIENT_ID=<Paste Client ID>
VITE_AZURE_TENANT_ID=<Paste Tenant ID>
VITE_API_URL=http://localhost:3001
```

### For Production (Azure Static Web Apps)
**Crucial Step:** Azure Static Web Apps does NOT read your local `.env`. You must set these in the portal.

1.  Go to your **Static Web App** resource in Azure Portal.
2.  Go to **Settings** > **Environment variables**.
3.  Add:
    *   `VITE_AZURE_CLIENT_ID`: (Your Client ID)
    *   `VITE_AZURE_TENANT_ID`: (Your Tenant ID)
4.  Click **Save**.

## 5. Verify the Code

1.  Go to `https://login.gracesoftware.co.za`.
2.  Attempt to sign in.
3.  If you get an error, check the URL bar. If it matches `https://login.gracesoftware.co.za`, then Azure MUST match that exactly.
