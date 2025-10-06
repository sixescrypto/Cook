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

            if (error) throw error;

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
            const { data, error } = await this.supabase
                .from('placed_plants')
                .select('*')
                .eq('player_id', this.currentUser.id);

            if (error) throw error;

            console.log('🌱 Loaded placed plants:', data.length);
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
            const { data, error } = await this.supabase
                .from('inventory')
                .select('*')
                .eq('player_id', this.currentUser.id);

            if (error) throw error;

            console.log('📦 Loaded inventory from server:', data.length, 'items');
            return data;
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
                    .from('inventory')
                    .delete()
                    .eq('player_id', this.currentUser.id)
                    .eq('item_id', itemId);

                if (error) throw error;
                console.log('🗑️ Removed', itemId, 'from server inventory (count = 0)');
            } else {
                // Update the count
                const { error } = await this.supabase
                    .from('inventory')
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

    // Purchase item from shop
    async purchaseItem(itemId, price) {
        if (!this.currentUser) return false;

        try {
            // Call server function that validates purchase and updates BUD
            const { data, error } = await this.supabase
                .rpc('purchase_item', {
                    p_player_id: this.currentUser.id,
                    p_item_id: itemId,
                    p_item_price: price
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
                    player_id: this.currentUser.id
                });

            if (error) throw error;

            console.log('✅ BUD harvested:', data);
            return true;
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
}

// Create global instance
window.supabaseClient = new SupabaseClient();
