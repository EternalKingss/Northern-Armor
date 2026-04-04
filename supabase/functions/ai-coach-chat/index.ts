import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  userId: string;
  messages: ChatMessage[];
}

interface WorkoutQuestionnaire {
  fitnessGoal: 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance' | 'general_fitness';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  sessionDuration: number;
  equipment: string[];
  injuries: string[];
  preferences: string[];
}

interface ChatResponse {
  reply: string;
  readyToGenerate: boolean;
  questionnaire: WorkoutQuestionnaire | null;
}

const SYSTEM_PROMPT = `You are Coach AI, an expert personal trainer for the Northern Armor fitness app. Your job is to have a friendly, natural conversation to collect the information needed to build a personalized workout program.

You need to collect these 6 things through conversation (one topic at a time):
1. fitnessGoal: one of [muscle_gain, fat_loss, strength, endurance, general_fitness]
2. experienceLevel: one of [beginner, intermediate, advanced]
3. daysPerWeek: number between 2-6
4. sessionDuration: minutes per session (30-120)
5. equipment: array from [barbell, dumbbells, cables, machines, pullup_bar, kettlebells, resistance_bands, bodyweight]
6. injuries: array from [lower_back, shoulders, knees, wrists, neck, hips] or empty array if none

Rules:
- Be warm, motivating, and conversational — like a real coach texting their client
- Keep each reply to 2-3 sentences maximum
- Ask ONE question at a time
- After the user answers a question, acknowledge their answer briefly then ask the next question
- Once you have all 6 pieces of information, respond with your final message and include a JSON block

When you have all information, end your reply with this exact JSON block (no markdown, just raw JSON on its own line):
READY_TO_GENERATE:{"fitnessGoal":"...","experienceLevel":"...","daysPerWeek":N,"sessionDuration":N,"equipment":["..."],"injuries":["..."],"preferences":[]}

Example final message:
"Perfect, I've got everything I need to build your program! Give me a moment to put it all together.
READY_TO_GENERATE:{"fitnessGoal":"muscle_gain","experienceLevel":"intermediate","daysPerWeek":4,"sessionDuration":60,"equipment":["barbell","dumbbells","cables"],"injuries":[],"preferences":[]}"

Start the conversation by greeting the user and asking about their goal.`;

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

    const { messages }: ChatRequest = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: messages.length > 0 ? messages : [
          { role: 'user', content: 'Start the conversation.' }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const claudeResponse = await response.json();
    const rawReply: string = claudeResponse.content[0].text;

    // Check if Claude signaled readiness to generate
    const readyMarker = 'READY_TO_GENERATE:';
    const markerIndex = rawReply.indexOf(readyMarker);

    if (markerIndex !== -1) {
      const jsonStr = rawReply.substring(markerIndex + readyMarker.length).trim();
      const replyText = rawReply.substring(0, markerIndex).trim();

      try {
        const questionnaire: WorkoutQuestionnaire = JSON.parse(jsonStr);
        const result: ChatResponse = {
          reply: replyText || "Perfect, I've got everything I need! Building your program now...",
          readyToGenerate: true,
          questionnaire,
        };
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Failed to parse questionnaire JSON:', parseError);
        // Fall through to return as normal message
      }
    }

    const result: ChatResponse = {
      reply: rawReply,
      readyToGenerate: false,
      questionnaire: null,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-coach-chat:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process chat message' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
