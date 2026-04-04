// Bodybuilding Transformation System - Beginner
// Foundation Block (Weeks 1-4)

export interface WorkoutExercise {
  name: string;
  warmupSets: string;
  workingSets: number;
  reps: string;
  lastSetRPE: string;
  earlySetRPE?: string;
  rest: string;
  notes?: string;
  substitution1?: string;
  substitution2?: string;
  intensityTechnique?: string;
}

export interface WorkoutDay {
  name: string;
  exercises: WorkoutExercise[];
}

export interface WeekPlan {
  week: number;
  block: string;
  days: WorkoutDay[];
}

export const WORKOUT_PROGRAM: WeekPlan[] = [
  {
    week: 1,
    block: "Foundation Block",
    days: [
      {
        name: "Upper (Strength Focus)",
        exercises: [
          {
            name: "45° Incline Barbell Press",
            warmupSets: "2-3",
            workingSets: 1,
            reps: "6-8",
            lastSetRPE: "~6",
            rest: "3-5 min",
            notes: "1 second pause at the bottom of each rep while maintaining tension on the pecs",
            substitution1: "45° Incline DB Press",
            substitution2: "45° Incline Machine Press",
          },
          {
            name: "Cable Crossover Ladder",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Do one set with low cable position, one set with medium-height cable position, and one height with a high cable position",
            substitution1: "Pec Deck",
            substitution2: "Bottom-Half DB Flye",
          },
          {
            name: "Wide-Grip Pull-Up",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~6",
            rest: "2-3 min",
            notes: "1.5x shoulder width overhand grip. Slow 2-3 second negative. Feel your lats pulling apart on the way down",
            substitution1: "Wide-Grip Lat Pulldown",
            substitution2: "Dual-Handle Lat Pulldown",
          },
          {
            name: "High-Cable Lateral Raise",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~6",
            rest: "1-2 min",
            notes: "Focus on squeezing your lateral delt to move the weight",
            substitution1: "High-Cable Cuffed Lateral Raise",
            substitution2: "Lean-In DB Lateral Raise",
          },
          {
            name: "Pendlay Deficit Row",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "6-8",
            lastSetRPE: "~6",
            rest: "2-3 min",
            notes: "Stand on a bumper plate. Focus on getting a big stretch and touch your stomach/chest on each rep!",
            substitution1: "Smith Machine Row",
            substitution2: "Single-Arm DB Row",
          },
          {
            name: "Overhead Cable Triceps Extension (Bar)",
            warmupSets: "1",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Optionally pause for 0.5-1 second in the stretched aspect of each rep",
            substitution1: "Overhead Cable Triceps Extension (Rope)",
            substitution2: "DB Skull Crusher",
          },
          {
            name: "Bayesian Cable Curl",
            warmupSets: "1",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "If you have a left-right bicep size imbalance, do these 1 arm at a time, starting with the weaker arm",
            substitution1: "Seated Super-Bayesian High Cable Curl",
            substitution2: "Incline DB Stretch Curl",
          },
        ],
      },
      {
        name: "Lower (Strength Focus)",
        exercises: [
          {
            name: "Lying Leg Curl",
            warmupSets: "2",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl",
            substitution1: "Seated Leg Curl",
            substitution2: "Nordic Ham Curl",
          },
          {
            name: "Smith Machine Squat",
            warmupSets: "2-4",
            workingSets: 1,
            reps: "6-8",
            lastSetRPE: "~6",
            rest: "3-5 min",
            notes: "Set up your feet forward ~3-6 inches. This will cause you to lean back into the bar slightly, allowing for a more upright squat",
            substitution1: "DB Bulgarian Split Squat",
            substitution2: "High-Bar Back Squat",
          },
          {
            name: "Barbell RDL",
            warmupSets: "2-4",
            workingSets: 1,
            reps: "6-8",
            lastSetRPE: "~6",
            rest: "2-3 min",
            notes: "To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep",
            substitution1: "DB RDL",
            substitution2: "Snatch-Grip RDL",
          },
          {
            name: "Leg Extension",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Set the seat back as far as it will go. Use a 2-3 second negative. Feel your quads pulling apart on the negative",
            substitution1: "Reverse Nordic",
            substitution2: "Sissy Squat",
          },
          {
            name: "Standing Calf Raise",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "1-2 second pause at the bottom of each rep. Roll your ankle back and forth on the balls of your feet",
            substitution1: "Seated Calf Raise",
            substitution2: "Leg Press Calf Press",
          },
          {
            name: "Cable Crunch",
            warmupSets: "1",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack",
            substitution1: "Decline Weighted Crunch",
            substitution2: "Machine Crunch",
          },
        ],
      },
      {
        name: "Pull (Hypertrophy Focus)",
        exercises: [
          {
            name: "Neutral-Grip Lat Pulldown",
            warmupSets: "2-3",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~6",
            rest: "2-3 min",
            notes: "Do these pulldowns with the handle more out in front of you, more like a cross between pullover and a pulldown",
            substitution1: "Wide-Grip Lat Pulldown",
            substitution2: "Neutral-Grip Pull-Up",
          },
          {
            name: "Chest-Supported Machine Row",
            warmupSets: "2-3",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~6",
            rest: "2-3 min",
            notes: "Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep",
            substitution1: "Chest-Supported T-Bar Row",
            substitution2: "Incline Chest-Supported DB Row",
          },
          {
            name: "1-Arm 45° Cable Rear Delt Flye",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "10-12",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Pause for 1-2 seconds in the squeeze of each rep. Contract the rear delts hard!",
            substitution1: "Rope Face Pull",
            substitution2: "Reverse Pec Deck",
          },
          {
            name: "Machine Shrug",
            warmupSets: "2-3",
            workingSets: 1,
            reps: "10-12",
            lastSetRPE: "~7",
            rest: "1-2 min",
            substitution1: "Cable Paused Shrug-In",
            substitution2: "DB Shrug",
          },
          {
            name: "EZ-Bar Cable Curl",
            warmupSets: "1",
            workingSets: 1,
            reps: "10-12",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Set up the cable at the lowest position. Maintain constant tension on the biceps. Slow, controlled reps!",
            substitution1: "EZ-Bar Curl",
            substitution2: "DB Curl",
          },
          {
            name: "Machine Preacher Curl",
            warmupSets: "1",
            workingSets: 1,
            reps: "12-15",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Focus on the squeeze at the top of each rep",
            substitution1: "EZ-Bar Preacher Curl",
            substitution2: "DB Preacher Curl",
          },
        ],
      },
      {
        name: "Push (Hypertrophy Focus)",
        exercises: [
          {
            name: "Barbell Bench Press",
            warmupSets: "2-4",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~6",
            rest: "3-5 min",
            notes: "Set up a comfortable arch, quick pause on the chest and explode up on each rep",
            substitution1: "Machine Chest Press",
            substitution2: "DB Bench Press",
          },
          {
            name: "Machine Shoulder Press",
            warmupSets: "2-3",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~6",
            rest: "2-3 min",
            notes: "Ensure that your elbows break at least 90°. Mind-muscle connection with your delts. Smooth, controlled reps",
            substitution1: "Cable Shoulder Press",
            substitution2: "Seated DB Shoulder Press",
          },
          {
            name: "Bottom-Half DB Flye",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "10-12",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "All reps and sets are to be performed in the bottom half of the ROM. Focus on feeling a deep stretch in your pecs at the bottom of each rep",
            substitution1: "Bottom-Half Seated Cable Flye",
            substitution2: "Low-to-High Cable Crossover",
          },
          {
            name: "High-Cable Lateral Raise",
            warmupSets: "1",
            workingSets: 1,
            reps: "10-12",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Focus on squeezing your lateral delt to move the weight",
            substitution1: "High-Cable Cuffed Lateral Raise",
            substitution2: "Lean-In DB Lateral Raise",
          },
          {
            name: "Overhead Cable Triceps Extension (Bar)",
            warmupSets: "1",
            workingSets: 1,
            reps: "10-12",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Optionally pause for 0.5-1 second in the stretched aspect of each rep",
            substitution1: "Overhead Cable Triceps Extension (Rope)",
            substitution2: "DB Skull Crusher",
          },
          {
            name: "Cable Triceps Kickback",
            warmupSets: "1",
            workingSets: 1,
            reps: "12-15",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you",
            substitution1: "DB Triceps Kickback",
            substitution2: "Bench Dip",
          },
          {
            name: "Lying Leg Raise",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "10-20",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Perform these slowly, focus on keeping your lower back against the ground throughout the set",
            substitution1: "Hanging Leg Raise",
            substitution2: "Modified Candlestick",
          },
        ],
      },
      {
        name: "Legs (Hypertrophy Focus)",
        exercises: [
          {
            name: "Leg Press",
            warmupSets: "2-4",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~6",
            rest: "2-3 min",
            notes: "Feet lower on the platform for more quad focus. Get as deep as you can without excessive back rounding. Control the negative and do a slight pause at the bottom of each rep",
            substitution1: "Smith Machine Static Lunge",
            substitution2: "DB Walking Lunge",
          },
          {
            name: "Seated Leg Curl",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "10-12",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "Lean forward over the machine to get a maximum stretch in your hamstrings",
            substitution1: "Lying Leg Curl",
            substitution2: "Nordic Ham Curl",
          },
          {
            name: "Walking Lunge",
            warmupSets: "2-3",
            workingSets: 1,
            reps: "8-10",
            lastSetRPE: "~6",
            rest: "2-3 min",
            notes: "Take medium strides. Minimize contribution from the back leg",
            substitution1: "DB Step-Up",
            substitution2: "Goblet Squat",
          },
          {
            name: "Machine Hip Abduction",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "10-12",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "If possible, use pads to increase the range of motion on the machine. Lean forward and grab onto the machine rails to stretch the glutes further",
            substitution1: "Cable Hip Abduction",
            substitution2: "Lateral Band Walk",
          },
          {
            name: "Standing Calf Raise",
            warmupSets: "1-2",
            workingSets: 1,
            reps: "10-12",
            lastSetRPE: "~7",
            rest: "1-2 min",
            notes: "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet",
            substitution1: "Seated Calf Raise",
            substitution2: "Leg Press Calf Press",
          },
        ],
      },
    ],
  },
  // Week 2 - Intensity increases to RPE ~7-8
  {
    week: 2,
    block: "Foundation Block",
    days: [
      {
        name: "Upper (Strength Focus)",
        exercises: [
          { name: "45° Incline Barbell Press", warmupSets: "2-3", workingSets: 1, reps: "6-8", lastSetRPE: "~7", rest: "3-5 min", notes: "1 second pause at the bottom", substitution1: "45° Incline DB Press", substitution2: "45° Incline Machine Press" },
          { name: "Cable Crossover Ladder", warmupSets: "1-2", workingSets: 1, reps: "8-10", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Pec Deck", substitution2: "Bottom-Half DB Flye" },
          { name: "Wide-Grip Pull-Up", warmupSets: "1-2", workingSets: 1, reps: "8-10", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Wide-Grip Lat Pulldown", substitution2: "Dual-Handle Lat Pulldown" },
          { name: "High-Cable Lateral Raise", warmupSets: "1-2", workingSets: 1, reps: "8-10", lastSetRPE: "~7", rest: "1-2 min", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise" },
          { name: "Pendlay Deficit Row", warmupSets: "1-2", workingSets: 1, reps: "6-8", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Smith Machine Row", substitution2: "Single-Arm DB Row" },
          { name: "Overhead Cable Triceps Extension (Bar)", warmupSets: "1", workingSets: 1, reps: "8-10", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Overhead Cable Triceps Extension (Rope)", substitution2: "DB Skull Crusher" },
          { name: "Bayesian Cable Curl", warmupSets: "1", workingSets: 1, reps: "8-10", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Super-Bayesian High Cable Curl", substitution2: "Incline DB Stretch Curl" },
        ],
      },
      {
        name: "Lower (Strength Focus)",
        exercises: [
          { name: "Lying Leg Curl", warmupSets: "2", workingSets: 1, reps: "8-10", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Leg Curl", substitution2: "Nordic Ham Curl" },
          { name: "Smith Machine Squat", warmupSets: "2-4", workingSets: 1, reps: "6-8", lastSetRPE: "~7", rest: "3-5 min", substitution1: "DB Bulgarian Split Squat", substitution2: "High-Bar Back Squat" },
          { name: "Barbell RDL", warmupSets: "2-4", workingSets: 1, reps: "6-8", lastSetRPE: "~7", rest: "2-3 min", substitution1: "DB RDL", substitution2: "Snatch-Grip RDL" },
          { name: "Leg Extension", warmupSets: "1-2", workingSets: 1, reps: "8-10", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Reverse Nordic", substitution2: "Sissy Squat" },
          { name: "Standing Calf Raise", warmupSets: "1-2", workingSets: 1, reps: "8-10", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Calf Raise", substitution2: "Leg Press Calf Press" },
          { name: "Cable Crunch", warmupSets: "1", workingSets: 1, reps: "8-10", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Decline Weighted Crunch", substitution2: "Machine Crunch" },
        ],
      },
      {
        name: "Pull (Hypertrophy Focus)",
        exercises: [
          { name: "Neutral-Grip Lat Pulldown", warmupSets: "2-3", workingSets: 1, reps: "8-10", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Wide-Grip Lat Pulldown", substitution2: "Neutral-Grip Pull-Up" },
          { name: "Chest-Supported Machine Row", warmupSets: "2-3", workingSets: 1, reps: "8-10", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Chest-Supported T-Bar Row", substitution2: "Incline Chest-Supported DB Row" },
          { name: "1-Arm 45° Cable Rear Delt Flye", warmupSets: "1-2", workingSets: 1, reps: "10-12", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Rope Face Pull", substitution2: "Reverse Pec Deck" },
          { name: "Machine Shrug", warmupSets: "2-3", workingSets: 1, reps: "10-12", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Cable Paused Shrug-In", substitution2: "DB Shrug" },
          { name: "EZ-Bar Cable Curl", warmupSets: "1", workingSets: 1, reps: "10-12", lastSetRPE: "~8", rest: "1-2 min", substitution1: "EZ-Bar Curl", substitution2: "DB Curl" },
          { name: "Machine Preacher Curl", warmupSets: "1", workingSets: 1, reps: "12-15", lastSetRPE: "~8", rest: "1-2 min", substitution1: "EZ-Bar Preacher Curl", substitution2: "DB Preacher Curl" },
        ],
      },
      {
        name: "Push (Hypertrophy Focus)",
        exercises: [
          { name: "Barbell Bench Press", warmupSets: "2-4", workingSets: 1, reps: "8-10", lastSetRPE: "~7", rest: "3-5 min", notes: "Set up a comfortable arch, quick pause on the chest and explode up on each rep", substitution1: "Machine Chest Press", substitution2: "DB Bench Press" },
          { name: "Machine Shoulder Press", warmupSets: "2-3", workingSets: 1, reps: "8-10", lastSetRPE: "~7", rest: "2-3 min", notes: "Ensure that your elbows break at least 90°. Mind-muscle connection with your delts. Smooth, controlled reps", substitution1: "Cable Shoulder Press", substitution2: "Seated DB Shoulder Press" },
          { name: "Bottom-Half DB Flye", warmupSets: "1-2", workingSets: 1, reps: "10-12", lastSetRPE: "~8", rest: "1-2 min", notes: "All reps and sets are to be performed in the bottom half of the ROM. Focus on feeling a deep stretch in your pecs at the bottom of each rep", substitution1: "Bottom-Half Seated Cable Flye", substitution2: "Low-to-High Cable Crossover" },
          { name: "High-Cable Lateral Raise", warmupSets: "1", workingSets: 1, reps: "10-12", lastSetRPE: "~8", rest: "1-2 min", notes: "Focus on squeezing your lateral delt to move the weight", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise" },
          { name: "Overhead Cable Triceps Extension (Bar)", warmupSets: "1", workingSets: 1, reps: "10-12", lastSetRPE: "~8", rest: "1-2 min", notes: "Optionally pause for 0.5-1 second in the stretched aspect of each rep", substitution1: "Overhead Cable Triceps Extension (Rope)", substitution2: "DB Skull Crusher" },
          { name: "Cable Triceps Kickback", warmupSets: "1", workingSets: 1, reps: "12-15", lastSetRPE: "~8", rest: "1-2 min", notes: "There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you", substitution1: "DB Triceps Kickback", substitution2: "Bench Dip" },
          { name: "Lying Leg Raise", warmupSets: "1-2", workingSets: 1, reps: "10-20", lastSetRPE: "~8", rest: "1-2 min", notes: "Perform these slowly, focus on keeping your lower back against the ground throughout the set", substitution1: "Hanging Leg Raise", substitution2: "Modified Candlestick" },
        ],
      },
      {
        name: "Legs (Hypertrophy Focus)",
        exercises: [
          { name: "Leg Press", warmupSets: "2-4", workingSets: 1, reps: "8-10", lastSetRPE: "~7", rest: "2-3 min", notes: "Feet lower on the platform for more quad focus. Get as deep as you can without excessive back rounding. Control the negative and do a slight pause at the bottom of each rep", substitution1: "Smith Machine Static Lunge", substitution2: "DB Walking Lunge" },
          { name: "Seated Leg Curl", warmupSets: "1-2", workingSets: 1, reps: "10-12", lastSetRPE: "~8", rest: "1-2 min", notes: "Lean forward over the machine to get a maximum stretch in your hamstrings", substitution1: "Lying Leg Curl", substitution2: "Nordic Ham Curl" },
          { name: "Walking Lunge", warmupSets: "2-3", workingSets: 1, reps: "8-10", lastSetRPE: "~7", rest: "2-3 min", notes: "Take medium strides. Minimize contribution from the back leg", substitution1: "DB Step-Up", substitution2: "Goblet Squat" },
          { name: "Machine Hip Abduction", warmupSets: "1-2", workingSets: 1, reps: "10-12", lastSetRPE: "~8", rest: "1-2 min", notes: "If possible, use pads to increase the range of motion on the machine. Lean forward and grab onto the machine rails to stretch the glutes further", substitution1: "Cable Hip Abduction", substitution2: "Lateral Band Walk" },
          { name: "Standing Calf Raise", warmupSets: "1-2", workingSets: 1, reps: "10-12", lastSetRPE: "~8", rest: "1-2 min", notes: "1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth on the balls of your feet", substitution1: "Seated Calf Raise", substitution2: "Leg Press Calf Press" },
        ],
      },
    ],
  },
  // Week 3 - Foundation Block (2 sets, RPE ~7-8)
  {
    week: 3,
    block: "Foundation Block",
    days: [
      { name: "Upper (Strength Focus)", exercises: [ { name: "45° Incline Barbell Press", warmupSets: "2-3", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "3-5 min", substitution1: "45° Incline DB Press", substitution2: "45° Incline Machine Press" }, { name: "Cable Crossover Ladder", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Pec Deck", substitution2: "Bottom-Half DB Flye" }, { name: "Wide-Grip Pull-Up", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Wide-Grip Lat Pulldown", substitution2: "Dual-Handle Lat Pulldown" }, { name: "High-Cable Lateral Raise", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise" }, { name: "Pendlay Deficit Row", warmupSets: "1-2", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Smith Machine Row", substitution2: "Single-Arm DB Row" }, { name: "Overhead Cable Triceps Extension (Bar)", warmupSets: "1", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Overhead Cable Triceps Extension (Rope)", substitution2: "DB Skull Crusher" }, { name: "Bayesian Cable Curl", warmupSets: "1", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Super-Bayesian High Cable Curl", substitution2: "Incline DB Stretch Curl" } ] },
      { name: "Lower (Strength Focus)", exercises: [ { name: "Lying Leg Curl", warmupSets: "2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Leg Curl", substitution2: "Nordic Ham Curl" }, { name: "Smith Machine Squat", warmupSets: "2-4", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "3-5 min", substitution1: "DB Bulgarian Split Squat", substitution2: "High-Bar Back Squat" }, { name: "Barbell RDL", warmupSets: "2-4", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "DB RDL", substitution2: "Snatch-Grip RDL" }, { name: "Leg Extension", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Reverse Nordic", substitution2: "Sissy Squat" }, { name: "Standing Calf Raise", warmupSets: "1-2", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Calf Raise", substitution2: "Leg Press Calf Press" }, { name: "Cable Crunch", warmupSets: "1", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Decline Weighted Crunch", substitution2: "Machine Crunch" } ] },
      { name: "Pull (Hypertrophy Focus)", exercises: [ { name: "Neutral-Grip Lat Pulldown", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Neutral-Grip Pull-Up", substitution2: "Dual-Handle Lat Pulldown" }, { name: "Chest-Supported Machine Row", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Chest-Supported T-Bar Row", substitution2: "Incline Chest-Supported DB Row" }, { name: "1-Arm 45° Cable Rear Delt Flye", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Rope Face Pull", substitution2: "Reverse Pec Deck" }, { name: "Machine Shrug", warmupSets: "2-3", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Cable Paused Shrug-In", substitution2: "DB Shrug" }, { name: "EZ-Bar Cable Curl", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "EZ-Bar Curl", substitution2: "DB Curl" }, { name: "Machine Preacher Curl", warmupSets: "1", workingSets: 2, reps: "12-15", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "EZ-Bar Preacher Curl", substitution2: "DB Preacher Curl" } ] },
      { name: "Push (Hypertrophy Focus)", exercises: [ { name: "Barbell Bench Press", warmupSets: "2-4", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "3-5 min", substitution1: "Machine Chest Press", substitution2: "DB Bench Press" }, { name: "Machine Shoulder Press", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Cable Shoulder Press", substitution2: "Seated DB Shoulder Press" }, { name: "Bottom-Half DB Flye", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Bottom-Half Seated Cable Flye", substitution2: "Low-to-High Cable Crossover" }, { name: "High-Cable Lateral Raise", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise" }, { name: "Overhead Cable Triceps Extension (Bar)", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Overhead Cable Triceps Extension (Rope)", substitution2: "DB Skull Crusher" }, { name: "Cable Triceps Kickback", warmupSets: "1", workingSets: 2, reps: "12-15", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "DB Triceps Kickback", substitution2: "Bench Dip" }, { name: "Lying Leg Raise", warmupSets: "1-2", workingSets: 2, reps: "10-20", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Hanging Leg Raise", substitution2: "Modified Candlestick" } ] },
      { name: "Legs (Hypertrophy Focus)", exercises: [ { name: "Leg Press", warmupSets: "2-4", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Smith Machine Static Lunge", substitution2: "DB Walking Lunge" }, { name: "Seated Leg Curl", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Lying Leg Curl", substitution2: "Nordic Ham Curl" }, { name: "Walking Lunge", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "DB Step-Up", substitution2: "Goblet Squat" }, { name: "Machine Hip Abduction", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Cable Hip Abduction", substitution2: "Lateral Band Walk" }, { name: "Standing Calf Raise", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Calf Raise", substitution2: "Leg Press Calf Press" } ] },
    ],
  },

  // Week 4 - Foundation Block (same as Week 3)
  {
    week: 4,
    block: "Foundation Block",
    days: [
      { name: "Upper (Strength Focus)", exercises: [ { name: "45° Incline Barbell Press", warmupSets: "2-3", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "3-5 min", substitution1: "45° Incline DB Press", substitution2: "45° Incline Machine Press" }, { name: "Cable Crossover Ladder", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Pec Deck", substitution2: "Bottom-Half DB Flye" }, { name: "Wide-Grip Pull-Up", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Wide-Grip Lat Pulldown", substitution2: "Dual-Handle Lat Pulldown" }, { name: "High-Cable Lateral Raise", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise" }, { name: "Pendlay Deficit Row", warmupSets: "1-2", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Smith Machine Row", substitution2: "Single-Arm DB Row" }, { name: "Overhead Cable Triceps Extension (Bar)", warmupSets: "1", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Overhead Cable Triceps Extension (Rope)", substitution2: "DB Skull Crusher" }, { name: "Bayesian Cable Curl", warmupSets: "1", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Super-Bayesian High Cable Curl", substitution2: "Incline DB Stretch Curl" } ] },
      { name: "Lower (Strength Focus)", exercises: [ { name: "Lying Leg Curl", warmupSets: "2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Leg Curl", substitution2: "Nordic Ham Curl" }, { name: "Smith Machine Squat", warmupSets: "2-4", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "3-5 min", substitution1: "DB Bulgarian Split Squat", substitution2: "High-Bar Back Squat" }, { name: "Barbell RDL", warmupSets: "2-4", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "DB RDL", substitution2: "Snatch-Grip RDL" }, { name: "Leg Extension", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Reverse Nordic", substitution2: "Sissy Squat" }, { name: "Standing Calf Raise", warmupSets: "1-2", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Calf Raise", substitution2: "Leg Press Calf Press" }, { name: "Cable Crunch", warmupSets: "1", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Decline Weighted Crunch", substitution2: "Machine Crunch" } ] },
      { name: "Pull (Hypertrophy Focus)", exercises: [ { name: "Neutral-Grip Lat Pulldown", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Neutral-Grip Pull-Up", substitution2: "Dual-Handle Lat Pulldown" }, { name: "Chest-Supported Machine Row", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Chest-Supported T-Bar Row", substitution2: "Incline Chest-Supported DB Row" }, { name: "1-Arm 45° Cable Rear Delt Flye", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Rope Face Pull", substitution2: "Reverse Pec Deck" }, { name: "Machine Shrug", warmupSets: "2-3", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Cable Paused Shrug-In", substitution2: "DB Shrug" }, { name: "EZ-Bar Cable Curl", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "EZ-Bar Curl", substitution2: "DB Curl" }, { name: "Machine Preacher Curl", warmupSets: "1", workingSets: 2, reps: "12-15", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "EZ-Bar Preacher Curl", substitution2: "DB Preacher Curl" } ] },
      { name: "Push (Hypertrophy Focus)", exercises: [ { name: "Barbell Bench Press", warmupSets: "2-4", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "3-5 min", substitution1: "Machine Chest Press", substitution2: "DB Bench Press" }, { name: "Machine Shoulder Press", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Cable Shoulder Press", substitution2: "Seated DB Shoulder Press" }, { name: "Bottom-Half DB Flye", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Bottom-Half Seated Cable Flye", substitution2: "Low-to-High Cable Crossover" }, { name: "High-Cable Lateral Raise", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise" }, { name: "Overhead Cable Triceps Extension (Bar)", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Overhead Cable Triceps Extension (Rope)", substitution2: "DB Skull Crusher" }, { name: "Cable Triceps Kickback", warmupSets: "1", workingSets: 2, reps: "12-15", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "DB Triceps Kickback", substitution2: "Bench Dip" }, { name: "Lying Leg Raise", warmupSets: "1-2", workingSets: 2, reps: "10-20", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Hanging Leg Raise", substitution2: "Modified Candlestick" } ] },
      { name: "Legs (Hypertrophy Focus)", exercises: [ { name: "Leg Press", warmupSets: "2-4", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Smith Machine Static Lunge", substitution2: "DB Walking Lunge" }, { name: "Seated Leg Curl", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Lying Leg Curl", substitution2: "Nordic Ham Curl" }, { name: "Walking Lunge", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "DB Step-Up", substitution2: "Goblet Squat" }, { name: "Machine Hip Abduction", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Cable Hip Abduction", substitution2: "Lateral Band Walk" }, { name: "Standing Calf Raise", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Calf Raise", substitution2: "Leg Press Calf Press" } ] },
    ],
  },

  // Week 5 - Foundation Block (same as Weeks 3-4)
  {
    week: 5,
    block: "Foundation Block",
    days: [
      { name: "Upper (Strength Focus)", exercises: [ { name: "45° Incline Barbell Press", warmupSets: "2-3", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "3-5 min", substitution1: "45° Incline DB Press", substitution2: "45° Incline Machine Press" }, { name: "Cable Crossover Ladder", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Pec Deck", substitution2: "Bottom-Half DB Flye" }, { name: "Wide-Grip Pull-Up", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Wide-Grip Lat Pulldown", substitution2: "Dual-Handle Lat Pulldown" }, { name: "High-Cable Lateral Raise", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise" }, { name: "Pendlay Deficit Row", warmupSets: "1-2", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Smith Machine Row", substitution2: "Single-Arm DB Row" }, { name: "Overhead Cable Triceps Extension (Bar)", warmupSets: "1", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Overhead Cable Triceps Extension (Rope)", substitution2: "DB Skull Crusher" }, { name: "Bayesian Cable Curl", warmupSets: "1", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Super-Bayesian High Cable Curl", substitution2: "Incline DB Stretch Curl" } ] },
      { name: "Lower (Strength Focus)", exercises: [ { name: "Lying Leg Curl", warmupSets: "2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Leg Curl", substitution2: "Nordic Ham Curl" }, { name: "Smith Machine Squat", warmupSets: "2-4", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "3-5 min", substitution1: "DB Bulgarian Split Squat", substitution2: "High-Bar Back Squat" }, { name: "Barbell RDL", warmupSets: "2-4", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "DB RDL", substitution2: "Snatch-Grip RDL" }, { name: "Leg Extension", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Reverse Nordic", substitution2: "Sissy Squat" }, { name: "Standing Calf Raise", warmupSets: "1-2", workingSets: 2, reps: "6-8", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Calf Raise", substitution2: "Leg Press Calf Press" }, { name: "Cable Crunch", warmupSets: "1", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Decline Weighted Crunch", substitution2: "Machine Crunch" } ] },
      { name: "Pull (Hypertrophy Focus)", exercises: [ { name: "Neutral-Grip Lat Pulldown", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Neutral-Grip Pull-Up", substitution2: "Dual-Handle Lat Pulldown" }, { name: "Chest-Supported Machine Row", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Chest-Supported T-Bar Row", substitution2: "Incline Chest-Supported DB Row" }, { name: "1-Arm 45° Cable Rear Delt Flye", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Rope Face Pull", substitution2: "Reverse Pec Deck" }, { name: "Machine Shrug", warmupSets: "2-3", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Cable Paused Shrug-In", substitution2: "DB Shrug" }, { name: "EZ-Bar Cable Curl", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "EZ-Bar Curl", substitution2: "DB Curl" }, { name: "Machine Preacher Curl", warmupSets: "1", workingSets: 2, reps: "12-15", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "EZ-Bar Preacher Curl", substitution2: "DB Preacher Curl" } ] },
      { name: "Push (Hypertrophy Focus)", exercises: [ { name: "Barbell Bench Press", warmupSets: "2-4", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "3-5 min", substitution1: "Machine Chest Press", substitution2: "DB Bench Press" }, { name: "Machine Shoulder Press", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Cable Shoulder Press", substitution2: "Seated DB Shoulder Press" }, { name: "Bottom-Half DB Flye", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Bottom-Half Seated Cable Flye", substitution2: "Low-to-High Cable Crossover" }, { name: "High-Cable Lateral Raise", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise" }, { name: "Overhead Cable Triceps Extension (Bar)", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Overhead Cable Triceps Extension (Rope)", substitution2: "DB Skull Crusher" }, { name: "Cable Triceps Kickback", warmupSets: "1", workingSets: 2, reps: "12-15", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "DB Triceps Kickback", substitution2: "Bench Dip" }, { name: "Lying Leg Raise", warmupSets: "1-2", workingSets: 2, reps: "10-20", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Hanging Leg Raise", substitution2: "Modified Candlestick" } ] },
      { name: "Legs (Hypertrophy Focus)", exercises: [ { name: "Leg Press", warmupSets: "2-4", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "Smith Machine Static Lunge", substitution2: "DB Walking Lunge" }, { name: "Seated Leg Curl", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Lying Leg Curl", substitution2: "Nordic Ham Curl" }, { name: "Walking Lunge", warmupSets: "2-3", workingSets: 2, reps: "8-10", earlySetRPE: "~7", lastSetRPE: "~7", rest: "2-3 min", substitution1: "DB Step-Up", substitution2: "Goblet Squat" }, { name: "Machine Hip Abduction", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Cable Hip Abduction", substitution2: "Lateral Band Walk" }, { name: "Standing Calf Raise", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7", lastSetRPE: "~8", rest: "1-2 min", substitution1: "Seated Calf Raise", substitution2: "Leg Press Calf Press" } ] },
    ],
  },

  // Week 6 - Ramping Block (New exercises, 1 set, some to failure)
  {
    week: 6,
    block: "Ramping Block",
    days: [
      { name: "Upper (Strength Focus)", exercises: [ { name: "45° Incline DB Press", warmupSets: "2-3", workingSets: 1, reps: "8-10", lastSetRPE: "~6", rest: "3-5 min", substitution1: "45° Incline Barbell Press", substitution2: "45° Incline Machine Press" }, { name: "Pec Deck", warmupSets: "1-2", workingSets: 1, reps: "10-12", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Cable Crossover Ladder", substitution2: "Bottom-Half DB Flye" }, { name: "Dual-Handle Lat Pulldown", warmupSets: "1-2", workingSets: 1, reps: "10-12", lastSetRPE: "~6", rest: "2-3 min", substitution1: "Wide-Grip Lat Pulldown", substitution2: "Wide-Grip Pull-Up" }, { name: "High-Cable Lateral Raise", warmupSets: "1-2", workingSets: 1, reps: "10-12", lastSetRPE: "~6", rest: "1-2 min", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise" }, { name: "Smith Machine Row", warmupSets: "1-2", workingSets: 1, reps: "8-10", lastSetRPE: "~6", rest: "2-3 min", substitution1: "Pendlay Deficit Row", substitution2: "Single-Arm DB Row" }, { name: "Overhead Cable Triceps Extension (Bar)", warmupSets: "1", workingSets: 1, reps: "10-12", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Overhead Cable Triceps Extension (Rope)", substitution2: "DB Skull Crusher" }, { name: "Bayesian Cable Curl", warmupSets: "1", workingSets: 1, reps: "10-12", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Seated Super-Bayesian High Cable Curl", substitution2: "Incline DB Stretch Curl" } ] },
      { name: "Lower (Strength Focus)", exercises: [ { name: "Lying Leg Curl", warmupSets: "2", workingSets: 1, reps: "10-12", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Seated Leg Curl", substitution2: "Nordic Ham Curl" }, { name: "Smith Machine Static Lunge w/ Elevated Front Foot", warmupSets: "2-4", workingSets: 1, reps: "8-10", lastSetRPE: "~6", rest: "3-5 min", substitution1: "DB Bulgarian Split Squat", substitution2: "High-Bar Back Squat" }, { name: "45° Hyperextension", warmupSets: "2-4", workingSets: 1, reps: "8-10", lastSetRPE: "~6", rest: "2-3 min", substitution1: "Glute-Ham Raise", substitution2: "Cable Pull-Through" }, { name: "Leg Extension", warmupSets: "1-2", workingSets: 1, reps: "10-12", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Reverse Nordic", substitution2: "Sissy Squat" }, { name: "Leg Press Calf Press", warmupSets: "1-2", workingSets: 1, reps: "8-10", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Seated Calf Raise", substitution2: "Standing Calf Raise" }, { name: "Machine Crunch", warmupSets: "1", workingSets: 1, reps: "10-12", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Decline Weighted Crunch", substitution2: "Cable Crunch" } ] },
      { name: "Pull (Hypertrophy Focus)", exercises: [ { name: "Lean-Back Lat Pulldown", warmupSets: "2-3", workingSets: 1, reps: "10-12", lastSetRPE: "~6", rest: "2-3 min", substitution1: "Lean-Back Machine Pulldown", substitution2: "Pull-Up" }, { name: "Chest-Supported T-Bar Row", warmupSets: "2-3", workingSets: 1, reps: "10-12", lastSetRPE: "~6", rest: "2-3 min", substitution1: "Chest-Supported Machine Row", substitution2: "Incline Chest-Supported DB Row" }, { name: "1-Arm 45° Cable Rear Delt Flye", warmupSets: "1-2", workingSets: 1, reps: "12-15", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Rope Face Pull", substitution2: "Reverse Pec Deck" }, { name: "Cable Paused Shrug-In", warmupSets: "2-3", workingSets: 1, reps: "12-15", lastSetRPE: "~6", rest: "1-2 min", substitution1: "Machine Shrug", substitution2: "DB Shrug" }, { name: "Cable Rope Hammer Curl", warmupSets: "1", workingSets: 1, reps: "12-15", lastSetRPE: "~7", rest: "1-2 min", substitution1: "DB Hammer Curl", substitution2: "Hammer Preacher Curl" }, { name: "DB Concentration Curl", warmupSets: "1", workingSets: 1, reps: "15-20", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Concentration Cable Curl", substitution2: "DB Preacher Curl" } ] },
      { name: "Push (Hypertrophy Focus)", exercises: [ { name: "Machine Chest Press", warmupSets: "2-4", workingSets: 1, reps: "10-12", lastSetRPE: "~6", rest: "3-5 min", substitution1: "Barbell Bench Press", substitution2: "DB Bench Press" }, { name: "Seated DB Shoulder Press", warmupSets: "2-3", workingSets: 1, reps: "10-12", lastSetRPE: "~6", rest: "2-3 min", substitution1: "Cable Shoulder Press", substitution2: "Machine Shoulder Press" }, { name: "Bottom-Half Seated Cable Flye", warmupSets: "1-2", workingSets: 1, reps: "12-15", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Bottom-Half DB Flye", substitution2: "Low-to-High Cable Crossover" }, { name: "High-Cable Lateral Raise", warmupSets: "1", workingSets: 1, reps: "12-15", lastSetRPE: "~7", rest: "1-2 min", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise" }, { name: "EZ-Bar Skull Crusher", warmupSets: "1", workingSets: 1, reps: "12-15", lastSetRPE: "~7", rest: "1-2 min", substitution1: "DB Skull Crusher", substitution2: "Katana Triceps Extension" }, { name: "Triceps Pressdown (Bar)", warmupSets: "1", workingSets: 1, reps: "15-20", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Triceps Pressdown (Rope)", substitution2: "DB Triceps Kickback" }, { name: "Ab Wheel Rollout", warmupSets: "1-2", workingSets: 1, reps: "12-15", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Swiss Ball Rollout", substitution2: "Long-Lever Plank" } ] },
      { name: "Legs (Hypertrophy Focus)", exercises: [ { name: "Hack Squat", warmupSets: "2-4", workingSets: 1, reps: "10-12", lastSetRPE: "~6", rest: "2-3 min", substitution1: "Leg Press", substitution2: "DB Walking Lunge" }, { name: "Seated Leg Curl", warmupSets: "1-2", workingSets: 1, reps: "12-15", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Lying Leg Curl", substitution2: "Nordic Ham Curl" }, { name: "Walking Lunge", warmupSets: "2-3", workingSets: 1, reps: "10-12", lastSetRPE: "~6", rest: "2-3 min", substitution1: "Smith Machine Static Lunge", substitution2: "DB Static Lunge" }, { name: "Machine Hip Abduction", warmupSets: "1-2", workingSets: 1, reps: "12-15", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Cable Hip Abduction", substitution2: "Lateral Band Walk" }, { name: "Standing Calf Raise", warmupSets: "1-2", workingSets: 1, reps: "12-15", lastSetRPE: "~7", rest: "1-2 min", substitution1: "Seated Calf Raise", substitution2: "Leg Press Calf Press" } ] },
    ],
  },

  // Week 7 - Ramping Block (2-3 sets, some to failure RPE 10)
  {
    week: 7,
    block: "Ramping Block",
    days: [
      { name: "Upper (Strength Focus)", exercises: [ { name: "45° Incline DB Press", warmupSets: "2-3", workingSets: 3, reps: "8-10", earlySetRPE: "~7-8", lastSetRPE: "~7-8", rest: "3-5 min", substitution1: "45° Incline Barbell Press", substitution2: "45° Incline Machine Press", intensityTechnique: "N/A" }, { name: "Pec Deck", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~7-8", lastSetRPE: "~8-9", rest: "1-2 min", substitution1: "Cable Crossover Ladder", substitution2: "Bottom-Half DB Flye", intensityTechnique: "N/A" }, { name: "Dual-Handle Lat Pulldown", warmupSets: "1-2", workingSets: 3, reps: "10-12", earlySetRPE: "~7-8", lastSetRPE: "~7-8", rest: "2-3 min", substitution1: "Wide-Grip Lat Pulldown", substitution2: "Wide-Grip Pull-Up", intensityTechnique: "N/A" }, { name: "High-Cable Lateral Raise", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise", intensityTechnique: "Failure" }, { name: "Smith Machine Row", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~7-8", lastSetRPE: "~7-8", rest: "2-3 min", substitution1: "Pendlay Deficit Row", substitution2: "Single-Arm DB Row", intensityTechnique: "N/A" }, { name: "Overhead Cable Triceps Extension (Bar)", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Overhead Cable Triceps Extension (Rope)", substitution2: "DB Skull Crusher", intensityTechnique: "Failure" }, { name: "Bayesian Cable Curl", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Seated Super-Bayesian High Cable Curl", substitution2: "Incline DB Stretch Curl", intensityTechnique: "Failure" } ] },
      { name: "Lower (Strength Focus)", exercises: [ { name: "Lying Leg Curl", warmupSets: "2", workingSets: 2, reps: "10-12", earlySetRPE: "~7-8", lastSetRPE: "~8-9", rest: "1-2 min", substitution1: "Seated Leg Curl", substitution2: "Nordic Ham Curl", intensityTechnique: "N/A" }, { name: "Smith Machine Static Lunge w/ Elevated Front Foot", warmupSets: "2-4", workingSets: 3, reps: "8-10", earlySetRPE: "~7-8", lastSetRPE: "~7-8", rest: "3-5 min", substitution1: "DB Bulgarian Split Squat", substitution2: "High-Bar Back Squat", intensityTechnique: "N/A" }, { name: "45° Hyperextension", warmupSets: "2-4", workingSets: 3, reps: "8-10", earlySetRPE: "~7-8", lastSetRPE: "~7-8", rest: "2-3 min", substitution1: "Glute-Ham Raise", substitution2: "Cable Pull-Through", intensityTechnique: "N/A" }, { name: "Leg Extension", warmupSets: "1-2", workingSets: 2, reps: "10-12", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Reverse Nordic", substitution2: "Sissy Squat", intensityTechnique: "Failure" }, { name: "Leg Press Calf Press", warmupSets: "1-2", workingSets: 2, reps: "8-10", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Seated Calf Raise", substitution2: "Standing Calf Raise", intensityTechnique: "Failure" }, { name: "Machine Crunch", warmupSets: "1", workingSets: 2, reps: "10-12", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Decline Weighted Crunch", substitution2: "Cable Crunch", intensityTechnique: "Failure" } ] },
      { name: "Pull (Hypertrophy Focus)", exercises: [ { name: "Lean-Back Lat Pulldown", warmupSets: "2-3", workingSets: 2, reps: "10-12", earlySetRPE: "~7-8", lastSetRPE: "~7-8", rest: "2-3 min", substitution1: "Lean-Back Machine Pulldown", substitution2: "Pull-Up", intensityTechnique: "N/A" }, { name: "Chest-Supported T-Bar Row", warmupSets: "2-3", workingSets: 3, reps: "10-12", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "2-3 min", substitution1: "Chest-Supported Machine Row", substitution2: "Incline Chest-Supported DB Row", intensityTechnique: "Failure" }, { name: "1-Arm 45° Cable Rear Delt Flye", warmupSets: "1-2", workingSets: 2, reps: "12-15", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Rope Face Pull", substitution2: "Reverse Pec Deck", intensityTechnique: "Failure" }, { name: "Cable Paused Shrug-In", warmupSets: "2-3", workingSets: 2, reps: "12-15", earlySetRPE: "~7", lastSetRPE: "~8-9", rest: "1-2 min", substitution1: "Machine Shrug", substitution2: "DB Shrug", intensityTechnique: "N/A" }, { name: "Cable Rope Hammer Curl", warmupSets: "1", workingSets: 3, reps: "12-15", earlySetRPE: "~7", lastSetRPE: "~8-9", rest: "1-2 min", substitution1: "DB Hammer Curl", substitution2: "Hammer Preacher Curl", intensityTechnique: "N/A" }, { name: "DB Concentration Curl", warmupSets: "1", workingSets: 2, reps: "15-20", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Concentration Cable Curl", substitution2: "DB Preacher Curl", intensityTechnique: "Failure" } ] },
      { name: "Push (Hypertrophy Focus)", exercises: [ { name: "Machine Chest Press", warmupSets: "2-4", workingSets: 3, reps: "10-12", earlySetRPE: "~7-8", lastSetRPE: "~7-8", rest: "3-5 min", substitution1: "Barbell Bench Press", substitution2: "DB Bench Press", intensityTechnique: "N/A" }, { name: "Seated DB Shoulder Press", warmupSets: "2-3", workingSets: 2, reps: "10-12", earlySetRPE: "~7-8", lastSetRPE: "~7-8", rest: "2-3 min", substitution1: "Cable Shoulder Press", substitution2: "Machine Shoulder Press", intensityTechnique: "N/A" }, { name: "Bottom-Half Seated Cable Flye", warmupSets: "1-2", workingSets: 2, reps: "12-15", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Bottom-Half DB Flye", substitution2: "Low-to-High Cable Crossover", intensityTechnique: "Failure" }, { name: "High-Cable Lateral Raise", warmupSets: "1", workingSets: 2, reps: "12-15", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "High-Cable Cuffed Lateral Raise", substitution2: "Lean-In DB Lateral Raise", intensityTechnique: "Failure" }, { name: "EZ-Bar Skull Crusher", warmupSets: "1", workingSets: 3, reps: "12-15", earlySetRPE: "~7-8", lastSetRPE: "~8-9", rest: "1-2 min", substitution1: "DB Skull Crusher", substitution2: "Katana Triceps Extension", intensityTechnique: "N/A" }, { name: "Triceps Pressdown (Bar)", warmupSets: "1", workingSets: 2, reps: "15-20", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Triceps Pressdown (Rope)", substitution2: "DB Triceps Kickback", intensityTechnique: "Failure" }, { name: "Ab Wheel Rollout", warmupSets: "1-2", workingSets: 2, reps: "12-15", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Swiss Ball Rollout", substitution2: "Long-Lever Plank", intensityTechnique: "Failure" } ] },
      { name: "Legs (Hypertrophy Focus)", exercises: [ { name: "Hack Squat", warmupSets: "2-4", workingSets: 3, reps: "10-12", earlySetRPE: "~7-8", lastSetRPE: "~7-8", rest: "2-3 min", substitution1: "Leg Press", substitution2: "DB Walking Lunge", intensityTechnique: "N/A" }, { name: "Seated Leg Curl", warmupSets: "1-2", workingSets: 2, reps: "12-15", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Lying Leg Curl", substitution2: "Nordic Ham Curl", intensityTechnique: "Failure" }, { name: "Walking Lunge", warmupSets: "2-3", workingSets: 2, reps: "10-12", earlySetRPE: "~7-8", lastSetRPE: "~7-8", rest: "2-3 min", substitution1: "Smith Machine Static Lunge", substitution2: "DB Static Lunge", intensityTechnique: "N/A" }, { name: "Machine Hip Abduction", warmupSets: "1-2", workingSets: 2, reps: "12-15", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Cable Hip Abduction", substitution2: "Lateral Band Walk", intensityTechnique: "Failure" }, { name: "Standing Calf Raise", warmupSets: "1-2", workingSets: 3, reps: "12-15", earlySetRPE: "~8-9", lastSetRPE: "10", rest: "1-2 min", substitution1: "Seated Calf Raise", substitution2: "Leg Press Calf Press", intensityTechnique: "Failure" } ] },
    ],
  },
  { week: 8, block: "Building Block", days: [] },

  // Peak Block (Weeks 9-12)
  { week: 9, block: "Peak Block", days: [] },
  { week: 10, block: "Peak Block", days: [] },
  { week: 11, block: "Peak Block", days: [] },
  { week: 12, block: "Peak Block", days: [] },
];

export const WARM_UP_PROTOCOL = {
  general: {
    cardio: "5-10 minutes light cardio (treadmill, stairmaster, elliptical, bike, etc.)",
    dynamicStretches: [
      { name: "Arm Swings", reps: "10 reps per side" },
      { name: "Arm Circles", reps: "10 reps per side" },
      { name: "Front-to-Back Leg Swings", reps: "10 reps per side" },
      { name: "Side-to-Side Leg Swings", reps: "10 reps per side" },
      { name: "Cable External Rotation (optional)", reps: "15 reps per side" },
    ],
  },
  exerciseSpecific: {
    "1 Set": "Use ~60% of your planned working weight for ~6-10 reps",
    "2 Sets": "Set 1: ~50% for 6-10 reps, Set 2: ~70% for 4-6 reps",
    "3 Sets": "Set 1: ~45% for 6-10 reps, Set 2: ~65% for 4-6 reps, Set 3: ~85% for 3-4 reps",
    "4 Sets": "Set 1: ~45% for 6-10 reps, Set 2: ~60% for 4-6 reps, Set 3: ~75% for 3-5 reps, Set 4: ~85% for 2-4 reps",
  },
};
