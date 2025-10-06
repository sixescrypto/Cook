// Plant Placement System - Handles placing plants on grid tiles
class PlantPlacement {
    constructor(gridSystem) {
        this.gridSystem = gridSystem;
        this.plants = []; // Array of placed plants
        this.plantImage = 'assets/sprout.png'; // Default plant image
        this.placementEnabled = false; // Placement mode disabled by default
        this.previewElement = null; // Ghost preview element
        this.inventorySystem = null; // Reference to inventory system (set later)
        this.currentItemId = null; // Track which item is equipped
        this.generationInterval = null; // BUD generation timer
        this.gameState = null; // Reference to gameState (set later)
        this.radioStates = {}; // Store radio state for each placed radio (key: "row-col")
        this.movingItem = null; // Track item being moved (stores item data during move)
    }
    
    // Initialize plant placement system
    init() {
        console.log('✅ Plant Placement System initialized');
        // Setup click handlers but don't enable placement yet
        this.setupClickHandlers();
        this.createPreviewElement();
        this.startBUDGeneration();
    }
    
    // Create the ghost preview element
    createPreviewElement() {
        this.previewElement = document.createElement('div');
        this.previewElement.className = 'plant-preview';
        this.previewElement.style.display = 'none';
        
        const img = document.createElement('img');
        img.className = 'plant-preview-image';
        this.previewElement.appendChild(img);
        
        this.gridSystem.gridOverlay.appendChild(this.previewElement);
    }
    
    // Enable placement mode
    enablePlacement(itemId = null) {
        this.placementEnabled = true;
        this.currentItemId = itemId;
        this.updatePreviewImage();
        this.highlightAvailableTiles();
        this.disablePlantInteraction(); // Disable clicking on placed plants
        console.log('🟢 Placement mode ENABLED with itemId:', itemId);
    }
    
    // Disable placement mode
    disablePlacement() {
        this.placementEnabled = false;
        this.currentItemId = null;
        this.hidePreview();
        this.removeHighlightFromTiles();
        this.enablePlantInteraction(); // Re-enable clicking on placed plants
        console.log('🔴 Placement mode DISABLED');
    }
    
    // Highlight available and blocked tiles
    highlightAvailableTiles() {
        this.gridSystem.tiles.forEach(tileData => {
            if (tileData.blocked) {
                // Red highlight for blocked tiles
                tileData.element.classList.add('placement-blocked');
            } else if (!tileData.occupied) {
                // Green highlight for available tiles
                tileData.element.classList.add('placement-available');
            }
            // Occupied tiles get no highlight
        });
    }
    
    // Remove all placement highlights
    removeHighlightFromTiles() {
        this.gridSystem.tiles.forEach(tileData => {
            tileData.element.classList.remove('placement-available');
            tileData.element.classList.remove('placement-blocked');
        });
    }
    
    // Disable interaction with placed plants (during placement mode)
    disablePlantInteraction() {
        console.log(`🚫 Disabling ${this.plants.length} plants during placement mode`);
        this.plants.forEach(plantData => {
            plantData.element.style.pointerEvents = 'none';
            plantData.element.classList.add('placement-mode-active');
        });
    }
    
    // Enable interaction with placed plants (when not in placement mode)
    enablePlantInteraction() {
        console.log(`✅ Re-enabling ${this.plants.length} plants after placement mode`);
        this.plants.forEach(plantData => {
            plantData.element.style.pointerEvents = 'auto';
            plantData.element.classList.remove('placement-mode-active');
        });
    }
    
    // Update preview image when item changes
    updatePreviewImage() {
        const img = this.previewElement.querySelector('.plant-preview-image');
        img.src = this.plantImage;
    }
    
    // Show preview at tile position
    showPreview(tile) {
        if (!this.placementEnabled) return;
        
        const img = this.previewElement.querySelector('.plant-preview-image');
        img.src = this.plantImage;
        
        this.previewElement.style.left = tile.style.left;
        this.previewElement.style.top = tile.style.top;
        this.previewElement.style.display = 'block';
    }
    
    // Hide preview
    hidePreview() {
        this.previewElement.style.display = 'none';
    }
    
    // Setup click handlers for placing plants
    setupClickHandlers() {
        this.gridSystem.tiles.forEach(tileData => {
            // Click handler
            tileData.element.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Only place if placement mode is enabled
                if (this.placementEnabled) {
                    this.placePlant(tileData.row, tileData.col);
                }
            });
            
            // Hover handlers for preview
            tileData.element.addEventListener('mouseenter', () => {
                if (this.placementEnabled) {
                    this.showPreview(tileData.element);
                }
            });
            
            tileData.element.addEventListener('mouseleave', () => {
                if (this.placementEnabled) {
                    this.hidePreview();
                }
            });
        });
    }
    
    // Place a plant on a specific tile
    async placePlant(row, col) {
        // Blocked tiles (front-center area)
        const blockedTiles = [
            [0, 0], [0, 1], [0, 2],
            [1, 0], [1, 1],
            [2, 0], [2, 1]
        ];
        
        // Check if tile is blocked
        const isBlocked = blockedTiles.some(([blockedRow, blockedCol]) => 
            blockedRow === row && blockedCol === col
        );
        
        if (isBlocked) {
            console.warn(`⛔ Tile [${row}, ${col}] is blocked - cannot place items here`);
            return;
        }
        
        const tile = this.gridSystem.getTile(row, col);
        
        if (!tile) {
            console.warn(`Tile [${row}, ${col}] not found`);
            return;
        }
        
        if (tile.occupied) {
            console.warn(`Tile [${row}, ${col}] is already occupied`);
            return;
        }
        
        // Check if we're moving an existing item or placing a new one
        const isMoving = this.movingItem !== null;
        let itemId, serverPlantData, rotation;
        
        if (isMoving) {
            // Moving an existing item
            itemId = this.movingItem.itemId;
            rotation = this.movingItem.rotation;
            
            console.log(`📦 Moving ${itemId} from [${this.movingItem.originalRow}, ${this.movingItem.originalCol}] to [${row}, ${col}]`);
            
            // Update position on server
            if (window.supabaseClient && this.movingItem.serverPlantId) {
                try {
                    const { data, error } = await window.supabaseClient.supabase
                        .from('placed_plants')
                        .update({ grid_row: row, grid_col: col })
                        .eq('id', this.movingItem.serverPlantId)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    serverPlantData = data;
                    console.log('✅ Item position updated on server');
                } catch (error) {
                    console.error('❌ Failed to update position on server:', error);
                }
            }
            
            // Clear movingItem state
            this.movingItem = null;
        } else {
            // Placing a new item
            itemId = this.currentItemId;
            rotation = 0; // New items start with no rotation
            
            // Get reward rate for server sync
            const itemRewardRate = this.getItemRewardRate(itemId);
            
            // Sync with Supabase if available
            if (window.supabaseClient && window.supabaseClient.supabase) {
                try {
                    const result = await window.supabaseClient.placePlant(
                        itemId,
                        row,
                        col,
                        itemRewardRate,
                        rotation
                    );
                    if (!result) {
                        console.warn('⚠️ Failed to sync plant with server - continuing with local placement');
                    } else {
                        serverPlantData = result;
                        console.log('✅ Plant automatically synced to server');
                    }
                } catch (error) {
                    console.error('❌ Server sync error:', error);
                    // Continue with local placement as fallback
                }
            }
            
            // Consume item from inventory (only for new placements)
            if (this.inventorySystem && itemId) {
                const consumed = this.inventorySystem.consumeItem(itemId);
                if (!consumed) {
                    console.warn('Failed to consume item - placement cancelled');
                    return;
                }
            }
        }
        
        // Create plant element
        const plant = document.createElement('div');
        plant.className = 'placed-plant';
        plant.dataset.row = row;
        plant.dataset.col = col;
        
        // Create plant image
        const img = document.createElement('img');
        img.src = this.plantImage;
        img.alt = 'Plant';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.imageRendering = 'pixelated';
        img.style.imageRendering = '-moz-crisp-edges';
        img.style.imageRendering = 'crisp-edges';
        
        // Apply rotation if moving an item with existing rotation
        if (rotation === 1) {
            img.style.transformOrigin = 'center center';
            img.style.transform = 'scaleX(-1)';
        }
        
        plant.appendChild(img);
        
        // Position the plant on the tile
        const tileElement = tile.element;
        const tileRect = tileElement.getBoundingClientRect();
        const containerRect = this.gridSystem.gridOverlay.getBoundingClientRect();
        
        plant.style.left = tileElement.style.left;
        plant.style.top = tileElement.style.top;
        
        // Apply item-specific position adjustments
        if (itemId === 'mini-mary') {
            // Lift mini-mary up by 15px for better centering
            const currentTop = parseFloat(plant.style.top);
            plant.style.top = (currentTop - 15) + 'px';
        }
        
        if (itemId === 'puff-daddy') {
            // Lift puff-daddy up by 15px for better centering
            const currentTop = parseFloat(plant.style.top);
            plant.style.top = (currentTop - 15) + 'px';
        }
        
        // Set z-index based on row AND column for proper isometric layering
        // In isometric view, both row and column determine depth
        // Higher row + higher column = more in front
        plant.style.zIndex = 10 + (row * 10) + col;
        
        // Add plant to the grid overlay
        this.gridSystem.gridOverlay.appendChild(plant);
        
        // Play knock/drop sound
        if (window.soundEffects) {
            window.soundEffects.playKnock();
        }
        
        // Mark tile as occupied
        this.gridSystem.setTileOccupied(row, col, true);
        
        // Store plant data (use saved itemId, not currentItemId which may be null)
        const itemName = this.getItemName(itemId);
        const itemDescription = this.getItemDescription(itemId);
        const rewardRate = this.getItemRewardRate(itemId);
        
        console.log('🔍 Plant data:', { 
            itemId: itemId, 
            itemName, 
            itemDescription, 
            rewardRate,
            hasInventory: !!this.inventorySystem 
        });
        
        this.plants.push({
            element: plant,
            row: row,
            col: col,
            plantedAt: Date.now(),
            itemId: itemId,
            itemName: itemName,
            itemDescription: itemDescription,
            rewardRate: rewardRate,
            earningInterval: null, // Store interval for cleanup
            rotation: rotation || 0, // Preserve rotation for moved items
            serverPlantId: serverPlantData ? serverPlantData.id : null // Store server ID for updates
        });
        
        console.log(`✅ ${isMoving ? 'Item moved' : 'Plant placed'} at [${row}, ${col}]`);
        
        // Update localStorage cache (for offline support)
        // Note: This is just a cache - server data loaded on next page load
        if (this.gameState) {
            this.gameState.saveToStorage();
            console.log('💾 Cache updated after plant placement');
        }
        
        // If this was a move operation, disable placement mode
        if (isMoving) {
            this.placementEnabled = false;
            this.enabled = false;
            this.currentItemId = null;
            this.selectedItemId = null;
            this.hidePreview();
            this.enablePlantInteraction();
            console.log('✅ Move complete - placement mode disabled');
        }
        
        // If still in placement mode, disable interaction on this new plant
        if (this.placementEnabled) {
            plant.style.pointerEvents = 'none';
            plant.classList.add('placement-mode-active');
        }
        
        // Start earning animation for this plant
        this.startEarningAnimation(this.plants[this.plants.length - 1]);
        
        // Add click handler to show info panel
        plant.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showPlantInfo(row, col);
        });
    }
    
    // Get item name from inventory system
    getItemName(itemId) {
        if (this.inventorySystem) {
            const item = this.inventorySystem.items.find(i => i.id === itemId);
            return item ? item.name : 'Unknown';
        }
        return 'Plant';
    }
    
    // Get item description from inventory system
    getItemDescription(itemId) {
        if (this.inventorySystem) {
            const item = this.inventorySystem.items.find(i => i.id === itemId);
            return item ? item.description : '';
        }
        return '';
    }
    
    // Get item reward rate from inventory system
    getItemRewardRate(itemId) {
        if (this.inventorySystem) {
            const item = this.inventorySystem.items.find(i => i.id === itemId);
            return item ? item.rewardRate : '0 BUD/min';
        }
        return '0 BUD/min';
    }
    
    // Show plant info panel
    showPlantInfo(row, col) {
        const plantData = this.plants.find(p => p.row === row && p.col === col);
        
        if (!plantData) {
            console.warn(`No plant found at [${row}, ${col}]`);
            return;
        }
        
        // Remove existing info panel if any
        const existingPanel = document.getElementById('plantInfoPanel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // Remove existing rotate button if any
        const existingRotateBtn = document.getElementById('rotateItemBtn');
        if (existingRotateBtn) {
            existingRotateBtn.remove();
        }
        
        // Create info panel
        const infoPanel = document.createElement('div');
        infoPanel.id = 'plantInfoPanel';
        infoPanel.className = 'plant-info-panel';
        
        // Check if this is a radio
        const isRadio = plantData.itemId === 'radio';
        
        // Build HTML content
        let radioControls = '';
        if (isRadio) {
            radioControls = `
                <div class="radio-controls">
                    <button class="radio-power-btn" id="radioPowerBtn">
                        <span id="radioPowerIcon">▶</span> Turn On
                    </button>
                    <div class="radio-player" id="radioPlayer" style="display: none;">
                        <div class="track-buttons">
                            <button class="track-btn" data-track="1">Track One</button>
                            <button class="track-btn" data-track="2">Track Two</button>
                        </div>
                        <div class="volume-control">
                            <label for="radioVolume">Volume</label>
                            <input type="range" id="radioVolume" min="0" max="100" value="50">
                            <span id="volumeValue">50%</span>
                        </div>
                        <div class="now-playing" id="nowPlaying" style="display: none;">
                            Now Playing: <span id="currentTrack">None</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Add content with close button
        infoPanel.innerHTML = `
            <button class="info-close-btn" id="closeInfoBtn">✕</button>
            <div class="plant-info-header">${plantData.itemName}</div>
            <div class="plant-info-description">${plantData.itemDescription || ''}</div>
            <div class="plant-info-reward">
                <span class="reward-label">Reward Rate:</span>
                <span class="reward-value">${plantData.rewardRate}</span>
            </div>
            ${radioControls}
        `;
        
        // Append to room-view container
        const roomView = document.querySelector('.room-view');
        roomView.appendChild(infoPanel);
        
        console.log(`ℹ️ Showing info for ${plantData.itemName} at [${row}, ${col}]`);
        
        // Add radio controls handlers if this is a radio
        if (isRadio) {
            this.initRadioControls(row, col, plantData.element);
        }
        
        // Add rotate and move buttons for ALL items
        this.addRotateButton(plantData.element, row, col);
        this.addMoveButton(plantData.element, row, col);
        
        // Add close button handler
        const closeBtn = document.getElementById('closeInfoBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                infoPanel.remove();
                // Remove rotate and move buttons when closing info panel
                const rotateBtn = document.getElementById('rotateItemBtn');
                if (rotateBtn) rotateBtn.remove();
                const moveBtn = document.getElementById('moveItemBtn');
                if (moveBtn) moveBtn.remove();
            });
        }
        
        // Close when clicking elsewhere
        setTimeout(() => {
            const clickHandler = (e) => {
                if (!infoPanel.contains(e.target) && !plantData.element.contains(e.target)) {
                    infoPanel.remove();
                    // Remove rotate and move buttons when closing info panel
                    const rotateBtn = document.getElementById('rotateItemBtn');
                    if (rotateBtn) rotateBtn.remove();
                    const moveBtn = document.getElementById('moveItemBtn');
                    if (moveBtn) moveBtn.remove();
                    document.removeEventListener('click', clickHandler);
                }
            };
            document.addEventListener('click', clickHandler);
        }, 100);
    }
    
    // Add rotate button above item
    addRotateButton(itemElement, row, col) {
        // Remove any existing rotate button
        const existingBtn = document.getElementById('rotateItemBtn');
        if (existingBtn) existingBtn.remove();
        
        // Create rotate button
        const rotateBtn = document.createElement('button');
        rotateBtn.id = 'rotateItemBtn';
        rotateBtn.className = 'rotate-item-btn';
        
        // Add icon image
        const icon = document.createElement('img');
        icon.src = 'assets/rotate-icon.png';
        icon.alt = 'Rotate';
        rotateBtn.appendChild(icon);
        
        rotateBtn.title = 'Rotate Item';
        
        // Position it above the item (centered)
        const rect = itemElement.getBoundingClientRect();
        const roomView = document.querySelector('.room-view');
        const roomRect = roomView.getBoundingClientRect();
        
        rotateBtn.style.position = 'absolute';
        rotateBtn.style.left = `${rect.left - roomRect.left + rect.width / 2 - 20}px`; // Center by subtracting half button width
        rotateBtn.style.top = `${rect.top - roomRect.top - 45}px`;
        
        // Add click handler
        rotateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.rotateItem(itemElement, row, col);
        });
        
        // Append to room view
        roomView.appendChild(rotateBtn);
    }
    
    // Add move button above item (to the left of rotate button)
    addMoveButton(itemElement, row, col) {
        // Remove any existing move button
        const existingBtn = document.getElementById('moveItemBtn');
        if (existingBtn) existingBtn.remove();
        
        // Create move button
        const moveBtn = document.createElement('button');
        moveBtn.id = 'moveItemBtn';
        moveBtn.className = 'move-item-btn';
        
        // Add move icon image
        const icon = document.createElement('img');
        icon.src = 'assets/move.png';
        icon.alt = 'Move';
        moveBtn.appendChild(icon);
        
        moveBtn.title = 'Move Item';
        
        // Position it above the item, to the LEFT of rotate button
        const rect = itemElement.getBoundingClientRect();
        const roomView = document.querySelector('.room-view');
        const roomRect = roomView.getBoundingClientRect();
        
        moveBtn.style.position = 'absolute';
        moveBtn.style.left = `${rect.left - roomRect.left + rect.width / 2 - 65}px`; // 65px = offset to left of rotate
        moveBtn.style.top = `${rect.top - roomRect.top - 45}px`;
        
        // Add click handler
        moveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.moveItem(itemElement, row, col);
        });
        
        // Append to room view
        roomView.appendChild(moveBtn);
    }
    
    // Move item to new position
    async moveItem(itemElement, row, col) {
        const plantData = this.plants.find(p => p.row === row && p.col === col);
        if (!plantData) return;
        
        console.log(`🔄 Starting move for ${plantData.itemId} from [${row}, ${col}]`);
        
        // Get the item's image path from ITEMS_CONFIG
        const itemConfig = ITEMS_CONFIG.find(item => item.id === plantData.itemId);
        if (itemConfig) {
            this.plantImage = itemConfig.image;
        }
        
        // Store the item being moved
        this.movingItem = {
            itemId: plantData.itemId,
            itemName: plantData.itemName,
            serverPlantId: plantData.serverPlantId,
            originalRow: row,
            originalCol: col,
            rotation: plantData.rotation || 0,
            element: itemElement
        };
        
        // Remove item from grid visually (but keep in database until new position confirmed)
        itemElement.remove();
        
        // Mark original tile as unoccupied
        const tile = this.gridSystem.getTile(row, col);
        if (tile) {
            tile.occupied = false;
        }
        
        // Remove from plants array temporarily
        const index = this.plants.findIndex(p => p.row === row && p.col === col);
        if (index !== -1) {
            this.plants.splice(index, 1);
        }
        
        // Close info panel
        const infoPanel = document.getElementById('plantInfoPanel');
        if (infoPanel) infoPanel.remove();
        
        // Remove buttons
        const rotateBtn = document.getElementById('rotateItemBtn');
        if (rotateBtn) rotateBtn.remove();
        const moveBtn = document.getElementById('moveItemBtn');
        if (moveBtn) moveBtn.remove();
        
        // Enable placement mode with preview
        this.placementEnabled = true;
        this.enabled = true;
        this.selectedItemId = plantData.itemId;
        
        // Update preview image to show the moving item
        this.updatePreviewImage();
        
        // Disable interaction with other plants during move
        this.disablePlantInteraction();
        
        console.log(`✅ Item picked up. Hover over tiles to preview, click to place at new position.`);
    }
    
    // Rotate item (flip horizontally)
    async rotateItem(itemElement, row, col) {
        const plantData = this.plants.find(p => p.row === row && p.col === col);
        if (!plantData) return;
        
        // Play rotation sound effect
        if (window.soundEffects) {
            window.soundEffects.playRotate();
        }
        
        // Get current rotation or initialize
        if (!plantData.rotation) {
            plantData.rotation = 0;
        }
        
        // Increment rotation (0 = normal, 1 = flipped)
        plantData.rotation = (plantData.rotation + 1) % 2;
        
        // Apply transform to the img element inside the container instead of the container itself
        const imgElement = itemElement.querySelector('img');
        if (imgElement) {
            imgElement.style.transformOrigin = 'center center';
            if (plantData.rotation === 1) {
                imgElement.style.transform = 'scaleX(-1)';
            } else {
                imgElement.style.transform = 'scaleX(1)';
            }
        }
        
        // Save rotation to server
        if (window.supabaseClient && plantData.serverPlantId) {
            try {
                await window.supabaseClient.updatePlantRotation(plantData.serverPlantId, plantData.rotation);
                console.log(`🔄 Rotated item at [${row}, ${col}] - Flipped: ${plantData.rotation === 1} (saved to server)`);
            } catch (error) {
                console.error('❌ Failed to save rotation to server:', error);
                console.log(`🔄 Rotated item at [${row}, ${col}] - Flipped: ${plantData.rotation === 1} (local only)`);
            }
        } else {
            console.log(`🔄 Rotated item at [${row}, ${col}] - Flipped: ${plantData.rotation === 1}`);
        }
        
        // Update localStorage cache (for offline support)
        // Note: This is just a cache - server data loaded on next page load
        if (this.gameState) {
            this.gameState.saveToStorage();
            console.log('💾 Cache updated after rotation');
        }
    }
    
    // Initialize radio controls
    initRadioControls(row, col, radioElement) {
        const radioKey = `${row}-${col}`; // Unique key for this radio
        
        // Initialize state for this radio if it doesn't exist
        if (!this.radioStates[radioKey]) {
            this.radioStates[radioKey] = {
                isOn: false,
                currentTrack: null,
                audioData: null,
                volume: 50,
                element: radioElement // Store reference to the plant element
            };
        }
        
        const state = this.radioStates[radioKey];
        // Update element reference in case it changed
        state.element = radioElement;
        
        const powerBtn = document.getElementById('radioPowerBtn');
        const radioPlayer = document.getElementById('radioPlayer');
        const powerIcon = document.getElementById('radioPowerIcon');
        const volumeSlider = document.getElementById('radioVolume');
        const volumeValue = document.getElementById('volumeValue');
        const nowPlaying = document.getElementById('nowPlaying');
        const currentTrack = document.getElementById('currentTrack');
        
        // Restore saved volume
        volumeSlider.value = state.volume;
        volumeValue.textContent = `${state.volume}%`;
        
        // Track URLs
        const tracks = {
            1: { name: 'Reggae Vibes', url: 'assets/sounds/track1.mp3' },
            2: { name: 'Lo-Fi Hip Hop', url: 'assets/sounds/track2.mp3' }
        };
        
        // Helper function to play a track
        const playTrack = (trackNum) => {
            const track = tracks[trackNum];
            
            // Stop previous audio
            this.stopRadioAudio(state.audioData);
            state.audioData = null;
            
            // Play the track
            const audioData = this.playAudioTrack(trackNum, volumeSlider.value / 100);
            state.audioData = audioData;
            state.currentTrack = trackNum;
            
            // Show now playing
            nowPlaying.style.display = 'block';
            currentTrack.textContent = track.name;
            
            // Highlight active track
            document.querySelectorAll('.track-btn').forEach(b => b.classList.remove('active'));
            const activeBtn = document.querySelector(`.track-btn[data-track="${trackNum}"]`);
            if (activeBtn) activeBtn.classList.add('active');
            
            console.log(`🎵 Playing: ${track.name}`);
        };
        
        // Restore UI state
        if (state.isOn) {
            powerBtn.innerHTML = '<span id="radioPowerIcon">⏸</span> Turn Off';
            radioPlayer.style.display = 'block';
            
            // Add playing animation to radio element
            if (state.element) {
                state.element.classList.add('radio-playing');
            }
            
            // If there was a track playing, restore it
            if (state.currentTrack && state.audioData && state.audioData.audio) {
                nowPlaying.style.display = 'block';
                currentTrack.textContent = tracks[state.currentTrack].name;
                const activeBtn = document.querySelector(`.track-btn[data-track="${state.currentTrack}"]`);
                if (activeBtn) activeBtn.classList.add('active');
                
                // Apply current volume to existing audio
                state.audioData.audio.volume = state.volume / 100;
            }
        }
        
        // Power button toggle
        powerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.isOn = !state.isOn;
            
            if (state.isOn) {
                powerBtn.innerHTML = '<span id="radioPowerIcon">⏸</span> Turn Off';
                radioPlayer.style.display = 'block';
                console.log('📻 Radio turned ON');
                
                // Add playing animation to radio element
                if (state.element) {
                    state.element.classList.add('radio-playing');
                }
                
                // Automatically play Track 1
                setTimeout(() => playTrack('1'), 300);
            } else {
                powerBtn.innerHTML = '<span id="radioPowerIcon">▶</span> Turn On';
                radioPlayer.style.display = 'none';
                nowPlaying.style.display = 'none';
                
                // Remove playing animation from radio element
                if (state.element) {
                    state.element.classList.remove('radio-playing');
                }
                
                // Stop any playing audio immediately
                this.stopRadioAudio(state.audioData);
                state.audioData = null;
                state.currentTrack = null;
                
                // Clear active track highlight
                document.querySelectorAll('.track-btn').forEach(b => b.classList.remove('active'));
                
                console.log('📻 Radio turned OFF');
            }
        });
        
        // Track buttons
        document.querySelectorAll('.track-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const trackNum = btn.dataset.track;
                playTrack(trackNum);
            });
        });
        
        // Volume slider
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value;
            state.volume = parseInt(volume);
            volumeValue.textContent = `${volume}%`;
            
            // Apply volume to currently playing audio in real-time
            if (state.audioData && state.audioData.audio) {
                state.audioData.audio.volume = volume / 100;
                console.log(`🔊 Volume: ${volume}%`);
            }
        });
    }
    
    // Stop radio audio
    stopRadioAudio(audioData) {
        if (!audioData) return;
        
        // Stop HTML5 Audio element
        if (audioData.audio) {
            try {
                audioData.audio.pause();
                audioData.audio.currentTime = 0;
                console.log('🔇 Radio audio stopped');
            } catch (e) {
                console.warn('⚠️ Error stopping audio:', e);
            }
            return;
        }
        
        // Legacy: Clear any scheduled intervals (for old Web Audio API tracks)
        if (audioData.intervals && audioData.intervals.length > 0) {
            audioData.intervals.forEach(id => clearInterval(id));
        }
        
        // Legacy: Stop and disconnect all active oscillators and gain nodes
        if (audioData.nodes && audioData.nodes.length > 0) {
            const now = window.soundEffects?.audioContext?.currentTime || 0;
            audioData.nodes.forEach(node => {
                try {
                    if (node.gain && node.gain.gain) {
                        node.gain.gain.cancelScheduledValues(now);
                        node.gain.gain.setValueAtTime(node.gain.gain.value, now);
                        node.gain.gain.linearRampToValueAtTime(0, now + 0.01);
                    }
                    if (node.osc) {
                        node.osc.stop(now + 0.01);
                    }
                } catch (e) {
                    // Already stopped
                }
            });
        }
        
        console.log('🔇 Radio audio stopped');
    }
    
    // Play audio track from MP3 file
    playAudioTrack(trackNum, volume) {
        // Map track numbers to file paths
        const trackFiles = {
            '1': 'assets/sounds/track1.mp3',
            '2': 'assets/sounds/track2.mp3' // Add track2.mp3 when available
        };
        
        const trackFile = trackFiles[trackNum];
        if (!trackFile) {
            console.warn(`⚠️ No audio file for track ${trackNum}`);
            return { intervals: [], nodes: [], audio: null };
        }
        
        // Create HTML5 Audio element
        const audio = new Audio(trackFile);
        audio.volume = volume;
        audio.loop = true; // Loop the track
        
        // Play the audio
        audio.play().then(() => {
            console.log(`🎵 Playing Track ${trackNum} from ${trackFile}`);
        }).catch(error => {
            console.error('❌ Error playing audio:', error);
        });
        
        return { intervals: [], nodes: [], audio: audio }; // Return audio element for cleanup
    }
    
    // Remove a plant from a tile
    removePlant(row, col) {
        const plantIndex = this.plants.findIndex(p => p.row === row && p.col === col);
        
        if (plantIndex === -1) {
            console.warn(`No plant found at [${row}, ${col}]`);
            return;
        }
        
        const plant = this.plants[plantIndex];
        
        // Clear earning interval
        if (plant.earningInterval) {
            clearInterval(plant.earningInterval);
        }
        
        // If this is a radio, stop any playing audio and clean up state
        const radioKey = `${row}-${col}`;
        if (this.radioStates[radioKey]) {
            this.stopRadioAudio(this.radioStates[radioKey].audioData);
            delete this.radioStates[radioKey];
            console.log(`📻 Radio state cleaned up for [${row}, ${col}]`);
        }
        
        plant.element.remove();
        
        // Mark tile as unoccupied
        this.gridSystem.setTileOccupied(row, col, false);
        
        // Remove from plants array
        this.plants.splice(plantIndex, 1);
        
        console.log(`🗑️ Plant removed from [${row}, ${col}]`);
    }
    
    // Remove plant and return to inventory
    removePlantAndReturnToInventory(row, col) {
        const plantIndex = this.plants.findIndex(p => p.row === row && p.col === col);
        
        if (plantIndex === -1) {
            console.warn(`No plant found at [${row}, ${col}]`);
            return;
        }
        
        const plant = this.plants[plantIndex];
        const itemId = plant.itemId;
        
        // Clear earning interval
        if (plant.earningInterval) {
            clearInterval(plant.earningInterval);
        }
        
        // Remove plant element
        plant.element.remove();
        
        // Mark tile as unoccupied
        this.gridSystem.setTileOccupied(row, col, false);
        
        // Remove from plants array
        this.plants.splice(plantIndex, 1);
        
        // Return item to inventory
        if (this.inventorySystem && itemId) {
            this.inventorySystem.addItemCount(itemId, 1);
            console.log(`✅ Plant removed and returned to inventory: ${itemId}`);
        }
        
        console.log(`🔄 Plant removed from [${row}, ${col}] and returned to inventory`);
    }
    
    // Get plant at specific tile
    getPlant(row, col) {
        return this.plants.find(p => p.row === row && p.col === col);
    }
    
    // Remove all plants
    clearAllPlants() {
        this.plants.forEach(plant => {
            plant.element.remove();
            this.gridSystem.setTileOccupied(plant.row, plant.col, false);
            // Clear earning interval if it exists
            if (plant.earningInterval) {
                clearInterval(plant.earningInterval);
            }
        });
        this.plants = [];
        console.log('🗑️ All plants cleared');
    }
    
    // Restore a plant from saved data (for loading save games)
    restorePlant(plantData) {
        const { row, col, itemId, itemName, itemDescription, rewardRate, plantedAt, rotation, serverPlantId } = plantData;
        
        // Check if tile is valid and not occupied
        const tile = this.gridSystem.getTile(row, col);
        if (!tile || tile.blocked || tile.occupied) {
            console.warn(`Cannot restore plant at [${row}, ${col}] - tile not available`);
            return;
        }
        
        // Create plant element
        const plant = document.createElement('div');
        plant.className = 'placed-plant';
        plant.dataset.row = row;
        plant.dataset.col = col;
        
        // Get item image from ITEMS_CONFIG (not inventory, since placed items may have 0 count)
        let imageSrc = this.plantImage;
        const itemConfig = ITEMS_CONFIG.find(config => config.id === itemId);
        if (itemConfig) {
            imageSrc = itemConfig.image;
        } else {
            console.warn(`⚠️ Item config not found for ${itemId}, using default plant image`);
        }
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = 'Plant';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.imageRendering = 'pixelated';
        img.style.imageRendering = '-moz-crisp-edges';
        img.style.imageRendering = 'crisp-edges';
        
        // Apply saved rotation if it exists
        console.log(`🔍 Restoring plant rotation: ${rotation} (type: ${typeof rotation})`);
        if (rotation) {
            img.style.transformOrigin = 'center center';
            img.style.transform = rotation === 1 ? 'scaleX(-1)' : 'scaleX(1)';
            console.log(`🔄 Applied rotation ${rotation} to plant at [${row}, ${col}]`);
        }
        
        plant.appendChild(img);
        
        // Position the plant on the tile
        const tileElement = tile.element;
        plant.style.left = tileElement.style.left;
        plant.style.top = tileElement.style.top;
        
        // Apply item-specific position adjustments
        if (itemId === 'mini-mary') {
            // Lift mini-mary up by 15px for better centering
            const currentTop = parseFloat(plant.style.top);
            plant.style.top = (currentTop - 15) + 'px';
        }
        
        if (itemId === 'puff-daddy') {
            // Lift puff-daddy up by 15px for better centering
            const currentTop = parseFloat(plant.style.top);
            plant.style.top = (currentTop - 15) + 'px';
        }
        
        plant.style.zIndex = 10 + (row * 10) + col;
        
        // Add plant to the grid overlay
        this.gridSystem.gridOverlay.appendChild(plant);
        
        // Mark tile as occupied
        this.gridSystem.setTileOccupied(row, col, true);
        
        // Store plant data
        this.plants.push({
            element: plant,
            row: row,
            col: col,
            plantedAt: plantedAt || Date.now(),
            itemId: itemId,
            itemName: itemName,
            itemDescription: itemDescription,
            rewardRate: rewardRate,
            earningInterval: null,
            rotation: rotation || 0, // Restore saved rotation
            serverPlantId: serverPlantId || null // Restore server ID if available
        });
        
        // Start earning animation
        this.startEarningAnimation(this.plants[this.plants.length - 1]);
        
        // Add click handler
        plant.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showPlantInfo(row, col);
        });
        
        console.log(`✅ Plant restored at [${row}, ${col}]${rotation ? ` (rotation: ${rotation})` : ''}`);
    }
    
    // Start earning animation for a plant
    startEarningAnimation(plantData) {
        // Skip animation for items that don't generate BUD (like decorative items)
        if (!plantData.rewardRate || plantData.rewardRate === '0 BUD/min') {
            console.log(`⏭️ Skipping earning animation for ${plantData.itemName} (no BUD generation)`);
            return;
        }
        
        // Create earning animation every 4 seconds
        plantData.earningInterval = setInterval(() => {
            this.createEarningEffect(plantData);
        }, 4000);
        
        // Also trigger immediately for first time
        setTimeout(() => {
            this.createEarningEffect(plantData);
        }, 2000); // Wait 2 seconds after placement for first animation
    }
    
    // Create earning visual effect
    createEarningEffect(plantData) {
        const plant = plantData.element;
        
        // Add glow effect to plant
        plant.classList.add('earning-glow');
        setTimeout(() => {
            plant.classList.remove('earning-glow');
        }, 1000);
        
        // Create bud image particle
        const particle = document.createElement('div');
        particle.className = 'earning-particle';
        
        const budImg = document.createElement('img');
        budImg.src = 'assets/bud.png';
        budImg.alt = 'BUD';
        budImg.style.width = '100%';
        budImg.style.height = '100%';
        budImg.style.imageRendering = 'pixelated';
        budImg.style.imageRendering = '-moz-crisp-edges';
        budImg.style.imageRendering = 'crisp-edges';
        
        particle.appendChild(budImg);
        
        // Position at plant location
        particle.style.left = plant.style.left;
        particle.style.top = plant.style.top;
        particle.style.zIndex = parseInt(plant.style.zIndex) + 1000; // Above plant
        
        // Add to grid overlay
        this.gridSystem.gridOverlay.appendChild(particle);
        
        // Remove after animation completes
        setTimeout(() => {
            particle.remove();
        }, 1500);
    }
    
    // Start BUD generation loop
    async startBUDGeneration() {
        // Check if Supabase is available
        const useServerGeneration = window.supabaseClient && window.supabaseClient.supabase;
        
        if (useServerGeneration) {
            // Use server-side generation only
            console.log('💚 Using server-side BUD generation');
            
            // Claim accumulated BUD on first load (includes offline generation)
            const claimResult = await window.supabaseClient.claimAccumulatedBUD();
            if (claimResult && claimResult.success && claimResult.claimed > 0) {
                console.log(`💰 Offline generation claimed: +${claimResult.claimed.toFixed(2)} BUD (${claimResult.timeElapsedMinutes} minutes)`);
            }
            
            // Now sync current BUD immediately
            await this.syncBUDWithServer();
            
            // Sync with server every 1 second for real-time updates
            this.serverSyncInterval = setInterval(async () => {
                await this.syncBUDWithServer();
            }, 1000); // Every 1 second for real-time feel
            
        } else {
            // Fallback to local generation if offline
            console.log('💚 Using local BUD generation (offline mode)');
            this.generationInterval = setInterval(() => {
                this.generateBUDFromPlants();
            }, 1000); // Every 1 second
        }
    }
    
    // Sync BUD balance with server (includes real-time generation)
    async syncBUDWithServer() {
        if (!window.currentPlayer || !window.supabaseClient.supabase) {
            return;
        }
        
        try {
            const budData = await window.supabaseClient.getPlayerBUD();
            if (budData && this.gameState) {
                // Update local state with server values
                this.gameState.player.totalBUD = parseFloat(budData.totalBUD || 0);
                this.gameState.player.accumulatedBUD = parseFloat(budData.accumulatedBUD || 0);
                
                // Update UI
                if (window.uiSystem && window.uiSystem.updateBUDCounter) {
                    window.uiSystem.updateBUDCounter();
                }
            }
        } catch (error) {
            console.error('❌ Failed to sync BUD with server:', error);
        }
    }
    
    // Generate BUD from all placed plants
    generateBUDFromPlants() {
        if (this.plants.length === 0) return;
        
        let totalGenerated = 0;
        
        this.plants.forEach(plantData => {
            // Parse reward rate (e.g., "1000 BUD/min" -> 1000)
            const rateMatch = plantData.rewardRate.match(/(\d+)/);
            if (rateMatch) {
                const budPerMinute = parseInt(rateMatch[1]);
                const budPerSecond = budPerMinute / 60;
                totalGenerated += budPerSecond;
            }
        });
        
        if (totalGenerated > 0 && this.gameState) {
            // Add to player's BUD
            this.gameState.player.accumulatedBUD += totalGenerated;
            
            // Update UI
            if (window.uiSystem) {
                window.uiSystem.updateBUDCounter();
            }
        }
    }
    
    // Stop BUD generation
    stopBUDGeneration() {
        if (this.generationInterval) {
            clearInterval(this.generationInterval);
            console.log('🛑 BUD generation stopped');
        }
    }
}
