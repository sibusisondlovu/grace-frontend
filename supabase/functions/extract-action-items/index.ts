import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcription, meetingId, speaker } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!transcription || !meetingId) throw new Error("Missing required fields");

    console.log("Extracting action items from transcription...");

    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("No authorization header");

    // Create Supabase client
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from auth token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Fetch meeting details
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, committee_id')
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) throw new Error("Meeting not found");

    const systemPrompt = `You are an AI assistant that extracts action items from meeting transcriptions.

Analyze the transcription and identify:
1. Tasks that need to be done
2. Decisions that require follow-up
3. Assignments mentioned
4. Deadlines or timeframes mentioned

For each action item, extract:
- Title (brief summary)
- Description (detailed context)
- Priority (high/medium/low)
- Suggested due date if mentioned
- Assigned person/department if mentioned

Return a JSON array of action items in this format:
[
  {
    "title": "Action item title",
    "description": "Detailed description",
    "priority": "high|medium|low",
    "assigned_to_department": "Department name if mentioned",
    "due_date": "YYYY-MM-DD if mentioned, otherwise null"
  }
]

If no action items are found, return an empty array: []`;

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
          { 
            role: "user", 
            content: `Speaker: ${speaker || 'Unknown'}\nTranscription: ${transcription}` 
          },
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const actionItemsText = data.choices[0].message.content;
    
    let actionItems = [];
    try {
      const parsed = JSON.parse(actionItemsText);
      actionItems = Array.isArray(parsed) ? parsed : (parsed.action_items || []);
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      actionItems = [];
    }

    console.log(`Found ${actionItems.length} action items`);

    // Insert action items into database
    if (actionItems.length > 0) {
      const itemsToInsert = actionItems.map((item: any) => ({
        meeting_id: meetingId,
        committee_id: meeting.committee_id,
        title: item.title || "Untitled action item",
        description: item.description || null,
        priority: item.priority || "medium",
        assigned_to_department: item.assigned_to_department || null,
        due_date: item.due_date || null,
        status: "pending",
      }));

      const { error: insertError } = await supabase
        .from('action_items')
        .insert(itemsToInsert);

      if (insertError) {
        console.error("Error inserting action items:", insertError);
        throw insertError;
      }

      console.log("Action items inserted successfully");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        actionItems,
        count: actionItems.length 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Extract action items error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
