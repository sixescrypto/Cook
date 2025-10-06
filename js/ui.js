// UI System - Handles all UI updates and interactions
class UISystem {
    constructor(gameState, plantSystem, tokenSystem) {
        this.gameState = gameState;
        this.plantSystem = plantSystem;
        this.tokenSystem = tokenSystem;
        this.updateInterval = null;
        this.elements = {};
    }
    
    // Initialize UI system
    init() {
        this.cacheElements();
        this.bindEvents();
        this.startUILoop();
        this.updateAll();
    }
    
    // Cache DOM elements
    cacheElements() {
        this.elements = {
            // BUD counter
            budCounter: document.getElementById('budCounter'),
            budValue: document.getElementById('budValue'),
            
            // BUD Generation Stats (simplified)
            perDay: document.getElementById('perDay'),
            sessionTotal: document.getElementById('sessionTotal'),
            
            // Action buttons (only harvest now)
            harvestBtn: document.getElementById('harvestBtn'),
            
            // Token info
            distributedTokens: document.getElementById('distributedTokens'),
            tokenPrice: document.getElementById('tokenPrice'),
            activePlayers: document.getElementById('activePlayers'),
            
            // Leaderboard
            leaderboard: document.getElementById('leaderboard')
        };
    }
    
    // Bind event listeners
    bindEvents() {
        // Only harvest button now
        this.elements.harvestBtn.addEventListener('click', () => this.handleHarvest());
    }
    
    // Start UI update loop (disabled - game is functionless)
    startUILoop() {
        // Disabled - will rebuild from scratch
    }
    
    // Update all UI elements
    updateAll() {
        this.updateBUDCounter();
        this.updateGenerationStats();
        this.updateTokenInfo();
        this.updateHarvestButton();
    }
    
    // Update BUD counter
    updateBUDCounter() {
        const total = this.gameState.player.totalBUD + this.gameState.player.accumulatedBUD;
        this.elements.budCounter.textContent = this.tokenSystem.formatBUD(total);
        
        const value = this.tokenSystem.calculateBUDValue(total);
        this.elements.budValue.textContent = this.tokenSystem.formatUSD(value);
    }
    
    // Update BUD Generation Stats (simplified - no functionality)
    updateGenerationStats() {
        // Removed all generation logic - game is now functionless
        // Will rebuild from scratch
    }
    
    // Update cooldowns (removed, no longer needed)
    updateCooldowns() {
        // Removed - no care actions
    }
    
    // Update single cooldown button
    updateCooldownButton(action, button, cooldownEl) {
        const remaining = this.gameState.getCooldownRemaining(action);
        
        if (remaining > 0) {
            button.disabled = true;
            button.classList.add('on-cooldown');
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            cooldownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            button.disabled = false;
            button.classList.remove('on-cooldown');
            cooldownEl.textContent = '';
        }
    }
    
    // Update harvest button (disabled - game is functionless)
    updateHarvestButton() {
        // Disabled - will rebuild from scratch
        this.elements.harvestBtn.disabled = true;
        this.elements.harvestBtn.textContent = 'HARVEST (DISABLED)';
    }
    
    // Update token info
    updateTokenInfo() {
        const stats = this.tokenSystem.getTokenStats();
        
        this.elements.tokenPrice.textContent = stats.priceFormatted;
        this.elements.distributedTokens.textContent = `${stats.totalDistributedFormatted} BUD`;
        this.elements.activePlayers.textContent = stats.activePlayers.toString();
        
        // Add price trend indicator
        const trendSymbol = stats.priceTrend === 'up' ? '📈' : 
                          stats.priceTrend === 'down' ? '📉' : '➡️';
        this.elements.tokenPrice.textContent = `${stats.priceFormatted} ${trendSymbol}`;
    }
    
    // Handle water action (removed)
    handleWater() {
        // Removed - no care actions
    }
    
    // Handle nutrient action (removed)
    handleNutrient() {
        // Removed - no care actions
    }
    
    // Handle light action (removed)
    handleLight() {
        // Removed - no care actions
    }
    
    // Handle harvest action (disabled - game is functionless)
    handleHarvest() {
        // Disabled - will rebuild from scratch
    }
    
    // Show notification (disabled - removed notification system)
    showNotification(message, type = 'info') {
        // Disabled - notifications removed from UI
    }
    
    // Handle game end
    handleGameEnd() {
        this.showNotification('🎉 Game has ended! Final BUD: ' + 
            this.tokenSystem.formatBUD(this.gameState.player.totalBUD + this.gameState.player.accumulatedBUD), 
            'success');
        
        // Disable all action buttons
        this.elements.waterBtn.disabled = true;
        this.elements.nutrientBtn.disabled = true;
        this.elements.lightBtn.disabled = true;
        this.elements.harvestBtn.disabled = true;
        
        // Show final stats
        setTimeout(() => {
            this.showFinalStats();
        }, 2000);
    }
    
    // Show final statistics
    showFinalStats() {
        const stats = this.gameState.getStats();
        const tokenStats = this.tokenSystem.getTokenStats();
        
        const finalMessage = `
🏁 GAME COMPLETED! 🏁

Your Performance:
💚 Total BUD: ${tokenStats.playerBUDFormatted}
💰 Total Value: ${tokenStats.playerValueFormatted}
🏆 Performance: ${tokenStats.performance}
✂️ Harvests: ${stats.harvestCount}
⭐ Rating: ${tokenStats.performance}

Thank you for playing BUD Garden!
        `.trim();
        
        alert(finalMessage);
    }
    
    // Update leaderboard
    updateLeaderboard() {
        const leaderboard = this.gameState.leaderboard;
        
        if (!leaderboard || leaderboard.length === 0) {
            // Show only player if no leaderboard data
            this.elements.leaderboard.innerHTML = `
                <div class="leader-entry">
                    <span class="rank">1.</span>
                    <span class="name">You</span>
                    <span class="bud-amount">${this.tokenSystem.formatBUD(
                        this.gameState.player.totalBUD + this.gameState.player.accumulatedBUD
                    )} BUD</span>
                </div>
            `;
            return;
        }
        
        // Display leaderboard
        let html = '';
        leaderboard.forEach((entry, index) => {
            const isPlayer = entry.id === this.gameState.player.id;
            html += `
                <div class="leader-entry ${isPlayer ? 'player' : ''}">
                    <span class="rank">${index + 1}.</span>
                    <span class="name">${isPlayer ? 'You' : entry.name}</span>
                    <span class="bud-amount">${this.tokenSystem.formatBUD(entry.bud)} BUD</span>
                </div>
            `;
        });
        
        this.elements.leaderboard.innerHTML = html;
    }
    
    // Clean up
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Export UI system
let uiSystem = null;