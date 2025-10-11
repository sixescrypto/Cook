-- Add joint upgrade tracking to players table
-- This prevents users from upgrading joint to sprout multiple times

-- Add column to track if player has already upgraded joint to sprout
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS has_upgraded_joint_to_sprout BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_joint_upgrade ON players(has_upgraded_joint_to_sprout);

-- RPC function to check if player has already upgraded
CREATE OR REPLACE FUNCTION check_player_joint_upgrade_status(
    player_wallet TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    has_upgraded BOOLEAN := FALSE;
BEGIN
    SELECT has_upgraded_joint_to_sprout INTO has_upgraded
    FROM players 
    WHERE wallet_address = player_wallet;
    
    RETURN COALESCE(has_upgraded, FALSE);
END;
$$;

-- RPC function to mark player as having upgraded joint to sprout
CREATE OR REPLACE FUNCTION mark_player_joint_upgraded(
    player_wallet TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    player_exists BOOLEAN := FALSE;
    already_upgraded BOOLEAN := FALSE;
BEGIN
    -- Check if player exists and get current upgrade status
    SELECT 
        TRUE,
        COALESCE(has_upgraded_joint_to_sprout, FALSE)
    INTO 
        player_exists,
        already_upgraded
    FROM players 
    WHERE wallet_address = player_wallet;

    -- If player doesn't exist
    IF NOT player_exists THEN
        result := json_build_object(
            'success', false,
            'message', 'Player not found',
            'error_code', 'PLAYER_NOT_FOUND'
        );
        RETURN result;
    END IF;

    -- If player has already upgraded
    IF already_upgraded THEN
        result := json_build_object(
            'success', false,
            'message', 'Player has already upgraded joint to sprout',
            'error_code', 'ALREADY_UPGRADED'
        );
        RETURN result;
    END IF;

    -- Mark player as upgraded
    UPDATE players 
    SET has_upgraded_joint_to_sprout = TRUE,
        last_active = NOW()
    WHERE wallet_address = player_wallet;

    result := json_build_object(
        'success', true,
        'message', 'Player marked as upgraded successfully',
        'wallet_address', player_wallet
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'message', 'Database error: ' || SQLERRM,
            'error_code', 'DATABASE_ERROR'
        );
        RETURN result;
END;
$$;

-- Grant necessary permissions (adjust role names as needed)
-- GRANT SELECT, UPDATE ON players TO your_app_role;
-- GRANT EXECUTE ON FUNCTION check_player_joint_upgrade_status TO your_app_role;
-- GRANT EXECUTE ON FUNCTION mark_player_joint_upgraded TO your_app_role;