import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { meetingId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!meetingId) throw new Error("meetingId is required");

    console.log("Generating minutes for meeting:", meetingId);

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

    // Fetch meeting details
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select(`
        id,
        title,
        meeting_date,
        venue,
        meeting_type,
        status,
        committees(name, type)
      `)
      .eq('id', meetingId)
      .single();

    if (meetingError) {
      console.error("Error fetching meeting:", meetingError);
      throw new Error("Failed to fetch meeting details");
    }

    if (!meeting) throw new Error("Meeting not found");

    // Fetch agenda items
    const { data: agendaItems, error: agendaError } = await supabase
      .from('agenda_items')
      .select(`
        id,
        item_number,
        title,
        description,
        item_type,
        status,
        order_index,
        requires_vote,
        estimated_duration
      `)
      .eq('meeting_id', meetingId)
      .order('order_index', { ascending: true });

    if (agendaError) {
      console.error("Error fetching agenda items:", agendaError);
      throw new Error("Failed to fetch agenda items");
    }

    // Fetch decisions
    const { data: decisions, error: decisionsError } = await supabase
      .from('decisions_register')
      .select(`
        id,
        decision_number,
        decision_type,
        decision_text,
        owner_department,
        due_date,
        priority,
        status
      `)
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true });

    if (decisionsError) {
      console.error("Error fetching decisions:", decisionsError);
      throw new Error("Failed to fetch decisions");
    }

    // Fetch attendance
    const { data: attendance, error: attendanceError } = await supabase
      .from('meeting_attendance')
      .select(`
        id,
        attendance_status,
        profiles(first_name, last_name)
      `)
      .eq('meeting_id', meetingId);

    if (attendanceError) {
      console.error("Error fetching attendance:", attendanceError);
    }

    // Fetch session transcriptions
    const { data: sessions, error: sessionsError } = await supabase
      .from('meeting_sessions')
      .select('speakers_queue')
      .eq('meeting_id', meetingId);

    let transcriptionsText = '';
    if (sessions && sessions.length > 0 && sessions[0].speakers_queue) {
      const transcriptions = sessions[0].speakers_queue as any[];
      if (transcriptions.length > 0) {
        transcriptionsText = transcriptions.join('\n\n');
      }
    }

    // Build context for AI
    const meetingContext = `
Meeting Details:
- Title: ${meeting.title}
- Committee: ${meeting.committees?.name || 'Unknown Committee'} (${meeting.committees?.type || 'Unknown Type'})
- Date: ${new Date(meeting.meeting_date).toLocaleString()}
- Venue: ${meeting.venue || 'Not specified'}
- Type: ${meeting.meeting_type}
- Status: ${meeting.status}

Attendance:
${attendance && attendance.length > 0 
  ? attendance.map(a => `- ${a.profiles?.first_name} ${a.profiles?.last_name}: ${a.attendance_status}`).join('\n')
  : '- No attendance records available'}

Agenda Items:
${agendaItems && agendaItems.length > 0 
  ? agendaItems.map(item => `
${item.item_number}. ${item.title}
   Type: ${item.item_type}
   Status: ${item.status}
   ${item.description ? `Description: ${item.description}` : ''}
   ${item.requires_vote ? 'Requires Vote: Yes' : ''}
   ${item.estimated_duration ? `Duration: ${item.estimated_duration} minutes` : ''}
`).join('\n')
  : '- No agenda items available'}

Decisions and Resolutions:
${decisions && decisions.length > 0 
  ? decisions.map(d => `
${d.decision_number}. ${d.decision_type}
   Decision: ${d.decision_text}
   ${d.owner_department ? `Responsible: ${d.owner_department}` : ''}
   ${d.due_date ? `Due Date: ${new Date(d.due_date).toLocaleDateString()}` : ''}
   Priority: ${d.priority}
   Status: ${d.status}
`).join('\n')
  : '- No decisions recorded'}

${transcriptionsText ? `
Discussion Transcriptions:
${transcriptionsText}
` : ''}
`;

    console.log("Context prepared, calling AI...");

    const systemPrompt = `You are a professional minutes writer for municipal government meetings. 
Your task is to generate formal, well-structured meeting minutes based on the provided meeting information.

Guidelines:
1. Use formal, professional language appropriate for government records
2. Structure the minutes with clear sections: Meeting Details, Attendance, Agenda Items, Decisions, and Closing
3. For each agenda item, summarize the discussion and outcome
4. For decisions, clearly state the resolution number, decision text, responsible party, and deadlines
5. Be concise but comprehensive
6. Use proper formatting with headers, bullet points, and numbering
7. Include all relevant details from the context provided
8. Follow standard municipal meeting minutes format

Format the output as a clean, readable document that can be directly used as official minutes.`;

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
            content: `Generate professional meeting minutes based on the following information:\n\n${meetingContext}` 
          },
        ],
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

    const data = await response.json();
    const generatedMinutes = data.choices[0].message.content;

    console.log("Minutes generated successfully");

    return new Response(JSON.stringify({ minutes: generatedMinutes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Generate minutes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
