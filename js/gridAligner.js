// Grid Alignment Helper - Interactive tool for aligning grid tiles
class GridAligner {
    constructor(gridSystem) {
        this.gridSystem = gridSystem;
        this.active = false;
        this.step = 0.01; // Adjustment step
        this.sizeStep = 2; // Tile size adjustment step
        this.helpPanel = null;
        this.infoPanel = null;
    }
    
    // Activate alignment mode
    activate() {
        if (this.active) return;
        
        this.active = true;
        this.createHelpPanel();
        this.createInfoPanel();
        this.bindKeys();
        this.updateInfo();
        this.showAllTiles(); // Show all tiles with borders
        
        console.log('🎯 Grid Alignment Mode ACTIVE');
        console.log('Use arrow keys to move the entire grid. Press ESC to finish.');
    }
    
    // Show all tiles with visible borders
    showAllTiles() {
        this.gridSystem.tiles.forEach(tileData => {
            tileData.element.classList.add('aligner-visible');
        });
        console.log('✅ All tiles now visible for alignment');
    }
    
    // Hide tile borders
    hideAllTiles() {
        this.gridSystem.tiles.forEach(tileData => {
            tileData.element.classList.remove('aligner-visible');
        });
        console.log('✅ Tile borders hidden');
    }
    
    // Deactivate alignment mode
    deactivate() {
        if (!this.active) return;
        
        this.active = false;
        if (this.helpPanel) this.helpPanel.remove();
        if (this.infoPanel) this.infoPanel.remove();
        this.hideAllTiles(); // Hide tile borders
        document.removeEventListener('keydown', this.keyHandler);
        
        // Save current alignment to gridSystem
        this.gridSystem.saveCurrentAlignment();
        
        const width = window.innerWidth;
        const breakpointName = this.gridSystem.currentBreakpoint || 'Unknown';
        
        console.log('✅ Grid Alignment Mode DEACTIVATED');
        console.log('');
        console.log(`📋 SAVED ALIGNMENT FOR: ${breakpointName}`);
        console.log(`   Window Width: ${width}px`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   offsetX: ${this.gridSystem.offsetX.toFixed(3)}`);
        console.log(`   offsetY: ${this.gridSystem.offsetY.toFixed(3)}`);
        console.log(`   tileWidth: ${this.gridSystem.tileWidth}px`);
        console.log(`   tileHeight: ${this.gridSystem.tileHeight}px`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Alignment saved to localStorage');
        console.log('💡 Resize window to adjust other breakpoints');
    }
    
    // Create help panel
    createHelpPanel() {
        this.helpPanel = document.createElement('div');
        this.helpPanel.id = 'gridAlignerHelp';
        this.helpPanel.innerHTML = `
            <div id="gridAlignerContent" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                border: 3px solid #00ff41;
                padding: 20px;
                font-family: 'Press Start 2P', monospace;
                font-size: 9px;
                color: #00ff41;
                z-index: 10000;
                max-width: 350px;
                box-shadow: 0 0 20px rgba(0, 255, 65, 0.5);
                cursor: move;
                user-select: none;
            ">
                <div id="gridAlignerHeader" style="margin-bottom: 15px; font-size: 11px; text-align: center; border-bottom: 2px solid #00ff41; padding-bottom: 10px;">
                    🎯 GRID ALIGNER
                    <button id="toggleTransparency" style="
                        float: right;
                        background: rgba(0, 255, 65, 0.2);
                        border: 2px solid #00ff41;
                        color: #00ff41;
                        cursor: pointer;
                        padding: 4px 8px;
                        font-family: 'Press Start 2P', monospace;
                        font-size: 7px;
                        margin-top: -5px;
                    ">👁️</button>
                </div>
                
                <div style="margin-bottom: 10px; color: #4a9d5f;">MOVE ENTIRE GRID:</div>
                <div style="margin-left: 10px; line-height: 1.8;">
                    ← → ↑ ↓ : Move Grid<br>
                    Shift + Arrows: Fine Adjust<br>
                    (All tiles move together)
                </div>
                
                <div style="margin: 10px 0; color: #4a9d5f;">TILE SIZE:</div>
                <div style="margin-left: 10px; line-height: 1.8;">
                    + or = : Both larger<br>
                    - or _ : Both smaller<br>
                    ] : Width +2px<br>
                    [ : Width -2px<br>
                    ' : Height +2px<br>
                    ; : Height -2px<br>
                    Shift + ] : Width +10px<br>
                    Shift + [ : Width -10px<br>
                    Shift + ' : Height +10px<br>
                    Shift + ; : Height -10px
                </div>
                
                <div style="margin: 10px 0; color: #4a9d5f;">GRID SIZE:</div>
                <div style="margin-left: 10px; line-height: 1.8;">
                    R : Add row<br>
                    T : Remove row<br>
                    C : Add column<br>
                    V : Remove column
                </div>
                
                <div style="margin-top: 15px; padding-top: 10px; border-top: 2px solid #00ff41; color: #ffff00; text-align: center;">
                    ESC : Finish & Save
                </div>
                <div style="margin-top: 8px; color: #888; font-size: 7px; text-align: center;">
                    Drag to move • 👁️ to toggle transparency
                </div>
            </div>
        `;
        document.body.appendChild(this.helpPanel);
        
        // Make panel draggable
        this.makeDraggable();
        
        // Add transparency toggle
        this.addTransparencyToggle();
    }
    
    // Create info panel
    createInfoPanel() {
        this.infoPanel = document.createElement('div');
        this.infoPanel.id = 'gridAlignerInfo';
        this.infoPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 3px solid #ffff00;
            padding: 15px;
            font-family: 'Press Start 2P', monospace;
            font-size: 8px;
            color: #ffff00;
            z-index: 10000;
            min-width: 250px;
            box-shadow: 0 0 20px rgba(255, 255, 0, 0.5);
        `;
        document.body.appendChild(this.infoPanel);
    }
    
    // Update info panel
    updateInfo() {
        if (!this.infoPanel) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        const resolutionKey = `${width}x${height}`;
        const breakpointName = this.gridSystem.currentBreakpoint || 'Unknown';
        
        this.infoPanel.innerHTML = `
            <div style="margin-bottom: 8px; color: #00ff41; font-size: 9px;">RESOLUTION: ${resolutionKey}</div>
            <div style="margin-bottom: 8px; color: #ffaa00; font-size: 8px;">BREAKPOINT: ${breakpointName}</div>
            <div style="margin-bottom: 8px; color: #ffffff; font-size: 9px;">CURRENT VALUES:</div>
            <div style="line-height: 1.8;">
                Grid: ${this.gridSystem.rows}x${this.gridSystem.cols}<br>
                X: ${this.gridSystem.offsetX.toFixed(3)}<br>
                Y: ${this.gridSystem.offsetY.toFixed(3)}<br>
                Width: ${this.gridSystem.tileWidth}px<br>
                Height: ${this.gridSystem.tileHeight}px
            </div>
            <div style="margin-top: 10px; color: #4a9d5f; font-size: 7px; border-top: 1px solid #ffff00; padding-top: 8px;">
                Adjustments auto-save<br>to localStorage on ESC
            </div>
        `;
    }
    
    // Bind keyboard controls
    bindKeys() {
        this.keyHandler = (e) => {
            if (!this.active) return;
            
            const shift = e.shiftKey;
            const step = shift ? this.step / 5 : this.step; // Fine tune with shift
            
            let handled = false;
            
            switch(e.key) {
                // Position controls
                case 'ArrowLeft':
                    this.gridSystem.offsetX -= step;
                    this.gridSystem.recalculateGrid();
                    handled = true;
                    break;
                    
                case 'ArrowRight':
                    this.gridSystem.offsetX += step;
                    this.gridSystem.recalculateGrid();
                    handled = true;
                    break;
                    
                case 'ArrowUp':
                    this.gridSystem.offsetY -= step;
                    this.gridSystem.recalculateGrid();
                    handled = true;
                    break;
                    
                case 'ArrowDown':
                    this.gridSystem.offsetY += step;
                    this.gridSystem.recalculateGrid();
                    handled = true;
                    break;
                
                // Size controls (both dimensions)
                case '=':
                case '+':
                    this.gridSystem.tileWidth += this.sizeStep;
                    this.gridSystem.tileHeight += this.sizeStep / 2;
                    this.gridSystem.recalculateGrid();
                    handled = true;
                    break;
                    
                case '-':
                case '_':
                    this.gridSystem.tileWidth -= this.sizeStep;
                    this.gridSystem.tileHeight -= this.sizeStep / 2;
                    this.gridSystem.recalculateGrid();
                    handled = true;
                    break;
                
                // Width only
                case '[':
                    const widthDec = shift ? 10 : this.sizeStep;
                    this.gridSystem.tileWidth -= widthDec;
                    this.gridSystem.recalculateGrid();
                    handled = true;
                    break;
                    
                case ']':
                    const widthInc = shift ? 10 : this.sizeStep;
                    this.gridSystem.tileWidth += widthInc;
                    this.gridSystem.recalculateGrid();
                    handled = true;
                    break;
                
                // Height only
                case ';':
                    const heightDec = shift ? 10 : this.sizeStep;
                    this.gridSystem.tileHeight -= heightDec;
                    this.gridSystem.recalculateGrid();
                    handled = true;
                    break;
                    
                case "'":
                    const heightInc = shift ? 10 : this.sizeStep;
                    this.gridSystem.tileHeight += heightInc;
                    this.gridSystem.recalculateGrid();
                    handled = true;
                    break;
                
                // Grid dimensions
                case 'r':
                case 'R':
                    this.gridSystem.rows++;
                    this.gridSystem.createIsometricGrid();
                    this.showAllTiles(); // Re-show tile borders after grid recreated
                    handled = true;
                    break;
                    
                case 't':
                case 'T':
                    if (this.gridSystem.rows > 1) {
                        this.gridSystem.rows--;
                        this.gridSystem.createIsometricGrid();
                        this.showAllTiles(); // Re-show tile borders after grid recreated
                    }
                    handled = true;
                    break;
                    
                case 'c':
                case 'C':
                    this.gridSystem.cols++;
                    this.gridSystem.createIsometricGrid();
                    this.showAllTiles(); // Re-show tile borders after grid recreated
                    handled = true;
                    break;
                    
                case 'v':
                case 'V':
                    if (this.gridSystem.cols > 1) {
                        this.gridSystem.cols--;
                        this.gridSystem.createIsometricGrid();
                        this.showAllTiles(); // Re-show tile borders after grid recreated
                    }
                    handled = true;
                    break;
                
                // Finish
                case 'Escape':
                    this.deactivate();
                    handled = true;
                    break;
            }
            
            if (handled) {
                e.preventDefault();
                this.updateInfo();
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
    }
    
    // Make the help panel draggable
    makeDraggable() {
        const panel = document.getElementById('gridAlignerContent');
        if (!panel) return;
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        panel.addEventListener('mousedown', dragStart);
        panel.addEventListener('touchstart', dragStart);
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
        
        function dragStart(e) {
            if (e.target.id === 'toggleTransparency') return; // Don't drag when clicking button
            
            if (e.type === 'touchstart') {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            
            isDragging = true;
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            
            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }
            
            xOffset = currentX;
            yOffset = currentY;
            
            setTranslate(currentX, currentY, panel);
        }
        
        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
        
        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate(${xPos}px, ${yPos}px)`;
        }
    }
    
    // Add transparency toggle functionality
    addTransparencyToggle() {
        const toggleBtn = document.getElementById('toggleTransparency');
        const panel = document.getElementById('gridAlignerContent');
        
        if (!toggleBtn || !panel) return;
        
        let isTransparent = false;
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent dragging when clicking button
            
            isTransparent = !isTransparent;
            
            if (isTransparent) {
                panel.style.opacity = '0.2';
                panel.style.pointerEvents = 'none'; // Allow clicking through
                toggleBtn.style.pointerEvents = 'auto'; // But keep button clickable
                toggleBtn.textContent = '👁️‍🗨️';
                console.log('👁️ Grid Aligner: Transparent mode ON');
            } else {
                panel.style.opacity = '1';
                panel.style.pointerEvents = 'auto';
                toggleBtn.textContent = '👁️';
                console.log('👁️ Grid Aligner: Transparent mode OFF');
            }
        });
    }
}

// Make globally available
window.GridAligner = GridAligner;
