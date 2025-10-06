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
        
        // Offset to center the grid on the floor (perfectly aligned)
        this.offsetX = 0.416; // 41.6% from left
        this.offsetY = 0.448; // 44.8% from top
    }
    
    // Initialize grid system
    init() {
        this.gridOverlay = document.getElementById('gridOverlay');
        if (!this.gridOverlay) {
            console.error('❌ Grid overlay element not found');
            return;
        }
        
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
