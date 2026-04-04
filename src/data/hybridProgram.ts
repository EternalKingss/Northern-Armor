// Hybrid Transformation System - Weights + Bodyweight Fusion
// 12-Week Program - 3-Day Full-Body Split
// Combines progressive weighted compounds with advanced calisthenics

export interface HybridExercise {
  name: string;
  type: 'weighted' | 'bodyweight' | 'hybrid';
  warmupSets: string;
  workingSets: number;
  reps: string;
  lastSetRPE: string;
  earlySetRPE?: string;
  rest: string;
  notes?: string;
  substitution1?: string;
  substitution2?: string;
}

export interface HybridDay {
  name: string;
  focus: string;
  exercises: HybridExercise[];
}

export interface HybridWeek {
  week: number;
  block: string;
  days: HybridDay[];
}

export const HYBRID_PROGRAM: HybridWeek[] = [
  // Week 1 - Foundation Block (Technical Introduction - 1 Set)
  {
    week: 1,
    block: "Foundation Block",
    days: [
      {
        name: "Day 1",
        focus: "Push Emphasis (Horizontal)",
        exercises: [
          {
            name: "45° Incline Barbell Press",
            type: "weighted",
            warmupSets: "2-3",
            workingSets: 1,
            reps: "6-8",
            lastSetRPE: "~6",
            rest: "3m",
            notes: "1s pause at bottom. Control the negative for 3s like 'failed positive'",
            substitution1: "45° Incline DB Press",
            substitution2: "Barbell Bench Press",
          },
          {
            name: "Deficit Push-ups (Hands Elevated)",
            type: "bodyweight",
            warmupSets: "1",
            workingSets: 1,
            reps: "8-12",
            lastSetRPE: "~6",
            rest: "3m",
            notes: "Hands on blocks/books. 1s pause at bottom stretch. Think 'hugging a tree' on the way up",
            substitution1: "Ring Push-ups",
            substitution2: "Regular Push-ups",
          },
          {
            name: "Pull-ups (Neutral Grip)",
            type: "bodyweight",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "6-10",
            lastSetRPE: "~6",
            rest: "2-3m",
            notes: "Full dead hang at bottom. 3s negative. If can't do bodyweight, use assisted",
            substitution1: "Neutral-Grip Lat Pulldown",
            substitution2: "Wide-Grip Lat Pulldown",
          },
          {
            name: "Bulgarian Split Squats",
            type: "hybrid",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "8-12",
            lastSetRPE: "~7",
            rest: "2-3m",
            notes: "Rear foot elevated. Focus on quad stretch. Can add DBs when ready",
            substitution1: "DB Bulgarian Split Squat",
            substitution2: "Goblet Squat",
          },
          {
            name: "Bodyweight Triceps Extensions",
            type: "bodyweight",
            warmupSets: "1",
            workingSets: 1,
            reps: "10-15",
            lastSetRPE: "~7",
            rest: "1-2m",
            notes: "Elbows in. Stretch the long head. Like a vertical push-up",
            substitution1: "Overhead Cable Triceps Extension",
            substitution2: "DB Skull Crusher",
          },
          {
            name: "Hanging Leg Raises",
            type: "bodyweight",
            warmupSets: "1",
            workingSets: 1,
            reps: "10-20",
            lastSetRPE: "~7",
            rest: "1-2m",
            notes: "Slow descent. Do not use momentum. Lower back pressed flat",
            substitution1: "Lying Leg Raise",
            substitution2: "Cable Crunch",
          },
        ],
      },
      {
        name: "Day 2",
        focus: "Pull Emphasis (Vertical)",
        exercises: [
          {
            name: "Neutral-Grip Lat Pulldown",
            type: "weighted",
            warmupSets: "2-3",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~6",
            rest: "2-3m",
            notes: "Handle out in front like pullover/pulldown hybrid. Cue: 'Elbow Drive'",
            substitution1: "Neutral-Grip Pull-Up",
            substitution2: "Wide-Grip Lat Pulldown",
          },
          {
            name: "Pike Push-ups (Shoulder Focus)",
            type: "bodyweight",
            warmupSets: "1",
            workingSets: 1,
            reps: "6-10",
            lastSetRPE: "~6",
            rest: "2-3m",
            notes: "Hips high. Head forward of hands at bottom. Mimics overhead press",
            substitution1: "Machine Shoulder Press",
            substitution2: "DB Shoulder Press",
          },
          {
            name: "Australian Pull-ups (Inverted Row)",
            type: "bodyweight",
            warmupSets: "1",
            workingSets: 1,
            reps: "10-15",
            lastSetRPE: "~6",
            rest: "2m",
            notes: "Body straight. Chest to bar. Squeeze shoulder blades. Cue: 'Chest to Bar'",
            substitution1: "Chest-Supported Machine Row",
            substitution2: "Cable Row",
          },
          {
            name: "Nordic Hamstring Curls",
            type: "bodyweight",
            warmupSets: "1",
            workingSets: 1,
            reps: "5-8",
            lastSetRPE: "~6",
            rest: "3m",
            notes: "Assisted by hands. Resist the fall as long as possible. Neutral spine - straight line knee to shoulder",
            substitution1: "Lying Leg Curl",
            substitution2: "Sliding Leg Curls",
          },
          {
            name: "Pelican Curls (Biceps Focus)",
            type: "bodyweight",
            warmupSets: "1",
            workingSets: 1,
            reps: "8-12",
            lastSetRPE: "~7",
            rest: "1-2m",
            notes: "Arms behind body. Controlled eccentric. Unique bicep stretch",
            substitution1: "Bayesian Cable Curl",
            substitution2: "Incline DB Stretch Curl",
          },
          {
            name: "Single-leg Calf Raises",
            type: "bodyweight",
            warmupSets: "1",
            workingSets: 1,
            reps: "12-15",
            lastSetRPE: "~7",
            rest: "1m",
            notes: "1s pause at bottom stretch. Can add DB when ready",
            substitution1: "Standing Calf Raise",
            substitution2: "Seated Calf Raise",
          },
        ],
      },
      {
        name: "Day 3",
        focus: "Lower Body & Core Stability",
        exercises: [
          {
            name: "Smith Machine Squat",
            type: "weighted",
            warmupSets: "2-4",
            workingSets: 1,
            reps: "6-8",
            lastSetRPE: "~6",
            rest: "3-5m",
            notes: "Feet forward 3-6 inches for upright position. Controlled negative with pause",
            substitution1: "Barbell Back Squat",
            substitution2: "Leg Press",
          },
          {
            name: "Pistol Squats (Assisted if needed)",
            type: "bodyweight",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "5-10",
            lastSetRPE: "~6",
            rest: "3m",
            notes: "Full depth. Minimize back rounding. Hold TRX/pole if needed",
            substitution1: "Bulgarian Split Squat",
            substitution2: "Goblet Squat",
          },
          {
            name: "Diamond Push-ups",
            type: "bodyweight",
            warmupSets: "1",
            workingSets: 1,
            reps: "10-15",
            lastSetRPE: "~7",
            rest: "1-2m",
            notes: "Focus on triceps lockout and pec squeeze at top",
            substitution1: "Close-Grip Bench Press",
            substitution2: "Cable Triceps Pushdown",
          },
          {
            name: "Chin-ups (Close Grip)",
            type: "bodyweight",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "6-10",
            lastSetRPE: "~6",
            rest: "2-3m",
            notes: "Palms facing you. Focus on bicep recruitment. Slow negative",
            substitution1: "Close-Grip Lat Pulldown",
            substitution2: "EZ-Bar Cable Curl",
          },
          {
            name: "Barbell RDL",
            type: "weighted",
            warmupSets: "2-4",
            workingSets: 1,
            reps: "6-8",
            lastSetRPE: "~6",
            rest: "2-3m",
            notes: "Stop 75% to lockout to keep hamstring tension. Feel the stretch",
            substitution1: "DB RDL",
            substitution2: "Reverse Hyperextensions",
          },
          {
            name: "Hollow Body Hold",
            type: "bodyweight",
            warmupSets: "0",
            workingSets: 1,
            reps: "30-60s",
            lastSetRPE: "~7",
            rest: "1m",
            notes: "Lower back pressed into floor. Legs straight. Gymnast core",
            substitution1: "Ab Wheel Rollout",
            substitution2: "Plank Hold",
          },
        ],
      },
    ],
  },

  // Week 2 - Foundation Block (RPE increases to ~7-8, still 1 set)
  {
    week: 2,
    block: "Foundation Block",
    days: [
      {
        name: "Day 1",
        focus: "Push Emphasis (Horizontal)",
        exercises: [
          { name: "45° Incline Barbell Press", type: "weighted", warmupSets: "2-3", workingSets: 1, reps: "6-8", lastSetRPE: "~7", rest: "3m", substitution1: "45° Incline DB Press", substitution2: "Barbell Bench Press" },
          { name: "Deficit Push-ups (Hands Elevated)", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "8-12", lastSetRPE: "~7", rest: "3m", notes: "Add 1-2 reps from Week 1", substitution1: "Ring Push-ups", substitution2: "Regular Push-ups" },
          { name: "Pull-ups (Neutral Grip)", type: "bodyweight", warmupSets: "1-2", workingSets: 1, reps: "6-10", lastSetRPE: "~7", rest: "2-3m", substitution1: "Neutral-Grip Lat Pulldown", substitution2: "Wide-Grip Lat Pulldown" },
          { name: "Bulgarian Split Squats", type: "hybrid", warmupSets: "1-2", workingSets: 1, reps: "8-12", lastSetRPE: "~8", rest: "2-3m", substitution1: "DB Bulgarian Split Squat", substitution2: "Goblet Squat" },
          { name: "Bodyweight Triceps Extensions", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "10-15", lastSetRPE: "~8", rest: "1-2m", substitution1: "Overhead Cable Triceps Extension", substitution2: "DB Skull Crusher" },
          { name: "Hanging Leg Raises", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "10-20", lastSetRPE: "~8", rest: "1-2m", substitution1: "Lying Leg Raise", substitution2: "Cable Crunch" },
        ],
      },
      {
        name: "Day 2",
        focus: "Pull Emphasis (Vertical)",
        exercises: [
          { name: "Neutral-Grip Lat Pulldown", type: "weighted", warmupSets: "2-3", workingSets: 1, reps: "8-10", lastSetRPE: "~7", rest: "2-3m", substitution1: "Neutral-Grip Pull-Up", substitution2: "Wide-Grip Lat Pulldown" },
          { name: "Pike Push-ups (Shoulder Focus)", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "6-10", lastSetRPE: "~7", rest: "2-3m", substitution1: "Machine Shoulder Press", substitution2: "DB Shoulder Press" },
          { name: "Australian Pull-ups (Inverted Row)", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "10-15", lastSetRPE: "~7", rest: "2m", substitution1: "Chest-Supported Machine Row", substitution2: "Cable Row" },
          { name: "Nordic Hamstring Curls", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "5-8", lastSetRPE: "~7", rest: "3m", substitution1: "Lying Leg Curl", substitution2: "Sliding Leg Curls" },
          { name: "Pelican Curls (Biceps Focus)", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "8-12", lastSetRPE: "~8", rest: "1-2m", substitution1: "Bayesian Cable Curl", substitution2: "Incline DB Stretch Curl" },
          { name: "Single-leg Calf Raises", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "12-15", lastSetRPE: "~8", rest: "1m", substitution1: "Standing Calf Raise", substitution2: "Seated Calf Raise" },
        ],
      },
      {
        name: "Day 3",
        focus: "Lower Body & Core Stability",
        exercises: [
          { name: "Smith Machine Squat", type: "weighted", warmupSets: "2-4", workingSets: 1, reps: "6-8", lastSetRPE: "~7", rest: "3-5m", substitution1: "Barbell Back Squat", substitution2: "Leg Press" },
          { name: "Pistol Squats (Assisted if needed)", type: "bodyweight", warmupSets: "1-2", workingSets: 1, reps: "5-10", lastSetRPE: "~7", rest: "3m", substitution1: "Bulgarian Split Squat", substitution2: "Goblet Squat" },
          { name: "Diamond Push-ups", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "10-15", lastSetRPE: "~8", rest: "1-2m", substitution1: "Close-Grip Bench Press", substitution2: "Cable Triceps Pushdown" },
          { name: "Chin-ups (Close Grip)", type: "bodyweight", warmupSets: "1-2", workingSets: 1, reps: "6-10", lastSetRPE: "~7", rest: "2-3m", substitution1: "Close-Grip Lat Pulldown", substitution2: "EZ-Bar Cable Curl" },
          { name: "Barbell RDL", type: "weighted", warmupSets: "2-4", workingSets: 1, reps: "6-8", lastSetRPE: "~7", rest: "2-3m", substitution1: "DB RDL", substitution2: "Reverse Hyperextensions" },
          { name: "Hollow Body Hold", type: "bodyweight", warmupSets: "0", workingSets: 1, reps: "30-60s", lastSetRPE: "~8", rest: "1m", substitution1: "Ab Wheel Rollout", substitution2: "Plank Hold" },
        ],
      },
    ],
  },

  // Weeks 3-5 - Foundation Block (2 working sets, progressive RPE)
  {
    week: 3,
    block: "Foundation Block",
    days: [
      {
        name: "Day 1",
        focus: "Push Emphasis (Horizontal)",
        exercises: [
          { name: "45° Incline Barbell Press", type: "weighted", warmupSets: "2-3", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~8", rest: "3m", substitution1: "45° Incline DB Press", substitution2: "Barbell Bench Press" },
          { name: "Deficit Push-ups (Hands Elevated)", type: "bodyweight", warmupSets: "1", workingSets: 2, reps: "8-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "3m", substitution1: "Ring Push-ups", substitution2: "Regular Push-ups" },
          { name: "Pull-ups (Neutral Grip)", type: "bodyweight", warmupSets: "1-2", workingSets: 2, reps: "6-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "2-3m", substitution1: "Neutral-Grip Lat Pulldown", substitution2: "Wide-Grip Lat Pulldown" },
          { name: "Bulgarian Split Squats", type: "hybrid", warmupSets: "1-2", workingSets: 2, reps: "8-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "2-3m", substitution1: "DB Bulgarian Split Squat", substitution2: "Goblet Squat" },
          { name: "Bodyweight Triceps Extensions", type: "bodyweight", warmupSets: "1", workingSets: 2, reps: "10-15", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2m", substitution1: "Overhead Cable Triceps Extension", substitution2: "DB Skull Crusher" },
          { name: "Hanging Leg Raises", type: "bodyweight", warmupSets: "1", workingSets: 2, reps: "10-20", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2m", substitution1: "Lying Leg Raise", substitution2: "Cable Crunch" },
        ],
      },
      {
        name: "Day 2",
        focus: "Pull Emphasis (Vertical)",
        exercises: [
          { name: "Neutral-Grip Lat Pulldown", type: "weighted", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "2-3m", substitution1: "Neutral-Grip Pull-Up", substitution2: "Wide-Grip Lat Pulldown" },
          { name: "Pike Push-ups (Shoulder Focus)", type: "bodyweight", warmupSets: "1", workingSets: 2, reps: "6-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "2-3m", substitution1: "Machine Shoulder Press", substitution2: "DB Shoulder Press" },
          { name: "Australian Pull-ups (Inverted Row)", type: "bodyweight", warmupSets: "1", workingSets: 2, reps: "10-15", earlySetRPE: "~7", lastSetRPE: "~8", rest: "2m", substitution1: "Chest-Supported Machine Row", substitution2: "Cable Row" },
          { name: "Nordic Hamstring Curls", type: "bodyweight", warmupSets: "1", workingSets: 2, reps: "5-8", earlySetRPE: "~7", lastSetRPE: "~8", rest: "3m", substitution1: "Lying Leg Curl", substitution2: "Sliding Leg Curls" },
          { name: "Pelican Curls (Biceps Focus)", type: "bodyweight", warmupSets: "1", workingSets: 2, reps: "8-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2m", substitution1: "Bayesian Cable Curl", substitution2: "Incline DB Stretch Curl" },
          { name: "Single-leg Calf Raises", type: "bodyweight", warmupSets: "1", workingSets: 2, reps: "12-15", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1m", substitution1: "Standing Calf Raise", substitution2: "Seated Calf Raise" },
        ],
      },
      {
        name: "Day 3",
        focus: "Lower Body & Core Stability",
        exercises: [
          { name: "Smith Machine Squat", type: "weighted", warmupSets: "2-4", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~8", rest: "3-5m", substitution1: "Barbell Back Squat", substitution2: "Leg Press" },
          { name: "Pistol Squats (Assisted if needed)", type: "bodyweight", warmupSets: "1-2", workingSets: 2, reps: "5-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "3m", substitution1: "Bulgarian Split Squat", substitution2: "Goblet Squat" },
          { name: "Diamond Push-ups", type: "bodyweight", warmupSets: "1", workingSets: 2, reps: "10-15", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2m", substitution1: "Close-Grip Bench Press", substitution2: "Cable Triceps Pushdown" },
          { name: "Chin-ups (Close Grip)", type: "bodyweight", warmupSets: "1-2", workingSets: 2, reps: "6-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "2-3m", substitution1: "Close-Grip Lat Pulldown", substitution2: "EZ-Bar Cable Curl" },
          { name: "Barbell RDL", type: "weighted", warmupSets: "2-4", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~8", rest: "2-3m", substitution1: "DB RDL", substitution2: "Reverse Hyperextensions" },
          { name: "Hollow Body Hold", type: "bodyweight", warmupSets: "0", workingSets: 2, reps: "30-60s", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1m", substitution1: "Ab Wheel Rollout", substitution2: "Plank Hold" },
        ],
      },
    ],
  },

  // Weeks 4-5 same structure as Week 3
  { week: 4, block: "Foundation Block", days: [] },
  { week: 5, block: "Foundation Block", days: [] },

  // Week 6 - Ramping Block (Deload - new variations, 1 set, RPE ~6)
  {
    week: 6,
    block: "Ramping Block",
    days: [
      {
        name: "Day 1",
        focus: "Vertical Push/Pull",
        exercises: [
          { name: "Wall-Assisted Handstand Push-ups", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "5-8", lastSetRPE: "~6", rest: "3m", notes: "Use handstand hold as regression if needed", substitution1: "Pike Push-ups", substitution2: "DB Shoulder Press" },
          { name: "Pull-ups (Wide Grip)", type: "bodyweight", warmupSets: "1-2", workingSets: 1, reps: "6-10", lastSetRPE: "~6", rest: "2-3m", notes: "Focus on lat width. Slow descent", substitution1: "Wide-Grip Lat Pulldown", substitution2: "Neutral-Grip Pull-Up" },
          { name: "Sissy Squats", type: "bodyweight", warmupSets: "1-2", workingSets: 1, reps: "10-15", lastSetRPE: "~7", rest: "2m", notes: "Hips forward. Focus on distal quad stretch", substitution1: "Leg Extension", substitution2: "Goblet Squat" },
          { name: "Floor Dips (L-Sit style)", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "10-12", lastSetRPE: "~7", rest: "1-2m", notes: "Focus on triceps extension at top", substitution1: "Bench Dips", substitution2: "Cable Triceps Extension" },
          { name: "Ab Wheel Rollouts", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "8-12", lastSetRPE: "~7", rest: "2m", notes: "Do not let lower back arch. Full extension", substitution1: "Swiss Ball Rollout", substitution2: "Plank Hold" },
        ],
      },
      {
        name: "Day 2",
        focus: "Horizontal Focus & Posterior Chain",
        exercises: [
          { name: "Archer Push-ups", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "8-10", lastSetRPE: "~6", rest: "2-3m", notes: "Unilateral chest focus. Assist with straight arm", substitution1: "Deficit Push-ups", substitution2: "DB Bench Press" },
          { name: "Archer Rows (Inverted)", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "8-10", lastSetRPE: "~6", rest: "2m", notes: "One arm row. High mechanical tension", substitution1: "Single-Arm DB Row", substitution2: "Cable Row" },
          { name: "Single-leg Romanian Deadlifts", type: "hybrid", warmupSets: "1-2", workingSets: 1, reps: "10-12", lastSetRPE: "~7", rest: "2m", notes: "Neutral spine. Feel the hamstring stretch. Can add DB", substitution1: "Barbell RDL", substitution2: "Nordic Curls" },
          { name: "Ring/Incline Curls", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "12-15", lastSetRPE: "~7", rest: "1-2m", notes: "Supinated grip. No momentum", substitution1: "Bayesian Cable Curl", substitution2: "DB Curl" },
          { name: "Single-leg Calf Jumps", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "10-12", lastSetRPE: "~7", rest: "1m", notes: "Controlled explosive calf move", substitution1: "Standing Calf Raise", substitution2: "Seated Calf Raise" },
        ],
      },
      {
        name: "Day 3",
        focus: "Compound Integration",
        exercises: [
          { name: "Shrimp Squats", type: "bodyweight", warmupSets: "1-2", workingSets: 1, reps: "6-10", lastSetRPE: "~6", rest: "3m", notes: "Hold rear foot. High stability glute/quad move", substitution1: "Bulgarian Split Squat", substitution2: "Pistol Squat" },
          { name: "Ring Dips (or Deficit Push-ups)", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "8-12", lastSetRPE: "~6", rest: "2-3m", notes: "Full lockout. Deep stretch at bottom", substitution1: "Bench Dips", substitution2: "Decline Push-ups" },
          { name: "Muscle-up Transitions (or Pull-ups)", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "4-6", lastSetRPE: "~6", rest: "3m", notes: "Focus on power and transition speed. Regression: explosive pull-ups", substitution1: "Explosive Pull-ups", substitution2: "Weighted Pull-ups" },
          { name: "Sliding Leg Curls (Hamstrings)", type: "bodyweight", warmupSets: "1", workingSets: 1, reps: "12-15", lastSetRPE: "~7", rest: "1-2m", notes: "Hips high. Curl heels to glutes", substitution1: "Lying Leg Curl", substitution2: "Nordic Curls" },
          { name: "Copenhagen Planks (Adductors)", type: "bodyweight", warmupSets: "0", workingSets: 1, reps: "30-45s", lastSetRPE: "~7", rest: "1m", notes: "Top leg on bench. Focus on groin strength", substitution1: "Machine Hip Adduction", substitution2: "Side Plank" },
        ],
      },
    ],
  },

  // Weeks 7-12 - Ramping/Peak Block (3 sets compounds, 2 sets accessories, RPE 10 last sets)
  { week: 7, block: "Ramping Block", days: [] },
  { week: 8, block: "Building Block", days: [] },
  { week: 9, block: "Peak Block", days: [] },
  { week: 10, block: "Peak Block", days: [] },
  { week: 11, block: "Peak Block", days: [] },
  { week: 12, block: "Peak Block", days: [] },
];

export const HYBRID_WARM_UP = {
  general: {
    title: "General Warm-Up (5-10 Minutes)",
    objective: "Increase systemic blood flow without inducing significant fatigue",
    activities: [
      { name: "Light Cardio (Brisk Walk/Cycle)", duration: "5-10 Minutes", goal: "Elevation of core temperature" },
      { name: "Arm Swings (Front/Side)", reps: "10 Reps per side", goal: "Joint mobilization" },
      { name: "Arm Circles (Small/Large)", reps: "10 Reps per side", goal: "Scapular/Shoulder priming" },
      { name: "Front-to-Back Leg Swings", reps: "10 Reps per side", goal: "Hip/Hamstring lubrication" },
      { name: "Side-to-Side Leg Swings", reps: "10 Reps per side", goal: "Adductor/Abductor priming" },
    ],
  },
  exerciseSpecific: {
    title: "Exercise-Specific Warm-Up",
    description: "Pyramid warm-up structure based on working sets for first major compound",
    protocol: {
      "1 Set": "~60% effort (6-10 reps)",
      "2 Sets": "Set 1: ~50% effort (6-10 reps), Set 2: ~70% effort (4-6 reps)",
      "3 Sets": "Set 1: ~45% effort (6-10 reps), Set 2: ~65% effort (4-6 reps), Set 3: ~85% effort (3-4 reps)",
      "4 Sets": "Set 1: ~45% effort (6-10 reps), Set 2: ~60% effort (4-6 reps), Set 3: ~75% effort (3-5 reps), Set 4: ~85% effort (2-4 reps)",
    },
  },
};

export const HYBRID_PHILOSOPHY = {
  description: "Advanced fusion of weighted exercises and bodyweight movements for complete athleticism",
  principles: [
    "3-day full-body split for optimal frequency (3x per week per muscle)",
    "Progressive weighted compounds for maximum strength gains",
    "Advanced calisthenics for functional movement mastery",
    "Jeff Nippard's BTS methodology with pyramid warm-ups",
    "RPE-based progressive overload across 12 weeks",
    "Strategic deloads every 6 weeks with exercise variation",
  ],
  targetAudience: "Athletes seeking both maximal strength and bodyweight control",
};
