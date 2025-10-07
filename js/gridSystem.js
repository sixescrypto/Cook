// Grid System - Handles interactive isometric tile grid overlay
class GridSystem {
    constructor() {
        this.gridOverlay = null;
        this.rows = 5; // Isometric rows (depth)
        this.cols = 5; // Isometric columns (width)
        this.tiles = [];
        
        // Isometric tile dimensions (aligned to match floor tiles)
        this.tileWidth = 144;  // Width of diamond
        this.tileHeight = 70; // Height of diamond
        
        // Resolution-specific grid alignments
        // More granular breakpoints ensure perfect alignment at all screen sizes
        // Tile dimensions scale proportionally between breakpoints
        this.resolutionBreakpoints = [
            // Desktop (large screens) - 1410px+
            { minWidth: 1410, offsetX: 0.416, offsetY: 0.446, tileWidth: 144, tileHeight: 70, name: 'Desktop' },
            // Large Laptop - 1300px (Custom aligned)
            { minWidth: 1300, offsetX: 0.416, offsetY: 0.446, tileWidth: 133, tileHeight: 64, name: 'Large Laptop' },
            // Laptop (medium screens) - 1200px (TESTED)
            { minWidth: 1200, offsetX: 0.416, offsetY: 0.446, tileWidth: 186, tileHeight: 91, name: 'Laptop' },
            // Small Laptop - 1100px
            { minWidth: 1100, offsetX: 0.416, offsetY: 0.446, tileWidth: 170, tileHeight: 83, name: 'Small Laptop' },
            // Tablet landscape - 1024px
            { minWidth: 1024, offsetX: 0.416, offsetY: 0.446, tileWidth: 160, tileHeight: 78, name: 'Tablet Landscape' },
            // Tablet portrait - 900px (TESTED)
            { minWidth: 900, offsetX: 0.416, offsetY: 0.446, tileWidth: 138, tileHeight: 67, name: 'Tablet Portrait' },
            // Large Tablet - 768px
            { minWidth: 768, offsetX: 0.416, offsetY: 0.446, tileWidth: 120, tileHeight: 58, name: 'Large Tablet' },
            // Small Tablet - 640px
            { minWidth: 640, offsetX: 0.416, offsetY: 0.446, tileWidth: 100, tileHeight: 49, name: 'Small Tablet' },
            // Mobile landscape - 480px
            { minWidth: 480, offsetX: 0.416, offsetY: 0.438, tileWidth: 80, tileHeight: 39, name: 'Mobile Landscape' },
            // Mobile portrait - 400px and below (TESTED - 400x965)
            { minWidth: 400, offsetX: 0.416, offsetY: 0.468, tileWidth: 52, tileHeight: 25, name: 'Mobile Portrait' },
            // Very small screens fallback
            { minWidth: 0, offsetX: 0.416, offsetY: 0.468, tileWidth: 52, tileHeight: 25, name: 'Mobile Small' }
        ];
        
        // Apply initial resolution settings
        this.applyResolutionSettings();
    }
    
    // Detect current screen size and apply appropriate grid alignment
    applyResolutionSettings() {
        const width = window.innerWidth;
        
        // Find the closest breakpoint by calculating distance to each
        let closestBreakpoint = this.resolutionBreakpoints[0];
        let smallestDistance = Math.abs(width - closestBreakpoint.minWidth);
        
        for (const bp of this.resolutionBreakpoints) {
            const distance = Math.abs(width - bp.minWidth);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestBreakpoint = bp;
            }
        }
        
        this.offsetX = closestBreakpoint.offsetX;
        this.offsetY = closestBreakpoint.offsetY;
        this.tileWidth = closestBreakpoint.tileWidth;
        this.tileHeight = closestBreakpoint.tileHeight;
        this.currentBreakpoint = closestBreakpoint.name;
        console.log(`📐 Applied ${closestBreakpoint.name} alignment (${width}px, ${smallestDistance}px away) - offsetX: ${this.offsetX}, offsetY: ${this.offsetY}, tileWidth: ${this.tileWidth}px, tileHeight: ${this.tileHeight}px`);
    }
    
    // Save current alignment to the appropriate breakpoint
    saveCurrentAlignment() {
        const width = window.innerWidth;
        const breakpoint = this.resolutionBreakpoints.find(bp => width >= bp.minWidth);
        
        if (breakpoint) {
            breakpoint.offsetX = this.offsetX;
            breakpoint.offsetY = this.offsetY;
            console.log(`💾 Saved alignment for ${breakpoint.name}: offsetX=${this.offsetX}, offsetY=${this.offsetY}`);
            
            // Save to localStorage for persistence
            localStorage.setItem('gridAlignments', JSON.stringify(this.resolutionBreakpoints));
            console.log('✅ Grid alignments saved to localStorage');
        }
    }
    
    // Load saved alignments from localStorage
    loadSavedAlignments() {
        const saved = localStorage.getItem('gridAlignments');
        if (saved) {
            try {
                const savedBreakpoints = JSON.parse(saved);
                // Merge saved values with defaults
                savedBreakpoints.forEach(savedBp => {
                    const breakpoint = this.resolutionBreakpoints.find(bp => bp.name === savedBp.name);
                    if (breakpoint) {
                        breakpoint.offsetX = savedBp.offsetX;
                        breakpoint.offsetY = savedBp.offsetY;
                    }
                });
                console.log('✅ Loaded saved grid alignments from localStorage');
            } catch (error) {
                console.error('❌ Failed to load saved alignments:', error);
            }
        }
    }
    
    // Initialize grid system
    init() {
        this.gridOverlay = document.getElementById('gridOverlay');
        if (!this.gridOverlay) {
            console.error('❌ Grid overlay element not found');
            return;
        }
        
        // Apply resolution-specific settings (use defaults from code)
        this.applyResolutionSettings();
        
        console.log('✅ Grid overlay found:', this.gridOverlay);
        this.createIsometricGrid();
        console.log(`✅ Isometric grid initialized: ${this.rows}x${this.cols} tiles (${this.tiles.length} total)`);
        
        // Verify tiles are clickable
        if (this.tiles.length > 0) {
            console.log('✅ First tile position:', {
                left: this.tiles[0].element.style.left,
                top: this.tiles[0].element.style.top
            });
        }
        
        // Add resize listener to update grid when window is resized
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(async () => {
                console.log('🔄 Window resized, updating grid...');
                
                // Reapply resolution settings for new window size
                this.applyResolutionSettings();
                
                this.createIsometricGrid();
                
                // Reload plants from server after grid recreation
                if (window.supabaseClient && window.currentPlayer && window.plantPlacement) {
                    try {
                        console.log('🌱 Reloading plants after grid resize...');
                        const serverPlants = await window.supabaseClient.getPlacedPlants();
                        
                        if (serverPlants && serverPlants.length > 0) {
                            // Clear any existing plants and animations
                            window.plantPlacement.plants.forEach(plant => {
                                if (plant.earningInterval) {
                                    clearInterval(plant.earningInterval);
                                }
                            });
                            window.plantPlacement.plants = [];
                            
                            // Clear all BUD animation particles
                            const particles = this.gridOverlay.querySelectorAll('.earning-particle');
                            particles.forEach(p => p.remove());
                            
                            const gardenContainer = document.querySelector('.garden-container');
                            if (gardenContainer) {
                                const plantElements = gardenContainer.querySelectorAll('.plant-container, .item-container');
                                plantElements.forEach(el => el.remove());
                            }
                            
                            // Reset grid tile availability
                            this.tiles.forEach(tile => {
                                tile.occupied = false;
                                tile.plantId = null;
                            });
                            
                            // Restore plants
                            serverPlants.forEach((serverPlant) => {
                                const itemConfig = ITEMS_CONFIG.find(config => config.id === serverPlant.item_id);
                                
                                const plantData = {
                                    row: serverPlant.grid_row,
                                    col: serverPlant.grid_col,
                                    itemId: serverPlant.item_id,
                                    itemName: itemConfig ? itemConfig.name : serverPlant.item_id,
                                    itemDescription: itemConfig ? itemConfig.description : '',
                                    rewardRate: serverPlant.reward_rate,
                                    rotation: serverPlant.rotation || 0,
                                    serverPlantId: serverPlant.id
                                };
                                window.plantPlacement.restorePlant(plantData);
                            });
                            
                            console.log('✅ Plants reloaded after resize:', serverPlants.length);
                        }
                    } catch (error) {
                        console.error('❌ Failed to reload plants after resize:', error);
                    }
                }
                
                // If grid aligner is active, reapply tile borders
                if (window.gridAligner && window.gridAligner.active) {
                    window.gridAligner.showAllTiles();
                }
            }, 250); // Debounce resize events
        });
    }
    
    // Create isometric grid tiles
    createIsometricGrid() {
        this.gridOverlay.innerHTML = ''; // Clear existing tiles
        this.tiles = [];
        
        const containerWidth = this.gridOverlay.offsetWidth || 800;
        const containerHeight = this.gridOverlay.offsetHeight || 600;
        
        // Blocked tiles (front-center area)
        const blockedTiles = [
            [0, 0], [0, 1], [0, 2],
            [1, 0], [1, 1],
            [2, 0], [2, 1]
        ];
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tile = this.createIsometricTile(row, col, containerWidth, containerHeight);
                
                // Mark blocked tiles
                const isBlocked = blockedTiles.some(([blockedRow, blockedCol]) => 
                    blockedRow === row && blockedCol === col
                );
                
                if (isBlocked) {
                    tile.classList.add('blocked');
                }
                
                this.gridOverlay.appendChild(tile);
                this.tiles.push({
                    element: tile,
                    row: row,
                    col: col,
                    occupied: false,
                    blocked: isBlocked
                });
            }
        }
    }
    
    // Create individual isometric tile
    createIsometricTile(row, col, containerWidth, containerHeight) {
        const tile = document.createElement('div');
        tile.className = 'grid-tile';
        tile.dataset.row = row;
        tile.dataset.col = col;
        
        // Calculate isometric position
        // In isometric view: x increases with col-row, y increases with col+row
        const isoX = (col - row) * (this.tileWidth / 2);
        const isoY = (col + row) * (this.tileHeight / 2);
        
        // Center the grid and add offset
        const centerX = containerWidth * this.offsetX;
        const centerY = containerHeight * this.offsetY;
        
        const finalX = centerX + isoX;
        const finalY = centerY + isoY;
        
        tile.style.left = `${finalX}px`;
        tile.style.top = `${finalY}px`;
        tile.style.width = `${this.tileWidth}px`;
        tile.style.height = `${this.tileHeight}px`;
        
        // Add click handler
        tile.addEventListener('click', () => {
            this.handleTileClick(row, col);
        });
        
        // Optional: Add hover info
        tile.addEventListener('mouseenter', () => {
            this.handleTileHover(row, col);
        });
        
        return tile;
    }
    
    // Recalculate grid (useful for adjusting alignment)
    recalculateGrid() {
        if (!this.gridOverlay) return;
        
        const containerWidth = this.gridOverlay.offsetWidth || 800;
        const containerHeight = this.gridOverlay.offsetHeight || 600;
        
        this.tiles.forEach(tileData => {
            const { row, col, element } = tileData;
            
            // Recalculate isometric position
            const isoX = (col - row) * (this.tileWidth / 2);
            const isoY = (col + row) * (this.tileHeight / 2);
            
            const centerX = containerWidth * this.offsetX;
            const centerY = containerHeight * this.offsetY;
            
            const finalX = centerX + isoX;
            const finalY = centerY + isoY;
            
            element.style.left = `${finalX}px`;
            element.style.top = `${finalY}px`;
            
            // Update tile size dynamically
            element.style.width = `${this.tileWidth}px`;
            element.style.height = `${this.tileHeight}px`;
        });
    }
    
    // Adjust grid alignment (call this to fine-tune positioning)
    adjustAlignment(offsetXPercent, offsetYPercent) {
        this.offsetX = offsetXPercent;
        this.offsetY = offsetYPercent;
        this.recalculateGrid();
    }
    
    // Adjust tile size (call this to match your floor tiles)
    adjustTileSize(width, height) {
        this.tileWidth = width;
        this.tileHeight = height;
        this.recalculateGrid();
    }
    
    // Handle tile click
    handleTileClick(row, col) {
        console.log(`Tile clicked: [${row}, ${col}]`);
        // You can add custom logic here
        // For example: place object, plant item, etc.
    }
    
    // Handle tile hover
    handleTileHover(row, col) {
        // Optional: Show tile coordinates or info
        // console.log(`Hovering: [${row}, ${col}]`);
    }
    
    // Get tile at position
    getTile(row, col) {
        return this.tiles.find(t => t.row === row && t.col === col);
    }
    
    // Mark tile as occupied
    setTileOccupied(row, col, occupied = true) {
        const tile = this.getTile(row, col);
        if (tile) {
            tile.occupied = occupied;
            if (occupied) {
                tile.element.classList.add('occupied');
            } else {
                tile.element.classList.remove('occupied');
            }
        }
    }
    
    // Get all available (unoccupied) tiles
    getAvailableTiles() {
        return this.tiles.filter(t => !t.occupied);
    }
    
    // Highlight specific tile
    highlightTile(row, col, highlight = true) {
        const tile = this.getTile(row, col);
        if (tile) {
            if (highlight) {
                tile.element.classList.add('highlighted');
            } else {
                tile.element.classList.remove('highlighted');
            }
        }
    }
    
    // Clear all highlights
    clearHighlights() {
        this.tiles.forEach(tile => {
            tile.element.classList.remove('highlighted');
        });
    }
}
