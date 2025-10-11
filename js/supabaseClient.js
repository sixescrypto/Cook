// Supabase Client and API Functions
// This handles all server-side communication for BUD generation and player state

class SupabaseClient {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.isInitialized = false;
    }

    // Initialize Supabase connection
    async init(supabaseUrl, supabaseAnonKey) {
        try {
            // Initialize Supabase client
            this.supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
            this.isInitialized = true;
            console.log('✅ Supabase client initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            return false;
        }
    }

    // Authenticate user with wallet address
    async authenticateWallet(walletAddress) {
        try {
            // Check if player exists
            const { data: existingPlayer, error } = await this.supabase
                .from('players')
                .select('*')
                .eq('wallet_address', walletAddress)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (existingPlayer) {
                this.currentUser = existingPlayer;
                console.log('✅ Player authenticated:', walletAddress);
                return existingPlayer;
            } else {
                // Create new player
                const newPlayer = await this.createPlayer(walletAddress);
                return newPlayer;
            }
        } catch (error) {
            console.error('❌ Authentication failed:', error);
            return null;
        }
    }

    // Create new player in database
    async createPlayer(walletAddress) {
        try {
            console.log('🔄 Attempting to create player:', walletAddress);
            
            const { data, error } = await this.supabase
                .from('players')
                .insert([
                    {
                        wallet_address: walletAddress,
                        total_bud: 0,
                        accumulated_bud: 0,
                        last_active: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('❌ Supabase INSERT error:', error.message);
                console.error('📋 Error code:', error.code);
                console.error('📝 Error details:', error.details);
                console.error('💡 Error hint:', error.hint);
                console.error('🔢 Status:', error.status);
                console.error('🔍 Full error object:', JSON.stringify(error, null, 2));
                throw error;
            }

            this.currentUser = data;
            console.log('✅ New player created:', walletAddress);
            return data;
        } catch (error) {
            console.error('❌ Failed to create player:', error);
            return null;
        }
    }

    // Get player's current BUD balance (calculated server-side with offline generation)
    // This version does NOT update last_active, so it can be called frequently
    async getPlayerBUD() {
        if (!this.currentUser) {
            console.warn('⚠️ No authenticated user');
            return { totalBUD: 0, accumulatedBUD: 0 };
        }

        try {
            // Call server function that calculates current BUD without updating timestamp
            const { data, error } = await this.supabase
                .rpc('get_player_bud', {
                    p_player_id: this.currentUser.id
                });

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('❌ Failed to get player BUD:', error);
            return { totalBUD: 0, accumulatedBUD: 0 };
        }
    }

    // Claim accumulated BUD (updates last_active timestamp)
    // Call this only when player loads the game or manually claims
    async claimAccumulatedBUD() {
        if (!this.currentUser) {
            console.warn('⚠️ No authenticated user');
            return { success: false };
        }

        try {
            const { data, error } = await this.supabase
                .rpc('claim_accumulated_bud', {
                    p_player_id: this.currentUser.id
                });

            if (error) throw error;

            console.log('💰 Claimed accumulated BUD:', data);
            return data;
        } catch (error) {
            console.error('❌ Failed to claim BUD:', error);
            return { success: false };
        }
    }

    // Get all placed plants for current player
    async getPlacedPlants() {
        if (!this.currentUser) return [];

        try {
            // Try to get plants with items data (requires foreign key relationship)
            const { data, error } = await this.supabase
                .from('placed_plants')
                .select(`
                    *,
                    items (
                        image_url,
                        name,
                        description
                    )
                `)
                .eq('player_id', this.currentUser.id);

            if (error) {
                // If JOIN fails (no foreign key), fallback to simple query
                console.warn('⚠️ Foreign key relationship missing, using fallback query');
                console.error('Join error:', error);
                const fallback = await this.supabase
                    .from('placed_plants')
                    .select('*')
                    .eq('player_id', this.currentUser.id);
                
                if (fallback.error) throw fallback.error;
                console.log('🌱 Loaded placed plants (fallback):', fallback.data.length);
                return fallback.data;
            }

            console.log('🌱 Loaded placed plants:', data.length);
            console.log('🔍 Sample plant data structure:', data[0]);
            return data;
        } catch (error) {
            console.error('❌ Failed to get placed plants:', error);
            return [];
        }
    }

    // Place a plant on the grid
    async placePlant(itemId, row, col, rewardRate, rotation = 0) {
        if (!this.currentUser) {
            console.warn('⚠️ No authenticated user');
            return null;
        }

        try {
            const { data, error } = await this.supabase
                .from('placed_plants')
                .insert([
                    {
                        player_id: this.currentUser.id,
                        item_id: itemId,
                        grid_row: row,
                        grid_col: col,
                        reward_rate: rewardRate,
                        rotation: rotation,
                        placed_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Plant placed on server:', data);
            return data;
        } catch (error) {
            console.error('❌ Failed to place plant:', error);
            return null;
        }
    }

    // Update plant rotation
    async updatePlantRotation(plantId, rotation) {
        if (!this.currentUser) return false;

        try {
            const { error } = await this.supabase
                .from('placed_plants')
                .update({ rotation: rotation })
                .eq('id', plantId)
                .eq('player_id', this.currentUser.id);

            if (error) throw error;

            console.log('✅ Plant rotation updated on server');
            return true;
        } catch (error) {
            console.error('❌ Failed to update plant rotation:', error);
            return false;
        }
    }

    // Remove a plant from the grid
    async removePlant(plantId) {
        if (!this.currentUser) return false;

        try {
            const { error } = await this.supabase
                .from('placed_plants')
                .delete()
                .eq('id', plantId)
                .eq('player_id', this.currentUser.id);

            if (error) throw error;

            console.log('✅ Plant removed from server');
            return true;
        } catch (error) {
            console.error('❌ Failed to remove plant:', error);
            return false;
        }
    }

    // Get player's inventory from server
    async getInventory() {
        if (!this.currentUser) return [];

        try {
            // JOIN with items table to get full item details including image_url
            const { data, error } = await this.supabase
                .from('player_inventory')
                .select(`
                    item_id,
                    count,
                    items (
                        name,
                        description,
                        image_url,
                        generation_rate,
                        price
                    )
                `)
                .eq('player_id', this.currentUser.id);

            if (error) throw error;

            console.log('📦 Loaded inventory from server:', data ? data.length : 0, 'items');
            return data || [];
        } catch (error) {
            console.error('❌ Failed to get inventory:', error);
            return [];
        }
    }

    // Update inventory item count on server
    async updateInventoryCount(itemId, newCount) {
        if (!this.currentUser) return false;

        try {
            if (newCount <= 0) {
                // If count is 0 or negative, delete the inventory row
                const { error } = await this.supabase
                    .from('player_inventory')
                    .delete()
                    .eq('player_id', this.currentUser.id)
                    .eq('item_id', itemId);

                if (error) throw error;
                console.log('🗑️ Removed', itemId, 'from server inventory (count = 0)');
            } else {
                // Update the count
                const { error } = await this.supabase
                    .from('player_inventory')
                    .update({ count: newCount })
                    .eq('player_id', this.currentUser.id)
                    .eq('item_id', itemId);

                if (error) throw error;
                console.log('📦 Updated', itemId, 'count to', newCount, 'on server');
            }

            return true;
        } catch (error) {
            console.error('❌ Failed to update inventory count:', error);
            return false;
        }
    }

    // Add item to inventory on server (with proper upsert logic)
    async addToInventory(itemId, countToAdd = 1) {
        if (!this.currentUser) return false;

        try {
            console.log('🔍 Checking if', itemId, 'exists in inventory...');
            
            // First, check if item already exists
            const { data: existingItem, error: selectError } = await this.supabase
                .from('player_inventory')
                .select('count')
                .eq('player_id', this.currentUser.id)
                .eq('item_id', itemId)
                .maybeSingle(); // Use maybeSingle instead of single to avoid error on empty result

            if (selectError) {
                console.error('❌ Error checking existing item:', selectError);
                throw selectError;
            }

            let newCount = countToAdd;
            if (existingItem) {
                // Item exists, add to existing count
                newCount = existingItem.count + countToAdd;
                console.log('📦 Item exists, updating count from', existingItem.count, 'to', newCount);
                
                const { error } = await this.supabase
                    .from('player_inventory')
                    .update({ count: newCount })
                    .eq('player_id', this.currentUser.id)
                    .eq('item_id', itemId);

                if (error) throw error;
                console.log('✅ Updated', itemId, 'count to', newCount, 'on server');
            } else {
                // Item doesn't exist, insert new
                console.log('➕ Item doesn\'t exist, creating new with count:', newCount);
                
                const { error } = await this.supabase
                    .from('player_inventory')
                    .insert({
                        player_id: this.currentUser.id,
                        item_id: itemId,
                        count: newCount
                    });

                if (error) throw error;
                console.log('✅ Added new', itemId, 'to server inventory (count:', newCount + ')');
            }

            return true;
        } catch (error) {
            console.error('❌ Failed to add item to inventory:', error);
            return false;
        }
    }

    // Purchase item from shop (SERVER-SIDE PRICE VALIDATION)
    // Price is NOT sent from client - server looks it up from database
    async purchaseItem(itemId) {
        if (!this.currentUser) return false;

        try {
            // Call server function that validates purchase and updates BUD
            // Server fetches price from database (NO client-side price manipulation)
            const { data, error } = await this.supabase
                .rpc('purchase_item', {
                    p_player_id: this.currentUser.id,
                    p_item_id: itemId
                    // ❌ NO p_item_price parameter - server validates price
                });

            if (error) throw error;

            if (data.success) {
                console.log('✅ Item purchased:', itemId);
                return data;
            } else {
                console.warn('⚠️ Purchase failed:', data.message);
                return data;
            }
        } catch (error) {
            console.error('❌ Failed to purchase item:', error);
            return { success: false, message: error.message };
        }
    }

    // Update player's last active timestamp
    async updateLastActive() {
        if (!this.currentUser) return;

        try {
            const { error } = await this.supabase
                .from('players')
                .update({ last_active: new Date().toISOString() })
                .eq('id', this.currentUser.id);

            if (error) throw error;
        } catch (error) {
            console.error('❌ Failed to update last active:', error);
        }
    }

    // Harvest accumulated BUD (move to total)
    async harvestBUD() {
        if (!this.currentUser) return false;

        try {
            const { data, error } = await this.supabase
                .rpc('harvest_bud', {
                    p_player_id: this.currentUser.id
                });

            if (error) throw error;

            console.log('✅ BUD harvested:', data);
            
            // Pay 2% referral earnings if applicable
            if (data && data.claimed > 0) {
                this.payReferralEarnings(this.currentUser.id, data.claimed)
                    .catch(err => console.warn('⚠️ Referral payout failed:', err));
            }
            
            return data;
        } catch (error) {
            console.error('❌ Failed to harvest BUD:', error);
            return false;
        }
    }

    // Get total registered player count
    async getPlayerCount() {
        try {
            console.log('🔍 Fetching player count from database...');
            
            const { count, error } = await this.supabase
                .from('players')
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.error('❌ Supabase query error:', error);
                throw error;
            }

            console.log('📊 Total registered players from query:', count);
            return count || 0;
        } catch (error) {
            console.error('❌ Failed to get player count:', error);
            return 0;
        }
    }
    
    // Pay 2% referral earnings to referrer when referred player earns BUD
    async payReferralEarnings(playerId, budEarned) {
        try {
            // Get player's referral info (playerId is actually the UUID)
            const { data: player, error: playerError } = await this.supabase
                .from('players')
                .select('referred_by, referral_code, username')
                .eq('id', playerId)
                .single();
            
            if (playerError || !player || !player.referred_by || player.referred_by === 'SYSTEM') {
                // No referrer or system referral, skip payout
                return { success: false, reason: 'no_referrer' };
            }
            
            const referrerUsername = player.referred_by;
            const referralCode = player.referral_code;
            const referralEarnings = Math.floor(budEarned * 0.02); // 2% of earnings
            
            if (referralEarnings <= 0) {
                return { success: false, reason: 'too_small' };
            }
            
            console.log(`💰 Paying ${referralEarnings} BUD (2%) to referrer:`, referrerUsername);
            
            // Add BUD to referrer's balance (lookup by username, not id)
            const { data: referrer, error: referrerError } = await this.supabase
                .from('players')
                .select('total_bud, accumulated_bud')
                .eq('username', referrerUsername)
                .single();
            
            if (referrerError || !referrer) {
                console.error('❌ Referrer not found:', referrerUsername);
                return { success: false, reason: 'referrer_not_found' };
            }
            
            // Update referrer's BUD balance (update by username, not id)
            const { error: updateError } = await this.supabase
                .from('players')
                .update({
                    total_bud: (referrer.total_bud || 0) + referralEarnings,
                    accumulated_bud: (referrer.accumulated_bud || 0) + referralEarnings
                })
                .eq('username', referrerUsername);
            
            if (updateError) {
                console.error('❌ Failed to update referrer balance:', updateError);
                return { success: false, reason: 'update_failed' };
            }
            
            // Update referral code earnings
            const { data: codeData } = await this.supabase
                .from('invite_codes')
                .select('total_referral_earnings')
                .eq('code', referralCode)
                .single();
            
            if (codeData) {
                await this.supabase
                    .from('invite_codes')
                    .update({
                        total_referral_earnings: (codeData.total_referral_earnings || 0) + referralEarnings
                    })
                    .eq('code', referralCode);
            }
            
            console.log(`✅ Paid ${referralEarnings} BUD to ${referrerUsername} (referral earnings)`);
            
            return {
                success: true,
                referrer: referrerUsername,
                amount: referralEarnings
            };
            
        } catch (error) {
            console.error('❌ Failed to pay referral earnings:', error);
            return { success: false, reason: 'error', error };
        }
    }

    // Check if a payment signature has already been used
    async checkPaymentSignatureUsed(signature) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not initialized');
            }

            console.log('🔍 Checking if payment signature has been used:', signature);

            const { data, error } = await this.supabase
                .rpc('check_payment_signature_used', {
                    signature_to_check: signature
                });

            if (error) {
                console.error('❌ Error checking payment signature:', error);
                throw error;
            }

            const isUsed = data === true;
            console.log(isUsed ? '⚠️ Payment signature already used' : '✅ Payment signature is available');
            
            return isUsed;

        } catch (error) {
            console.error('❌ Failed to check payment signature:', error);
            throw error;
        }
    }

    // Store a verified payment signature to prevent reuse
    async storeVerifiedPayment(paymentDetails, usedFor = 'upgrade', itemPurchased = null) {
        try {
            if (!this.supabase || !this.currentUser) {
                throw new Error('Supabase not initialized or user not authenticated');
            }

            console.log('💾 Storing verified payment signature:', {
                signature: paymentDetails.signature,
                usedFor,
                itemPurchased
            });

            const { data, error } = await this.supabase
                .rpc('store_verified_payment', {
                    p_signature: paymentDetails.signature,
                    p_player_id: this.currentUser.id,
                    p_wallet_from: paymentDetails.from,
                    p_wallet_to: paymentDetails.to,
                    p_amount_sol: paymentDetails.amount,
                    p_transaction_time: new Date(paymentDetails.timestamp).toISOString(),
                    p_item_purchased: itemPurchased,
                    p_used_for: usedFor
                });

            if (error) {
                console.error('❌ Error storing payment signature:', error);
                throw error;
            }

            if (!data.success) {
                console.error('❌ Failed to store payment:', data.message);
                return { success: false, message: data.message, errorCode: data.error_code };
            }

            console.log('✅ Payment signature stored successfully');
            return { success: true, signature: paymentDetails.signature };

        } catch (error) {
            console.error('❌ Failed to store verified payment:', error);
            throw error;
        }
    }

    // Check if player has already upgraded joint to sprout
    async checkPlayerJointUpgradeStatus(walletAddress) {
        try {
            const { data, error } = await this.supabase
                .rpc('check_player_joint_upgrade_status', {
                    player_wallet: walletAddress
                });

            if (error) {
                console.error('❌ Failed to check joint upgrade status:', error);
                throw error;
            }

            return data; // Returns boolean
        } catch (error) {
            console.error('❌ Failed to check joint upgrade status:', error);
            throw error;
        }
    }

    // Mark player as having upgraded joint to sprout
    async markPlayerJointUpgraded(walletAddress) {
        try {
            const { data, error } = await this.supabase
                .rpc('mark_player_joint_upgraded', {
                    player_wallet: walletAddress
                });

            if (error) {
                console.error('❌ Failed to mark joint upgrade:', error);
                throw error;
            }

            return data; // Returns JSON result
        } catch (error) {
            console.error('❌ Failed to mark joint upgrade:', error);
            throw error;
        }
    }
}

// Create global instance
window.supabaseClient = new SupabaseClient();

