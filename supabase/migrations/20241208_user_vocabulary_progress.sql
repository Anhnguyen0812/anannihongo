-- Migration: Create user_vocabulary_progress table for SRS
-- Run this in Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS user_vocabulary_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vocabulary_id INTEGER NOT NULL,
    srs_level INTEGER DEFAULT 0 CHECK (srs_level >= 0 AND srs_level <= 5),
    next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique user-vocabulary combination
    UNIQUE(user_id, vocabulary_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_vocab_progress_user_id ON user_vocabulary_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vocab_progress_next_review ON user_vocabulary_progress(next_review);
CREATE INDEX IF NOT EXISTS idx_user_vocab_progress_srs_level ON user_vocabulary_progress(srs_level);

-- Enable Row Level Security
ALTER TABLE user_vocabulary_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own progress
CREATE POLICY "Users can view own progress"
    ON user_vocabulary_progress
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress"
    ON user_vocabulary_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own progress
CREATE POLICY "Users can update own progress"
    ON user_vocabulary_progress
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own progress
CREATE POLICY "Users can delete own progress"
    ON user_vocabulary_progress
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_vocabulary_progress_updated_at ON user_vocabulary_progress;
CREATE TRIGGER update_user_vocabulary_progress_updated_at
    BEFORE UPDATE ON user_vocabulary_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON user_vocabulary_progress TO authenticated;
