// Game Configuration and Tokenomics
const CONFIG = {
    // Token Economics
    TOTAL_SUPPLY: 200000000, // 200 million BUD tokens
    ESTIMATED_USERS: 100,
    GAME_DURATION_HOURS: 72, // 3 days
    GAME_DURATION_MS: 72 * 60 * 60 * 1000, // 3 days in milliseconds
    
    // Distribution calculations:
    // If 100 users play for 3 days, and we want to distribute most of the supply
    // Average per user: 200M / 100 = 2M BUD per user over 3 days
    // Average per hour: 2M / 72 = ~27,778 BUD per hour per user
    // Average per minute: ~463 BUD per minute per user
    
    TOKENS_PER_USER_TOTAL: 2000000, // 2M BUD per user over 3 days
    BASE_GENERATION_RATE: 7.72, // Base BUD per minute (463 / 60)
    
    // Plant Care System
    CARE_STATS: {
        HEALTH: { min: 0, max: 100, decay: 0.5, boost: 15 }, // Decays 0.5% per minute
        HYDRATION: { min: 0, max: 100, decay: 1.0, boost: 25 }, // Decays 1% per minute
        NUTRITION: { min: 0, max: 100, decay: 0.3, boost: 20 }, // Decays 0.3% per minute
        LIGHT: { min: 0, max: 100, decay: 0.2, boost: 30 } // Decays 0.2% per minute
    },
    
    // Care action cooldowns (minutes)
    COOLDOWNS: {
        WATER: 5,      // 5 minutes between watering
        NUTRIENT: 10,  // 10 minutes between nutrients
        LIGHT: 15,     // 15 minutes between light adjustments
        HARVEST: 60    // 1 hour between harvests
    },
    
    // Multiplier calculation based on care stats
    // Perfect care (all stats at 100%) = 2x multiplier
    // Poor care (stats below 30%) = 0.5x multiplier
    CARE_MULTIPLIER_RANGE: { min: 0.2, max: 2.0 },
    
    // Harvest System
    HARVEST_REQUIREMENTS: {
        MIN_STAGE: 3,     // Must be at least Vegetative stage
        MIN_HEALTH: 50,   // Must have at least 50% health
        COOLDOWN: 60      // 1 hour cooldown between harvests
    },
    
    // Bonus BUD from harvest (percentage of accumulated BUD)
    HARVEST_BONUS: 0.15, // 15% bonus BUD when harvesting
    
    // Token Pricing (simulated PumpFun dynamics)
    TOKEN_PRICING: {
        INITIAL_PRICE: 0.0001,  // $0.0001 per BUD
        PRICE_VOLATILITY: 0.02, // 2% volatility
        DEMAND_FACTOR: 0.000001, // Price increases with more tokens distributed
        SUPPLY_PRESSURE: 0.0000005 // Price decreases with rapid distribution
    },
    
    // Leaderboard and Competition
    LEADERBOARD: {
        UPDATE_INTERVAL: 30000, // Update every 30 seconds
        MAX_ENTRIES: 10,        // Show top 10 players
        BONUS_REWARDS: {
            1: 1.5,  // 1st place: 50% bonus
            2: 1.3,  // 2nd place: 30% bonus
            3: 1.2,  // 3rd place: 20% bonus
            4: 1.1,  // 4th-5th place: 10% bonus
            5: 1.1
        }
    },
    
    // UI Update Intervals
    UPDATE_INTERVALS: {
        GAME_LOOP: 1000,      // Main game loop: 1 second
        BUD_GENERATION: 5000, // BUD generation: 5 seconds
        PLANT_DECAY: 60000,   // Plant stat decay: 1 minute
        PRICE_UPDATE: 10000,  // Token price update: 10 seconds
        LEADERBOARD: 30000    // Leaderboard update: 30 seconds
    },
    
    // Visual Effects
    EFFECTS: {
        BUD_PARTICLE_COUNT: 5,     // Number of BUD particles per generation
        ANIMATION_DURATION: 1000,   // Animation duration in ms
        NOTIFICATION_DURATION: 3000 // Notification display time
    },
    
    // Local Storage Keys
    STORAGE_KEYS: {
        GAME_STATE: 'budGarden_gameState',
        USER_DATA: 'budGarden_userData',
        SETTINGS: 'budGarden_settings'
    },
    
    // API Endpoints (for future backend integration)
    API: {
        BASE_URL: 'https://api.budgarden.game',
        ENDPOINTS: {
            USER_REGISTER: '/user/register',
            USER_LOGIN: '/user/login',
            GAME_STATE: '/game/state',
            LEADERBOARD: '/game/leaderboard',
            TOKEN_PRICE: '/token/price'
        }
    }
};

// Utility functions for tokenomics calculations
const TokenomicsUtils = {
    // Calculate current generation rate based on plant state and care
    calculateGenerationRate(plantStage, careStats) {
        const baseRate = CONFIG.BASE_GENERATION_RATE;
        const stageMultiplier = CONFIG.GENERATION_MULTIPLIERS[plantStage] || 0.1;
        
        // Calculate care multiplier (average of all care stats)
        const careAverage = (careStats.health + careStats.hydration + 
                           careStats.nutrition + careStats.light) / 4;
        
        const careMultiplier = CONFIG.CARE_MULTIPLIER_RANGE.min + 
            (careAverage / 100) * (CONFIG.CARE_MULTIPLIER_RANGE.max - CONFIG.CARE_MULTIPLIER_RANGE.min);
        
        return baseRate * stageMultiplier * careMultiplier;
    },
    
    // Calculate time remaining in game
    getTimeRemaining(gameStartTime) {
        const elapsed = Date.now() - gameStartTime;
        const remaining = CONFIG.GAME_DURATION_MS - elapsed;
        return Math.max(0, remaining);
    },
    
    // Format time for display
    formatTime(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    // Calculate dynamic token price
    calculateTokenPrice(basePrice, distributedTokens, demandFactor) {
        const demandMultiplier = 1 + (distributedTokens * CONFIG.TOKEN_PRICING.DEMAND_FACTOR);
        const volatility = (Math.random() - 0.5) * CONFIG.TOKEN_PRICING.PRICE_VOLATILITY;
        
        return basePrice * demandMultiplier * (1 + volatility);
    },
    
    // Calculate leaderboard bonus
    getLeaderboardBonus(rank) {
        return CONFIG.LEADERBOARD.BONUS_REWARDS[rank] || 1.0;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, TokenomicsUtils };
}