// Token System - Handles PumpFun token integration and price tracking
class TokenSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.priceHistory = [];
        this.updateInterval = null;
        this.globalDistributed = 0;
        this.activePlayers = 1;
    }
    
    // Initialize token system
    init() {
        this.updateTokenPrice();
        this.startPriceTracking();
        this.simulateGlobalActivity();
        this.fetchPlayerCount(); // Fetch real player count on init
        
        // Fetch player count every 5 minutes instead of every price update
        setInterval(() => {
            this.fetchPlayerCount();
        }, 5 * 60 * 1000); // Every 5 minutes
    }
    
    // Fetch real player count from database
    async fetchPlayerCount() {
        if (!window.supabaseClient || !window.supabaseClient.isInitialized) {
            console.warn('⚠️ Supabase not initialized, cannot fetch player count');
            return;
        }
        
        try {
            const count = await window.supabaseClient.getPlayerCount();
            console.log(`📊 Player count from database: ${count}`);
            
            if (count > 0) {
                this.activePlayers = count;
                console.log(`✅ Active players updated: ${this.activePlayers}`);
                
                // Trigger UI update if uiSystem is available
                if (window.uiSystem && window.uiSystem.updateTokenInfo) {
                    window.uiSystem.updateTokenInfo();
                    console.log('🔄 UI updated with new player count');
                }
            } else {
                console.warn('⚠️ Player count is 0 or null, keeping current value:', this.activePlayers);
            }
        } catch (error) {
            console.error('❌ Failed to fetch player count:', error);
        }
    }
    
    // Start price tracking loop
    startPriceTracking() {
        this.updateInterval = setInterval(() => {
            this.updateTokenPrice();
            this.updateGlobalStats();
        }, CONFIG.UPDATE_INTERVALS.PRICE_UPDATE);
    }
    
    // Update token price with volatility
    updateTokenPrice() {
        const basePrice = CONFIG.TOKEN_PRICING.INITIAL_PRICE;
        const distributed = this.globalDistributed + this.gameState.token.myDistributed;
        
        // Calculate price based on distribution
        const demandMultiplier = 1 + (distributed * CONFIG.TOKEN_PRICING.DEMAND_FACTOR);
        
        // Add volatility
        const volatility = (Math.random() - 0.5) * CONFIG.TOKEN_PRICING.PRICE_VOLATILITY * 2;
        
        // Calculate new price
        let newPrice = basePrice * demandMultiplier * (1 + volatility);
        
        // Ensure price doesn't drop below minimum
        newPrice = Math.max(basePrice * 0.5, newPrice);
        
        // Store price
        this.gameState.token.price = newPrice;
        
        // Add to history
        this.priceHistory.push({
            time: Date.now(),
            price: newPrice
        });
        
        // Keep only last 100 prices
        if (this.priceHistory.length > 100) {
            this.priceHistory.shift();
        }
    }
    
    // Simulate global player activity
    simulateGlobalActivity() {
        setInterval(() => {
            // Simulate other players' BUD generation
            // Average player generates about 463 BUD per minute
            const avgGeneration = CONFIG.BASE_GENERATION_RATE * 0.8; // 80% efficiency
            const playersActive = Math.floor(this.activePlayers * 0.7); // 70% active
            
            const deltaMinutes = CONFIG.UPDATE_INTERVALS.PRICE_UPDATE / (1000 * 60);
            const globalGeneration = avgGeneration * playersActive * deltaMinutes;
            
            this.globalDistributed += globalGeneration;
            
            // Player count is now fetched every 5 minutes (in init method)
            // No need to fetch it on every price update
        }, CONFIG.UPDATE_INTERVALS.PRICE_UPDATE);
    }
    
    // Update global distribution stats
    updateGlobalStats() {
        this.gameState.token.distributedTotal = 
            this.globalDistributed + this.gameState.token.myDistributed;
    }
    
    // Get current token price
    getCurrentPrice() {
        return this.gameState.token.price;
    }
    
    // Calculate BUD value in USD
    calculateBUDValue(budAmount) {
        return budAmount * this.gameState.token.price;
    }
    
    // Get total player BUD value
    getTotalValue() {
        return this.calculateBUDValue(this.gameState.player.totalBUD);
    }
    
    // Get accumulated BUD value
    getAccumulatedValue() {
        return this.calculateBUDValue(this.gameState.player.accumulatedBUD);
    }
    
    // Get price trend (up, down, stable)
    getPriceTrend() {
        if (this.priceHistory.length < 2) return 'stable';
        
        const recent = this.priceHistory.slice(-10);
        const oldest = recent[0].price;
        const newest = recent[recent.length - 1].price;
        
        const change = ((newest - oldest) / oldest) * 100;
        
        if (change > 1) return 'up';
        if (change < -1) return 'down';
        return 'stable';
    }
    
    // Get price change percentage
    getPriceChange() {
        if (this.priceHistory.length < 2) return 0;
        
        const recent = this.priceHistory.slice(-10);
        const oldest = recent[0].price;
        const newest = recent[recent.length - 1].price;
        
        return ((newest - oldest) / oldest) * 100;
    }
    
    // Format price for display
    formatPrice(price) {
        if (price >= 0.01) {
            return `$${price.toFixed(4)}`;
        } else {
            return `$${price.toFixed(6)}`;
        }
    }
    
    // Format BUD amount for display
    formatBUD(amount) {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(2)}M`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(2)}K`;
        } else {
            return amount.toFixed(2);
        }
    }
    
    // Format USD value for display
    formatUSD(value) {
        if (value >= 1000) {
            return `$${(value / 1000).toFixed(2)}K`;
        } else if (value >= 1) {
            return `$${value.toFixed(2)}`;
        } else {
            return `$${value.toFixed(4)}`;
        }
    }
    
    // Get distribution progress percentage
    getDistributionProgress() {
        const totalDistributed = this.gameState.token.distributedTotal;
        return (totalDistributed / CONFIG.TOTAL_SUPPLY) * 100;
    }
    
    // Get estimated tokens per user
    getEstimatedPerUser() {
        return CONFIG.TOTAL_SUPPLY / CONFIG.ESTIMATED_USERS;
    }
    
    // Get player's share percentage
    getPlayerShare() {
        const playerTokens = this.gameState.player.totalBUD + 
                           this.gameState.player.accumulatedBUD;
        return (playerTokens / CONFIG.TOTAL_SUPPLY) * 100;
    }
    
    // Get active players count
    getActivePlayers() {
        return this.activePlayers;
    }
    
    // Get tokens remaining in pool
    getRemainingTokens() {
        return Math.max(0, CONFIG.TOTAL_SUPPLY - this.gameState.token.distributedTotal);
    }
    
    // Check if player is above average
    isAboveAverage() {
        const playerTotal = this.gameState.player.totalBUD + 
                          this.gameState.player.accumulatedBUD;
        const average = this.getEstimatedPerUser();
        
        // Adjust for time elapsed
        const timeElapsed = Date.now() - this.gameState.gameStartTime;
        const timeProgress = timeElapsed / CONFIG.GAME_DURATION_MS;
        const expectedAtThisTime = average * timeProgress;
        
        return playerTotal >= expectedAtThisTime;
    }
    
    // Get performance rating
    getPerformanceRating() {
        const playerTotal = this.gameState.player.totalBUD + 
                          this.gameState.player.accumulatedBUD;
        const average = this.getEstimatedPerUser();
        const timeElapsed = Date.now() - this.gameState.gameStartTime;
        const timeProgress = Math.max(0.01, timeElapsed / CONFIG.GAME_DURATION_MS);
        const expectedAtThisTime = average * timeProgress;
        
        const performance = (playerTotal / expectedAtThisTime) * 100;
        
        if (performance >= 150) return 'Exceptional';
        if (performance >= 120) return 'Excellent';
        if (performance >= 100) return 'Good';
        if (performance >= 80) return 'Average';
        if (performance >= 60) return 'Below Average';
        return 'Poor';
    }
    
    // Get projected final tokens
    getProjectedFinalTokens() {
        const timeElapsed = Date.now() - this.gameState.gameStartTime;
        const timeProgress = Math.max(0.01, timeElapsed / CONFIG.GAME_DURATION_MS);
        const playerTotal = this.gameState.player.totalBUD + 
                          this.gameState.player.accumulatedBUD;
        
        return playerTotal / timeProgress;
    }
    
    // Get token stats for display
    getTokenStats() {
        return {
            price: this.getCurrentPrice(),
            priceFormatted: this.formatPrice(this.getCurrentPrice()),
            totalDistributed: this.gameState.token.distributedTotal,
            totalDistributedFormatted: this.formatBUD(this.gameState.token.distributedTotal),
            distributionProgress: this.getDistributionProgress(),
            playerBUD: this.gameState.player.totalBUD,
            playerBUDFormatted: this.formatBUD(this.gameState.player.totalBUD),
            playerValue: this.getTotalValue(),
            playerValueFormatted: this.formatUSD(this.getTotalValue()),
            accumulatedBUD: this.gameState.player.accumulatedBUD,
            accumulatedBUDFormatted: this.formatBUD(this.gameState.player.accumulatedBUD),
            accumulatedValue: this.getAccumulatedValue(),
            accumulatedValueFormatted: this.formatUSD(this.getAccumulatedValue()),
            priceTrend: this.getPriceTrend(),
            priceChange: this.getPriceChange(),
            activePlayers: this.activePlayers,
            remainingTokens: this.getRemainingTokens(),
            playerShare: this.getPlayerShare(),
            performance: this.getPerformanceRating(),
            projected: this.getProjectedFinalTokens()
        };
    }
    
    // Clean up
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Export token system
let tokenSystem = null;