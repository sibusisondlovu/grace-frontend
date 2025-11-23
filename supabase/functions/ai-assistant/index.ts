import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userRole } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("No authorization header");

    // Create Supabase client with user's auth
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from auth token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Get user's committees and roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role, committee_id')
      .eq('user_id', user.id);

    const roles = userRoles?.map(r => r.role) || [];
    const committeeIds = userRoles?.filter(r => r.committee_id).map(r => r.committee_id) || [];

    // Build context based on user's last message
    const lastMessage = messages[messages.length - 1]?.content || "";
    let context = "";

    // Search for relevant documents
    if (lastMessage.toLowerCase().includes('document') || lastMessage.toLowerCase().includes('report')) {
      const { data: documents } = await supabase
        .from('meeting_documents')
        .select(`
          id,
          title,
          document_type,
          created_at,
          meetings!inner(
            title,
            meeting_date,
            committee_id,
            committees(name)
          )
        `)
        .in('meetings.committee_id', committeeIds.length > 0 ? committeeIds : ['00000000-0000-0000-0000-000000000000'])
        .limit(5)
        .order('created_at', { ascending: false });

      if (documents && documents.length > 0) {
        context += "\n\nRecent Documents:\n" + documents.map(d => 
          `- ${d.title} (${d.document_type}) from ${d.meetings?.committees?.name || 'Unknown Committee'} on ${new Date(d.meetings?.meeting_date || '').toLocaleDateString()}`
        ).join('\n');
      }
    }

    // Search for action items
    if (lastMessage.toLowerCase().includes('action') || lastMessage.toLowerCase().includes('task')) {
      const { data: actions } = await supabase
        .from('action_items')
        .select(`
          id,
          title,
          status,
          priority,
          due_date,
          committees(name)
        `)
        .in('committee_id', committeeIds.length > 0 ? committeeIds : ['00000000-0000-0000-0000-000000000000'])
        .limit(5)
        .order('created_at', { ascending: false });

      if (actions && actions.length > 0) {
        context += "\n\nRecent Action Items:\n" + actions.map(a => 
          `- ${a.title} (${a.status}, ${a.priority} priority) - Due: ${a.due_date ? new Date(a.due_date).toLocaleDateString() : 'Not set'} - Committee: ${a.committees?.name || 'Unknown'}`
        ).join('\n');
      }
    }

    // Search for meetings
    if (lastMessage.toLowerCase().includes('meeting') || lastMessage.toLowerCase().includes('agenda')) {
      const { data: meetings } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          meeting_date,
          status,
          committees(name)
        `)
        .in('committee_id', committeeIds.length > 0 ? committeeIds : ['00000000-0000-0000-0000-000000000000'])
        .limit(5)
        .order('meeting_date', { ascending: false });

      if (meetings && meetings.length > 0) {
        context += "\n\nRecent Meetings:\n" + meetings.map(m => 
          `- ${m.title} (${m.status}) on ${new Date(m.meeting_date).toLocaleDateString()} - Committee: ${m.committees?.name || 'Unknown'}`
        ).join('\n');
      }
    }

    // Search for resolutions/motions
    if (lastMessage.toLowerCase().includes('resolution') || lastMessage.toLowerCase().includes('motion')) {
      const { data: motions } = await supabase
        .from('motions')
        .select(`
          id,
          title,
          motion_type,
          status,
          outcome,
          notice_date,
          committees(name)
        `)
        .in('committee_id', committeeIds.length > 0 ? committeeIds : ['00000000-0000-0000-0000-000000000000'])
        .limit(5)
        .order('notice_date', { ascending: false });

      if (motions && motions.length > 0) {
        context += "\n\nRecent Motions/Resolutions:\n" + motions.map(m => 
          `- ${m.title} (${m.motion_type}, ${m.status}) - Outcome: ${m.outcome || 'Pending'} - Committee: ${m.committees?.name || 'Unknown'}`
        ).join('\n');
      }
    }

    const systemPrompt = `You are a helpful AI assistant for GRACE (Government Reporting And Committee Execution). 
You help users retrieve committee documents, previous resolutions, and agenda statuses.

User's Role: ${roles.join(', ') || 'No specific role'}
User has access to ${committeeIds.length} committee(s).

IMPORTANT: Only provide information from the context provided below. If information is not available in the context, politely inform the user that you don't have access to that information or that it wasn't found in recent records.

Available Context:${context || '\n\nNo specific records found for this query. The user may need to refine their search or check if they have access to the relevant committees.'}

Be concise, helpful, and professional. Format your responses clearly with bullet points when listing items.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
