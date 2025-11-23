import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Note: Email sending temporarily disabled - integrate with your email provider
const sendEmail = async (to: string, subject: string, html: string) => {
  console.log('Email would be sent to:', to, 'Subject:', subject);
  // TODO: Integrate with email provider (SendGrid, AWS SES, etc.)
  return { success: true };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  organizationId: string;
  recipientEmail?: string;
  recipientId?: string;
  subject: string;
  title: string;
  message: string;
  notificationType: "action_item" | "meeting_scheduled" | "action_assigned" | "meeting_reminder";
  metadata?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const {
      organizationId,
      recipientEmail,
      recipientId,
      subject,
      title,
      message,
      notificationType,
      metadata = {},
    }: EmailNotificationRequest = await req.json();

    // Validate required fields
    if (!organizationId || !subject || !title || !message || !notificationType) {
      throw new Error("Missing required fields");
    }

    // Determine recipient email
    let emailTo = recipientEmail;
    
    if (!emailTo && recipientId) {
      // Fetch recipient email from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", recipientId)
        .single();

      if (profileError || !profile?.email) {
        console.error("Failed to fetch recipient email:", profileError);
        throw new Error("Could not find recipient email");
      }

      emailTo = profile.email;
    }

    if (!emailTo) {
      throw new Error("No recipient email provided");
    }

    // Fetch organization details for branding
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("name, primary_color")
      .eq("id", organizationId)
      .single();

    const orgName = organization?.name || "Committee Management System";
    const primaryColor = organization?.primary_color || "#0EA5E9";

    // Build metadata HTML
    let metadataHtml = "";
    if (Object.keys(metadata).length > 0) {
      metadataHtml = "<div style='margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;'>";
      for (const [key, value] of Object.entries(metadata)) {
        metadataHtml += `<p style='margin: 5px 0;'><strong>${key}:</strong> ${value}</p>`;
      }
      metadataHtml += "</div>";
    }

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${primaryColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${orgName}</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: ${primaryColor}; margin-top: 0;">${title}</h2>
            
            <div style="margin: 20px 0; white-space: pre-wrap;">${message}</div>
            
            ${metadataHtml}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              <p style="margin: 5px 0;">This is an automated notification from ${orgName}.</p>
              <p style="margin: 5px 0;">Please do not reply to this email.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
            <p>&copy; ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    // Send email
    const emailResult = await sendEmail(emailTo, subject, htmlContent);

    if (!emailResult.success) {
      console.error("Failed to send email");
      throw new Error("Failed to send email");
    }

    console.log("Email sent successfully");

    // Log the notification in database
    try {
      await supabase.from("email_notifications").insert({
        organization_id: organizationId,
        recipient_email: emailTo,
        recipient_id: recipientId,
        subject: subject,
        notification_type: notificationType,
        metadata: metadata,
        status: "sent",
        sent_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error("Failed to log email notification:", logError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email notification logged (email provider not configured)"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
