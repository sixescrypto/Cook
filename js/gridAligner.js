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
        
        console.log('🎯 Grid Alignment Mode ACTIVE');
        console.log('Use arrow keys and +/- to adjust. Press ESC to finish.');
    }
    
    // Deactivate alignment mode
    deactivate() {
        if (!this.active) return;
        
        this.active = false;
        if (this.helpPanel) this.helpPanel.remove();
        if (this.infoPanel) this.infoPanel.remove();
        document.removeEventListener('keydown', this.keyHandler);
        
        console.log('✅ Grid Alignment Mode DEACTIVATED');
        console.log('');
        console.log('📋 FINAL VALUES - Copy these to gridSystem.js:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`this.rows = ${this.gridSystem.rows};`);
        console.log(`this.cols = ${this.gridSystem.cols};`);
        console.log(`this.tileWidth = ${this.gridSystem.tileWidth};`);
        console.log(`this.tileHeight = ${this.gridSystem.tileHeight};`);
        console.log(`this.offsetX = ${this.gridSystem.offsetX.toFixed(3)};`);
        console.log(`this.offsetY = ${this.gridSystem.offsetY.toFixed(3)};`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('📝 Location: js/gridSystem.js, lines 5-15');
        console.log('💡 Tell me these values and I\'ll update the file for you!');
    }
    
    // Create help panel
    createHelpPanel() {
        this.helpPanel = document.createElement('div');
        this.helpPanel.id = 'gridAlignerHelp';
        this.helpPanel.innerHTML = `
            <div style="
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
            ">
                <div style="margin-bottom: 15px; font-size: 11px; text-align: center; border-bottom: 2px solid #00ff41; padding-bottom: 10px;">
                    🎯 GRID ALIGNER
                </div>
                
                <div style="margin-bottom: 10px; color: #4a9d5f;">POSITION:</div>
                <div style="margin-left: 10px; line-height: 1.8;">
                    ← → : Move Left/Right<br>
                    ↑ ↓ : Move Up/Down<br>
                    Shift + Arrows: Fine tune
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
            </div>
        `;
        document.body.appendChild(this.helpPanel);
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
        
        this.infoPanel.innerHTML = `
            <div style="margin-bottom: 8px; color: #ffffff; font-size: 9px;">CURRENT VALUES:</div>
            <div style="line-height: 1.8;">
                Grid: ${this.gridSystem.rows}x${this.gridSystem.cols}<br>
                X: ${this.gridSystem.offsetX.toFixed(3)}<br>
                Y: ${this.gridSystem.offsetY.toFixed(3)}<br>
                Width: ${this.gridSystem.tileWidth}px<br>
                Height: ${this.gridSystem.tileHeight}px
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
                    handled = true;
                    break;
                    
                case 't':
                case 'T':
                    if (this.gridSystem.rows > 1) {
                        this.gridSystem.rows--;
                        this.gridSystem.createIsometricGrid();
                    }
                    handled = true;
                    break;
                    
                case 'c':
                case 'C':
                    this.gridSystem.cols++;
                    this.gridSystem.createIsometricGrid();
                    handled = true;
                    break;
                    
                case 'v':
                case 'V':
                    if (this.gridSystem.cols > 1) {
                        this.gridSystem.cols--;
                        this.gridSystem.createIsometricGrid();
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
}

// Make globally available
window.GridAligner = GridAligner;
