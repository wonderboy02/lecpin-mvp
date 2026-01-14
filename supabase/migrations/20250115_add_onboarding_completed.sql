-- Add onboarding_completed column to users table
-- This tracks whether a user has completed the onboarding flow

ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have onboarding_completed = true (they've already been using the service)
UPDATE users SET onboarding_completed = TRUE WHERE onboarding_completed IS NULL;
