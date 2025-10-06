// Plant System - Handles plant growth and rendering
class PlantSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.plantOverlays = [];
        this.particleContainer = null;
        this.updateInterval = null;
    }
    
    // Initialize plant system
    init() {
        this.cacheElements();
        this.updatePlantVisual();
        this.startGrowthLoop();
    }
    
    // Cache plant overlay elements
    cacheElements() {
        this.plantOverlays = [];
        this.particleContainer = document.getElementById('particleContainer');
    }
    
    // Start plant growth loop (disabled - game is functionless)
    startGrowthLoop() {
        // Disabled - will rebuild from scratch
    }
    
    // Update plant visual (disabled - no stages)
    updatePlantVisual() {
        // Disabled - plant stages removed
    }
    
    // Create floating BUD particle effect
    createBUDParticle(amount) {
        if (!this.particleContainer) return;
        
        const particle = document.createElement('div');
        particle.className = 'bud-particle';
        particle.textContent = `+${amount.toFixed(2)} 💚`;
        particle.style.position = 'absolute';
        particle.style.fontSize = '20px';
        particle.style.pointerEvents = 'none';
        particle.style.animation = 'floatUp 2s ease-out forwards';
        particle.style.zIndex = '100';
        particle.style.color = '#00ff41';
        particle.style.textShadow = '0 0 10px rgba(0, 255, 65, 0.8)';
        
        // Random position in the room
        const x = 30 + (Math.random() * 40); // 30-70% across
        const y = 40 + (Math.random() * 30); // 40-70% down
        
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        
        this.particleContainer.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
    
    // Water the plant
    waterPlant() {
        const result = this.gameState.performCareAction('water');
        this.handleCareResult(result, 'water');
        return result;
    }
    
    // Add nutrients
    addNutrients() {
        const result = this.gameState.performCareAction('nutrient');
        this.handleCareResult(result, 'nutrient');
        return result;
    }
    
    // Adjust lighting
    adjustLight() {
        const result = this.gameState.performCareAction('light');
        this.handleCareResult(result, 'light');
        return result;
    }
    
    // Harvest plant
    harvestPlant() {
        const result = this.gameState.performCareAction('harvest');
        this.handleCareResult(result, 'harvest');
        
        if (result.success) {
            this.createHarvestEffect(result.harvestAmount);
        }
        
        return result;
    }
    
    // Handle care action result
    handleCareResult(result, action) {
        if (result.success) {
            this.createCareEffect(action);
            this.updatePlantVisual();
        }
    }
    
    // Create visual effect for care action
    createCareEffect(action) {
        const plant = document.querySelector('.plant');
        if (!plant) return;
        
        const effect = document.createElement('div');
        effect.className = 'care-effect';
        
        const icons = {
            water: '💧',
            nutrient: '🧪',
            light: '💡',
            harvest: '✂️'
        };
        
        effect.textContent = icons[action] || '✨';
        effect.style.position = 'absolute';
        effect.style.fontSize = '40px';
        effect.style.left = '50%';
        effect.style.top = '0';
        effect.style.transform = 'translateX(-50%)';
        effect.style.animation = 'floatUp 1s ease-out forwards';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '100';
        
        plant.appendChild(effect);
        
        setTimeout(() => effect.remove(), 1000);
    }
    
    // Create harvest effect
    createHarvestEffect(amount) {
        if (!this.particleContainer) return;
        
        // Create multiple BUD particles
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'bud-particle';
                particle.textContent = '💚';
                particle.style.position = 'absolute';
                particle.style.fontSize = '30px';
                particle.style.animation = 'floatUp 2s ease-out forwards';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '100';
                particle.style.filter = 'drop-shadow(0 0 10px rgba(0, 255, 65, 0.8))';
                
                const angle = (i / 10) * Math.PI * 2;
                const x = 50 + Math.cos(angle) * 20;
                const y = 50 + Math.sin(angle) * 20;
                
                particle.style.left = `${x}%`;
                particle.style.top = `${y}%`;
                
                this.particleContainer.appendChild(particle);
                
                setTimeout(() => particle.remove(), 2000);
            }, i * 100);
        }
        
        // Flash effect on room
        const roomView = document.querySelector('.room-view');
        if (roomView) {
            roomView.style.filter = 'brightness(1.3)';
            setTimeout(() => {
                roomView.style.filter = 'none';
            }, 200);
        }
    }
    
    // Get plant stage name (disabled - no stages)
    getStageName(stage) {
        return '';
    }
    
    // Get plant health status
    getHealthStatus() {
        const health = this.gameState.plant.health;
        if (health >= 80) return 'Excellent';
        if (health >= 60) return 'Good';
        if (health >= 40) return 'Fair';
        if (health >= 20) return 'Poor';
        return 'Critical';
    }
    
    // Clean up
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Export plant system
let plantSystem = null;