import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TeamsNotificationRequest {
  organizationId: string;
  title: string;
  message: string;
  notificationType: string;
  metadata?: Record<string, any>;
  themeColor?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { organizationId, title, message, notificationType, metadata, themeColor } = await req.json() as TeamsNotificationRequest;

    console.log("Processing Teams notification request:", { organizationId, title, notificationType });

    // Get organization's Teams webhook URL
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("teams_webhook_url")
      .eq("id", organizationId)
      .single();

    if (orgError || !org) {
      throw new Error("Organization not found");
    }

    if (!org.teams_webhook_url) {
      throw new Error("Teams webhook URL not configured for this organization");
    }

    // Build Teams message card
    const card = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      summary: title,
      themeColor: themeColor || "0078D4",
      title: title,
      sections: [
        {
          text: message,
          facts: metadata ? Object.entries(metadata).map(([key, value]) => ({
            name: key,
            value: String(value),
          })) : [],
        },
      ],
    };

    console.log("Sending Teams notification to webhook");

    // Send notification to Teams
    const teamsResponse = await fetch(org.teams_webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(card),
    });

    const success = teamsResponse.ok;
    const errorMessage = success ? null : await teamsResponse.text();

    console.log("Teams notification result:", { success, status: teamsResponse.status });

    // Log notification to database
    await supabase.from("teams_notifications").insert({
      organization_id: organizationId,
      notification_type: notificationType,
      title,
      message,
      success,
      error_message: errorMessage,
      metadata,
    });

    if (!success) {
      throw new Error(`Teams webhook error: ${errorMessage}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Teams notification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
