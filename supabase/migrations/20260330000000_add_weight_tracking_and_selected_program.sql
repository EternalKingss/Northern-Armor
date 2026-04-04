-- Add selected_program column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS selected_program TEXT DEFAULT 'bodybuilding';

-- Create weight_tracking table (replaces localStorage weightTracking_${userId})
CREATE TABLE IF NOT EXISTS weight_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  initial_weight NUMERIC,
  goal_weight NUMERIC,
  check_ins JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE weight_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own weight tracking data
CREATE POLICY "Users can manage own weight tracking"
  ON weight_tracking
  FOR ALL
  USING (auth.uid() = user_id);
