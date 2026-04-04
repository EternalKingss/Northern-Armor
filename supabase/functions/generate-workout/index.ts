import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkoutRequest {
  userId: string;
  questionnaire: {
    fitnessGoal: 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance' | 'general_fitness';
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    daysPerWeek: number;
    sessionDuration: number; // minutes
    equipment: string[];
    injuries: string[];
    preferences: string[];
  };
  healthData?: {
    averageSteps?: number;
    averageSleep?: number; // hours
    weight?: number;
    age?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── Subscription check (server-side gate) ──────────────────────────────
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

    // ── Claude API ─────────────────────────────────────────────────────────
    // Note: The secret is named "claude code" in Supabase (with a space)
    // Deno env vars with spaces need special handling
    const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY') || Deno.env.get('claude code');

    if (!CLAUDE_API_KEY) {
      throw new Error('Claude API key is not configured. Add CLAUDE_API_KEY to Supabase Edge Function secrets.');
    }

    const { userId, questionnaire, healthData }: WorkoutRequest = await req.json();

    // Build the prompt for Claude
    const prompt = buildWorkoutPrompt(questionnaire, healthData);

    // Call Claude API
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
        messages: [
          {
            role: 'user',
            content: prompt,
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
    const workoutPlan = parseClaudeResponse(claudeResponse);

    return new Response(
      JSON.stringify({
        success: true,
        workoutPlan,
        generatedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating workout:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate workout',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function buildWorkoutPrompt(
  questionnaire: WorkoutRequest['questionnaire'],
  healthData?: WorkoutRequest['healthData']
): string {
  const goalDescriptions: Record<string, string> = {
    muscle_gain: 'building muscle mass and size (hypertrophy)',
    fat_loss: 'losing body fat while maintaining muscle',
    strength: 'increasing maximal strength',
    endurance: 'improving cardiovascular endurance and stamina',
    general_fitness: 'overall health and fitness improvement',
  };

  let prompt = `You are an expert fitness coach and exercise scientist. Create a personalized workout program based on the following information:

## User Profile
- **Primary Goal**: ${goalDescriptions[questionnaire.fitnessGoal]}
- **Experience Level**: ${questionnaire.experienceLevel}
- **Available Days**: ${questionnaire.daysPerWeek} days per week
- **Session Duration**: ${questionnaire.sessionDuration} minutes per session
- **Available Equipment**: ${questionnaire.equipment.length > 0 ? questionnaire.equipment.join(', ') : 'Full gym access'}
${questionnaire.injuries.length > 0 ? `- **Injuries/Limitations**: ${questionnaire.injuries.join(', ')}` : ''}
${questionnaire.preferences.length > 0 ? `- **Preferences**: ${questionnaire.preferences.join(', ')}` : ''}
`;

  if (healthData) {
    prompt += `
## Health Data from Wearables
${healthData.averageSteps ? `- **Average Daily Steps**: ${healthData.averageSteps}` : ''}
${healthData.averageSleep ? `- **Average Sleep**: ${healthData.averageSleep} hours` : ''}
${healthData.weight ? `- **Current Weight**: ${healthData.weight} lbs` : ''}
${healthData.age ? `- **Age**: ${healthData.age} years` : ''}
`;
  }

  prompt += `
## Instructions
Create a ${questionnaire.daysPerWeek}-day workout program. For each day, provide:
1. Day name/focus (e.g., "Push Day", "Lower Body")
2. List of exercises with:
   - Exercise name
   - Sets x Reps (e.g., "4x8-10")
   - RPE (Rate of Perceived Exertion, 1-10)
   - Rest time between sets
   - Brief form notes if needed

## Output Format
Return the workout plan as a valid JSON object with this exact structure:
\`\`\`json
{
  "programName": "string",
  "description": "string",
  "daysPerWeek": number,
  "weeks": [
    {
      "week": 1,
      "block": "string (e.g., 'Foundation Phase')",
      "days": [
        {
          "name": "string (e.g., 'Push Day')",
          "focus": "string (e.g., 'Chest, Shoulders, Triceps')",
          "exercises": [
            {
              "name": "string",
              "workingSets": number,
              "reps": "string (e.g., '8-10')",
              "lastSetRPE": "string (e.g., '8')",
              "rest": "string (e.g., '90-120 sec')",
              "notes": "string (optional form tips)"
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

## Program Structure Requirements
Create an 8-WEEK progressive program with proper periodization:
- **Weeks 1-2**: Foundation Phase - Focus on learning movements, moderate intensity (RPE 6-7)
- **Weeks 3-4**: Building Phase - Increase volume slightly, RPE 7-8
- **Weeks 5-6**: Intensity Phase - Push harder, RPE 8-9, peak training
- **Weeks 7-8**: Peak & Deload - Week 7 highest intensity, Week 8 deload (reduced volume, RPE 6-7)

Each week must have exactly ${questionnaire.daysPerWeek} training days. Progress the exercises by:
- Gradually increasing sets or reps across weeks
- Adjusting RPE targets based on the phase
- Maintaining the same exercise selection for tracking progress

${questionnaire.injuries.length > 0 ? `IMPORTANT: Avoid exercises that could aggravate these injuries: ${questionnaire.injuries.join(', ')}. Provide safe alternatives.` : ''}
`;

  return prompt;
}

function parseClaudeResponse(response: any): any {
  try {
    const content = response.content[0].text;

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                      content.match(/```\s*([\s\S]*?)\s*```/) ||
                      [null, content];

    const jsonString = jsonMatch[1] || content;
    return JSON.parse(jsonString.trim());
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    throw new Error('Failed to parse workout plan from AI response');
  }
}
