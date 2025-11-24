# Azure Entra ID Configuration Guide

To enable authentication with Microsoft Entra ID (formerly Azure AD), you need to register an application in the Azure Portal and configure your environment variables.

## 1. Register an Application in Azure Portal

1.  Go to the [Azure Portal](https://portal.azure.com/).
2.  Search for **Microsoft Entra ID**.
3.  Select **App registrations** > **New registration**.
4.  **Name**: Enter a name (e.g., "Joburg Committee Craft").
5.  **Supported account types**: Select **Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)** (or Single tenant if internal only).
6.  **Redirect URI**:
    -   Select **Single-page application (SPA)**.
    -   Enter `http://localhost:5173` (or your production URL).
7.  Click **Register**.

## 2. Configure Authentication

1.  In your new app registration, go to **Authentication**.
2.  Under **Implicit grant and hybrid flows**, check **Access tokens** and **ID tokens**.
3.  Click **Save**.

## 3. API Permissions

1.  Go to **API permissions**.
2.  Ensure **User.Read** (Microsoft Graph) is present.
3.  Click **Grant admin consent** if required for your tenant.

## 4. Get Configuration Values

Copy the following values from the **Overview** page:
-   **Application (client) ID**
-   **Directory (tenant) ID**

## 5. Update Environment Variables

### Frontend (`.env`)
Update or create `.env` in the root directory:

```env
VITE_AZURE_CLIENT_ID=your_client_id_here
VITE_AZURE_TENANT_ID=your_tenant_id_here
VITE_API_URL=http://localhost:3001
```

### Backend (`server/.env`)
Update `server/.env`:

```env
AZURE_CLIENT_ID=your_client_id_here
AZURE_TENANT_ID=your_tenant_id_here
```

## 6. Update Code Configuration

Open `src/authConfig.ts` and ensure it uses the environment variables:

```typescript
export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
        redirectUri: window.location.origin,
    },
    // ...
};
```
*(Note: I have already updated `src/authConfig.ts` to use placeholders, please update it to use `import.meta.env` or hardcode values for testing)*
