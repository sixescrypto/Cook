/**
 * Room Customizer System
 * Handles background customization and user preferences
 */

class RoomCustomizer {
    constructor() {
        this.backgrounds = [
            { id: 'default', name: 'Humble Beginnings', image: 'assets/room-background.png' },
            { id: 'matrix', name: 'Bitcoin', image: 'assets/room-background-2.png' },
            { id: 'pump', name: 'Cyberfunk', image: 'assets/room-background-3.png' },
            { id: 'money', name: 'Money Money', image: 'assets/room-background-4.png' },
            { id: 'custom5', name: 'Pumpfun', image: 'assets/room-background-5.png' }
        ];
        
        this.currentBackground = this.loadSavedBackground();
        this.init();
    }
    
    init() {
        console.log('🎨 Room Customizer initialized');
        
        // Set up event listeners
        const customizeBtn = document.getElementById('customizeBtn');
        const customizeModal = document.getElementById('customizeModal');
        const closeBtn = document.getElementById('customizeCloseBtn');
        
        if (customizeBtn) {
            customizeBtn.addEventListener('click', () => this.openCustomizeModal());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCustomizeModal());
        }
        
        // Close modal when clicking outside
        if (customizeModal) {
            customizeModal.addEventListener('click', (e) => {
                if (e.target === customizeModal) {
                    this.closeCustomizeModal();
                }
            });
        }
        
        // Render background options
        this.renderBackgroundOptions();
        
        // Apply saved background
        this.applyBackground(this.currentBackground);
    }
    
    openCustomizeModal() {
        const modal = document.getElementById('customizeModal');
        if (modal) {
            modal.style.display = 'flex';
            console.log('🎨 Opened customization modal');
            
            // Play sound effect if available
            if (window.soundEffects) {
                window.soundEffects.playKnock();
            }
        }
    }
    
    closeCustomizeModal() {
        const modal = document.getElementById('customizeModal');
        if (modal) {
            modal.style.display = 'none';
            console.log('🎨 Closed customization modal');
        }
    }
    
    renderBackgroundOptions() {
        const container = document.getElementById('backgroundOptions');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.backgrounds.forEach(bg => {
            const option = document.createElement('div');
            option.className = 'background-option';
            if (bg.id === this.currentBackground) {
                option.classList.add('active');
            }
            
            option.innerHTML = `
                <img src="${bg.image}" alt="${bg.name}">
                <div class="background-option-name">${bg.name}</div>
            `;
            
            option.addEventListener('click', () => {
                this.selectBackground(bg.id);
            });
            
            container.appendChild(option);
        });
        
        console.log(`🎨 Rendered ${this.backgrounds.length} background options`);
    }
    
    selectBackground(backgroundId) {
        console.log(`🎨 Selected background: ${backgroundId}`);
        
        // Update active state
        this.currentBackground = backgroundId;
        
        // Update UI
        const options = document.querySelectorAll('.background-option');
        options.forEach((opt, index) => {
            if (this.backgrounds[index].id === backgroundId) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
        
        // Apply background
        this.applyBackground(backgroundId);
        
        // Save preference
        this.saveBackground(backgroundId);
        
        // Play sound effect
        if (window.soundEffects) {
            window.soundEffects.playRotate();
        }
    }
    
    applyBackground(backgroundId) {
        const background = this.backgrounds.find(bg => bg.id === backgroundId);
        if (!background) {
            console.warn(`⚠️ Background not found: ${backgroundId}`);
            return;
        }
        
        const roomBackground = document.getElementById('roomBackground');
        if (roomBackground) {
            roomBackground.src = background.image;
            console.log(`✅ Applied background: ${background.name}`);
        }
    }
    
    saveBackground(backgroundId) {
        try {
            localStorage.setItem('room_background', backgroundId);
            console.log(`💾 Saved background preference: ${backgroundId}`);
        } catch (error) {
            console.error('❌ Failed to save background preference:', error);
        }
    }
    
    loadSavedBackground() {
        try {
            const saved = localStorage.getItem('room_background');
            if (saved && this.backgrounds.some(bg => bg.id === saved)) {
                console.log(`📂 Loaded saved background: ${saved}`);
                return saved;
            }
        } catch (error) {
            console.error('❌ Failed to load background preference:', error);
        }
        
        return 'default'; // Default background
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.roomCustomizer = new RoomCustomizer();
    });
} else {
    window.roomCustomizer = new RoomCustomizer();
}
