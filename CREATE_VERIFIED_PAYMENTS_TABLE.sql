-- Create verified_payments table to prevent payment signature reuse
-- This table stores all verified blockchain payments to prevent double-spending

CREATE TABLE IF NOT EXISTS verified_payments (
    id BIGSERIAL PRIMARY KEY,
    signature TEXT UNIQUE NOT NULL,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    wallet_from TEXT NOT NULL,
    wallet_to TEXT NOT NULL,
    amount_sol DECIMAL(20, 10) NOT NULL,
    transaction_time TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    item_purchased TEXT,
    used_for TEXT, -- 'upgrade', 'item_purchase', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast signature lookups
CREATE INDEX IF NOT EXISTS idx_verified_payments_signature ON verified_payments(signature);

-- Create index for player lookups
CREATE INDEX IF NOT EXISTS idx_verified_payments_player_id ON verified_payments(player_id);

-- Create index for verification time lookups
CREATE INDEX IF NOT EXISTS idx_verified_payments_verified_at ON verified_payments(verified_at);

-- RPC function to check if a payment signature has been used
CREATE OR REPLACE FUNCTION check_payment_signature_used(
    signature_to_check TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM verified_payments 
        WHERE signature = signature_to_check
    );
END;
$$;

-- RPC function to store a verified payment signature
CREATE OR REPLACE FUNCTION store_verified_payment(
    p_signature TEXT,
    p_player_id UUID,
    p_wallet_from TEXT,
    p_wallet_to TEXT,
    p_amount_sol DECIMAL,
    p_transaction_time TIMESTAMP WITH TIME ZONE,
    p_item_purchased TEXT DEFAULT NULL,
    p_used_for TEXT DEFAULT 'upgrade'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if signature already exists
    IF EXISTS (SELECT 1 FROM verified_payments WHERE signature = p_signature) THEN
        result := json_build_object(
            'success', false,
            'message', 'Payment signature already used',
            'error_code', 'SIGNATURE_ALREADY_USED'
        );
        RETURN result;
    END IF;

    -- Insert the verified payment
    INSERT INTO verified_payments (
        signature,
        player_id,
        wallet_from,
        wallet_to,
        amount_sol,
        transaction_time,
        item_purchased,
        used_for
    ) VALUES (
        p_signature,
        p_player_id,
        p_wallet_from,
        p_wallet_to,
        p_amount_sol,
        p_transaction_time,
        p_item_purchased,
        p_used_for
    );

    result := json_build_object(
        'success', true,
        'message', 'Payment signature stored successfully',
        'signature', p_signature
    );
    
    RETURN result;
    
EXCEPTION
    WHEN unique_violation THEN
        result := json_build_object(
            'success', false,
            'message', 'Payment signature already used',
            'error_code', 'SIGNATURE_ALREADY_USED'
        );
        RETURN result;
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
-- GRANT SELECT, INSERT ON verified_payments TO your_app_role;
-- GRANT EXECUTE ON FUNCTION check_payment_signature_used TO your_app_role;
-- GRANT EXECUTE ON FUNCTION store_verified_payment TO your_app_role;