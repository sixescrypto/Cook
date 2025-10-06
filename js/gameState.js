// Game State Management
class GameState {
    constructor() {
        this.initialized = false;
        this.gameStartTime = null;
        this.lastUpdateTime = null;
        
        // Player data
        this.player = {
            id: this.generatePlayerId(),
            name: 'Player',
            totalBUD: 0,
            accumulatedBUD: 0,
            rank: 0
        };
        
        // Plant state
        this.plant = {
            age: 0, // in minutes
            health: 100,
            hydration: 50,
            nutrition: 50,
            light: 50,
            lastGrowthUpdate: Date.now()
        };
        
        // Care action cooldowns
        this.cooldowns = {
            water: 0,
            nutrient: 0,
            light: 0,
            harvest: 0
        };
        
        // Token data
        this.token = {
            price: CONFIG.TOKEN_PRICING.INITIAL_PRICE,
            distributedTotal: 0,
            myDistributed: 0
        };
        
        // Game progress
        this.progress = {
            harvestCount: 0,
            careActionsCount: 0,
            totalPlayTime: 0
        };
        
        // Leaderboard
        this.leaderboard = [];
    }
    
    // Initialize game
    init() {
        if (this.initialized) return;
        
        // Load saved state or start new game
        const saved = this.loadFromStorage();
        if (saved) {
            Object.assign(this, saved);
            console.log('Game state loaded from storage');
        } else {
            this.gameStartTime = Date.now();
            this.lastUpdateTime = Date.now();
            console.log('New game started');
        }
        
        this.initialized = true;
        // Don't save here - systems aren't initialized yet
        // Saving will happen after plants are restored in main.js
    }
    
    // Generate unique player ID
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Update plant growth (disabled - game is functionless)
    updatePlantGrowth(deltaMinutes) {
        // Disabled - will rebuild from scratch
    }
    
    // Get time spent in current growth stage (disabled - no stages)
    getTimeInCurrentStage() {
        return 0;
    }
    
    // Advance plant to next stage (disabled - no stages)
    advancePlantStage() {
        // Disabled - no stages
        return false;
    }
    
    // Decay plant stats over time
    decayPlantStats(deltaMinutes) {
        // Stats no longer decay - automated system maintains plant
        // Keep stats at optimal levels
        this.plant.health = 100;
        this.plant.hydration = 100;
        this.plant.nutrition = 100;
        this.plant.light = 100;
    }
    
    // Perform care action
    performCareAction(action) {
        const now = Date.now();
        
        // Check cooldown
        if (this.cooldowns[action] > now) {
            return {
                success: false,
                message: 'Action on cooldown',
                remainingTime: Math.ceil((this.cooldowns[action] - now) / 1000)
            };
        }
        
        let result = { success: true, message: '' };
        
        switch (action) {
            case 'water':
                this.plant.hydration = Math.min(100, this.plant.hydration + CONFIG.CARE_STATS.HYDRATION.boost);
                this.cooldowns.water = now + (CONFIG.COOLDOWNS.WATER * 60 * 1000);
                result.message = '💧 Plant watered! Hydration increased.';
                break;
                
            case 'nutrient':
                this.plant.nutrition = Math.min(100, this.plant.nutrition + CONFIG.CARE_STATS.NUTRITION.boost);
                this.cooldowns.nutrient = now + (CONFIG.COOLDOWNS.NUTRIENT * 60 * 1000);
                result.message = '🧪 Nutrients added! Nutrition increased.';
                break;
                
            case 'light':
                this.plant.light = Math.min(100, this.plant.light + CONFIG.CARE_STATS.LIGHT.boost);
                this.cooldowns.light = now + (CONFIG.COOLDOWNS.LIGHT * 60 * 1000);
                result.message = '💡 Light adjusted! Light level increased.';
                break;
                
            case 'harvest':
                if (this.canHarvest()) {
                    const harvestAmount = this.calculateHarvestAmount();
                    this.player.totalBUD += harvestAmount;
                    this.player.accumulatedBUD = 0;
                    this.progress.harvestCount++;
                    this.cooldowns.harvest = now + (CONFIG.COOLDOWNS.HARVEST * 60 * 1000);
                    result.message = `✂️ Harvested ${harvestAmount.toFixed(2)} BUD!`;
                    result.harvestAmount = harvestAmount;
                } else {
                    result.success = false;
                    result.message = 'Cannot harvest yet! Plant needs more growth or health.';
                }
                break;
        }
        
        if (result.success) {
            this.progress.careActionsCount++;
        }
        
        return result;
    }
    
    // Check if plant can be harvested
    canHarvest() {
        return this.plant.health >= CONFIG.HARVEST_REQUIREMENTS.MIN_HEALTH &&
               this.cooldowns.harvest <= Date.now() &&
               this.player.accumulatedBUD > 0;
    }
    
    // Calculate harvest amount with bonus
    calculateHarvestAmount() {
        const base = this.player.accumulatedBUD;
        const bonus = base * CONFIG.HARVEST_BONUS;
        return base + bonus;
    }
    
    // Generate BUD tokens (disabled - game is functionless)
    generateBUD(deltaMinutes) {
        // Disabled - will rebuild from scratch
        return 0;
    }
    
    // Calculate current BUD generation rate
    getCurrentGenerationRate() {
        const careStats = {
            health: this.plant.health,
            hydration: this.plant.hydration,
            nutrition: this.plant.nutrition,
            light: this.plant.light
        };
        
        return TokenomicsUtils.calculateGenerationRate(0, careStats);
    }
    
    // Get growth progress percentage (disabled - no stages)
    getGrowthProgress() {
        return 0;
    }
    
    // Get time remaining in game
    getTimeRemaining() {
        // Game runs indefinitely now
        return Infinity;
    }
    
    // Check if game has ended
    isGameEnded() {
        // Game never ends
        return false;
    }
    
    // Update cooldown timers
    updateCooldowns() {
        const now = Date.now();
        for (let action in this.cooldowns) {
            if (this.cooldowns[action] > now) {
                this.cooldowns[action] = Math.max(0, this.cooldowns[action]);
            }
        }
    }
    
    // Get cooldown remaining time in seconds
    getCooldownRemaining(action) {
        const now = Date.now();
        if (this.cooldowns[action] <= now) return 0;
        return Math.ceil((this.cooldowns[action] - now) / 1000);
    }
    
    // Save game state to local storage
    // 🔒 SECURITY NOTE: This is ONLY used as an offline cache for fast loading
    // Server data (Supabase) is the source of truth - localStorage can be tampered with
    // but will be overwritten by server data on every page load
    saveToStorage() {
        try {
            // Serialize placed plants (exclude DOM elements and intervals)
            const serializablePlants = window.plantPlacement ? 
                window.plantPlacement.plants.map(plant => ({
                    row: plant.row,
                    col: plant.col,
                    itemId: plant.itemId,
                    itemName: plant.itemName,
                    itemDescription: plant.itemDescription,
                    rewardRate: plant.rewardRate,
                    plantedAt: plant.plantedAt,
                    rotation: plant.rotation || 0,
                    serverPlantId: plant.serverPlantId || null
                })) : [];
            
            const state = {
                gameStartTime: this.gameStartTime,
                lastUpdateTime: this.lastUpdateTime,
                player: this.player,
                plant: this.plant,
                cooldowns: this.cooldowns,
                token: this.token,
                progress: this.progress,
                // Save inventory and placed plants (offline cache only)
                inventory: window.inventorySystem ? window.inventorySystem.items : [],
                placedPlants: serializablePlants
            };
            
            localStorage.setItem(CONFIG.STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
            console.log('💾 Cache updated (localStorage). Plants:', serializablePlants.length, 'Inventory:', state.inventory);
            return true;
        } catch (e) {
            console.error('Failed to save game state:', e);
            return false;
        }
    }
    
    // Load game state from local storage
    // 🔒 SECURITY NOTE: This loads CACHED data only for display
    // Real data is loaded from Supabase server (cheat-proof)
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.GAME_STATE);
            if (!saved) return null;
            
            const state = JSON.parse(saved);
            
            // Validate saved state
            if (!state.gameStartTime || !state.player) {
                return null;
            }
            
            // Check if game has expired (more than 3 days old)
            const elapsed = Date.now() - state.gameStartTime;
            // Game never expires now - removed expiration check
            
            return state;
        } catch (e) {
            console.error('Failed to load game state:', e);
            return null;
        }
    }
    
    // Reset game state
    reset() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.GAME_STATE);
        location.reload();
    }
    
    // Get game statistics
    getStats() {
        return {
            plantAge: this.plant.age,
            totalBUD: this.player.totalBUD,
            accumulatedBUD: this.player.accumulatedBUD,
            generationRate: this.getCurrentGenerationRate(),
            harvestCount: this.progress.harvestCount,
            careActions: this.progress.careActionsCount,
            timeRemaining: this.getTimeRemaining(),
            gameProgress: (1 - (this.getTimeRemaining() / CONFIG.GAME_DURATION_MS)) * 100
        };
    }
}

// Export game state instance
const gameState = new GameState();