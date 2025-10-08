-- Replace starter sprout with a free joint for new players
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Add joint to items table (if it exists)
-- ============================================
-- Insert joint into items table
-- Note: Won't appear in shop if you filter by price > 0 or sort_order < 999
INSERT INTO items (id, name, description, image_url, price, generation_rate, max_purchases, sort_order)
VALUES ('joint', 'Joint', 'Have the first one on us..', 'assets/sprites/joint.png', 0, 0, 1, 999)
ON CONFLICT (id) DO UPDATE SET
    name = 'Joint',
    description = 'Have the first one on us..',
    image_url = 'assets/sprites/joint.png',
    max_purchases = 1,
    price = 0,
    generation_rate = 0,
    sort_order = 999;

-- ============================================
-- STEP 2: Drop ALL old triggers and functions
-- ============================================
-- Drop any trigger that might be giving starter items
DROP TRIGGER IF EXISTS give_starter_inventory ON players;
DROP TRIGGER IF EXISTS give_starter_joint_trigger ON players;
DROP TRIGGER IF EXISTS add_starter_sprout ON players;
DROP TRIGGER IF EXISTS give_starter_items ON players;
DROP TRIGGER IF EXISTS give_starter_items_trigger ON players;

-- Drop all related functions (CASCADE removes dependent triggers)
DROP FUNCTION IF EXISTS add_starter_inventory() CASCADE;
DROP FUNCTION IF EXISTS give_starter_joint() CASCADE;
DROP FUNCTION IF EXISTS add_starter_sprout() CASCADE;
DROP FUNCTION IF EXISTS give_starter_items() CASCADE;

-- List all triggers on players table to verify cleanup
SELECT trigger_name, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'players'
  AND trigger_schema = 'public';

-- ============================================
-- STEP 3: Create function to give new players a joint
-- ============================================
CREATE OR REPLACE FUNCTION give_starter_joint()
RETURNS TRIGGER AS $$
BEGIN
    -- Only give joint if player has a username (registered through auth system)
    IF NEW.username IS NOT NULL THEN
        -- Give 1 joint to the new player
        INSERT INTO player_inventory (player_id, item_id, count)
        VALUES (NEW.id, 'joint', 1)
        ON CONFLICT (player_id, item_id) DO UPDATE
        SET count = player_inventory.count + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 4: Create trigger to automatically give joint
-- ============================================
CREATE TRIGGER give_starter_joint_trigger
    AFTER INSERT ON players
    FOR EACH ROW
    EXECUTE FUNCTION give_starter_joint();

-- ============================================
-- STEP 5: (Optional) Give joints to existing registered players
-- ============================================
-- Uncomment the lines below to give joints to all existing players with usernames

-- Give a joint to all existing players who don't have one yet
-- INSERT INTO player_inventory (player_id, item_id, count)
-- SELECT id, 'joint', 1
-- FROM players
-- WHERE username IS NOT NULL
--   AND id NOT IN (SELECT player_id FROM player_inventory WHERE item_id = 'joint')
-- ON CONFLICT (player_id, item_id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'players'
  AND trigger_schema = 'public';

-- Check if joint exists in items table
SELECT * FROM items WHERE id = 'joint';

-- Check how many players have joints
SELECT 
    COUNT(*) as players_with_joints,
    SUM(count) as total_joints
FROM player_inventory 
WHERE item_id = 'joint';


