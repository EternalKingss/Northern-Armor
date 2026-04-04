import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRequest {
  userId: string;
  rawText: string;
}

const IMPORT_SYSTEM_PROMPT = `You are an expert fitness program parser and coach. The user will paste raw text from a workout spreadsheet, Google Doc, or any other source. Your job is to:

1. Parse whatever workout structure exists in the text
2. Fix issues: standardize exercise names, fill in missing sets/reps with reasonable defaults, normalize rest times
3. Convert it into a structured 8-week program following progressive overload principles
4. If the source has only 1 week of workouts, repeat them for 8 weeks with gradual RPE/volume progression
5. If the source has a different number of weeks, intelligently extend or condense to 8 weeks

Output ONLY a valid JSON object with this exact structure, no markdown, no explanation:
{
  "programName": "string",
  "description": "string",
  "daysPerWeek": number,
  "weeks": [
    {
      "week": 1,
      "block": "Foundation Phase",
      "days": [
        {
          "name": "string (e.g. Push Day)",
          "focus": "string (e.g. Chest, Shoulders, Triceps)",
          "exercises": [
            {
              "name": "string",
              "workingSets": number,
              "reps": "string (e.g. 8-10)",
              "lastSetRPE": "string (e.g. 8)",
              "rest": "string (e.g. 90 sec)",
              "notes": "string (optional form cues)"
            }
          ]
        }
      ]
    }
  ]
}

Periodization blocks:
- Weeks 1-2: Foundation Phase (RPE 6-7, learn movements)
- Weeks 3-4: Building Phase (RPE 7-8, add volume)
- Weeks 5-6: Intensity Phase (RPE 8-9, push harder)
- Weeks 7-8: Peak & Deload (Week 7 peak, Week 8 deload at RPE 6-7)

Make reasonable assumptions when data is missing. The program must be safe and effective.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );

    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: userRow } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', authUser.id)
      .single();

    if (!userRow || userRow.subscription_status !== 'active') {
      return new Response(JSON.stringify({ error: 'Subscription required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY') || Deno.env.get('claude code');

    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key is not configured.');
    }

    const { rawText }: ImportRequest = await req.json();

    if (!rawText || rawText.trim().length < 10) {
      return new Response(JSON.stringify({ success: false, error: 'Please provide workout content to import.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: IMPORT_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Parse and convert this workout program:\n\n${rawText}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const claudeResponse = await response.json();
    const rawContent: string = claudeResponse.content[0].text;

    // Strip markdown code fences if present
    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                      rawContent.match(/```\s*([\s\S]*?)\s*```/) ||
                      [null, rawContent];
    const jsonString = (jsonMatch[1] || rawContent).trim();

    const workoutPlan = JSON.parse(jsonString);

    return new Response(
      JSON.stringify({ success: true, workoutPlan, generatedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error in import-workout:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to import workout' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
