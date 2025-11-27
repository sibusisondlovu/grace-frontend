import { PublicClientApplication, AccountInfo } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "../authConfig";

// Initialize MSAL instance (outside of component to avoid recreation)
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize the instance and handle redirect
msalInstance.initialize().then(() => {
    // Handle redirect promise to process authentication responses
    msalInstance.handleRedirectPromise().catch((error) => {
        console.error("Error handling redirect:", error);
    });
});

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
    private getAccount(): AccountInfo | null {
        const currentAccounts = msalInstance.getAllAccounts();
        if (currentAccounts.length > 0) {
            return currentAccounts[0];
        }
        return null;
    }

    private async getAccessToken(): Promise<string | null> {
        // 1. Check for local token (Email/Password login)
        const localToken = localStorage.getItem('grace_token');
        if (localToken) {
            return localToken;
        }

        // 2. Fallback to MSAL (Microsoft login)
        const account = this.getAccount(); // Use the existing getAccount method
        if (!account) {
            // If no MSAL account, and no local token, then no token is available.
            // The original method returned null here, so we'll maintain that behavior
            // rather than throwing an error, to align with the original method's signature.
            return null;
        }

        try {
            const response = await msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: account
            });
            return response.accessToken;
        } catch (error) {
            console.error("Silent token acquisition failed", error);
            // Fallback to interaction would happen in the UI/Auth provider
            return null;
        }
    }

    private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
        const token = await this.getAccessToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        // Ensure proper URL construction with slashes
        const baseUrl = API_BASE_URL.replace(/\/$/, '');
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${baseUrl}${path}`;

        console.log(`Making request to: ${url}`);

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // Mimic Supabase's basic query structure for easier migration
    // This is a simplified builder pattern
    from(table: string) {
        return {
            select: async (columns: string = '*') => {
                // This maps to the generic GET /api/:table endpoint
                // We'll pass query params to filter/select
                // Note: The backend generic endpoint needs to support these params
                return this.get(`/api/${table}?columns=${columns}`);
            },
            insert: async (data: any) => {
                return this.post(`/api/${table}`, data);
            },
            update: async (data: any) => {
                // Update requires an ID or condition, usually passed in a separate .eq() chain in Supabase
                // For this simple shim, we'll assume the user handles the logic or we extend this builder
                // But for now, let's just expose the raw method
                return this.patch(`/api/${table}`, data);
            },
            delete: async () => {
                return this.delete(`/api/${table}`);
            }
        };
    }

    async get(endpoint: string) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async patch(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint: string) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient();
