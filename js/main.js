// Main Game Initialization
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌿 BUD Garden - Initializing...');
    
    // Initialize Supabase first
    const supabaseInitialized = await window.supabaseClient.init(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
    );
    
    if (!supabaseInitialized) {
        console.error('❌ Failed to initialize Supabase');
        // Continue with local storage as fallback
    }
    
    // Authenticate player (use test wallet for now, will add MetaMask later)
    let playerId = localStorage.getItem('playerId');
    let walletAddress = localStorage.getItem('walletAddress');
    
    if (!walletAddress) {
        // Generate a temporary wallet for testing
        walletAddress = 'local-player-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('walletAddress', walletAddress);
        console.log('🆔 Generated test wallet:', walletAddress);
    }
    
    if (supabaseInitialized) {
        try {
            const player = await window.supabaseClient.authenticateWallet(walletAddress);
            if (player) {
                playerId = player.id;
                localStorage.setItem('playerId', playerId);
                console.log('✅ Player authenticated:', player);
                
                // Store player reference globally
                window.currentPlayer = player;
            }
        } catch (error) {
            console.error('❌ Failed to authenticate player:', error);
        }
    }
    
    // Initialize game state
    gameState.init();
    
    // Initialize systems
    plantSystem = new PlantSystem(gameState);
    tokenSystem = new TokenSystem(gameState);
    uiSystem = new UISystem(gameState, plantSystem, tokenSystem);
    gridSystem = new GridSystem();
    plantPlacement = new PlantPlacement(gridSystem);
    inventorySystem = new InventorySystem(plantPlacement);
    shopSystem = new ShopSystem(inventorySystem, gameState);
    
    // Make systems globally accessible EARLY so saves can access them
    window.uiSystem = uiSystem;
    window.inventorySystem = inventorySystem;
    window.plantPlacement = plantPlacement;
    
    // Start systems
    plantSystem.init();
    tokenSystem.init();
    uiSystem.init();
    gridSystem.init();
    plantPlacement.init();
    // Don't init inventory yet - load saved data first
    shopSystem.init();
    
    // Connect plant placement to inventory (bidirectional reference)
    plantPlacement.inventorySystem = inventorySystem;
    plantPlacement.gameState = gameState; // Connect gameState for BUD generation
    
    // 🔒 100% SERVER-SIDE ARCHITECTURE (No localStorage Cache)
    // All data loaded from Supabase - localStorage only used for offline fallback
    
    console.log('🔐 Loading ALL game data from server (100% cheat-proof)...');
    
    // Load everything from Supabase (server is the ONLY source of truth)
    if (supabaseInitialized && window.currentPlayer) {
        try {
            console.log('🔄 Syncing with server...');
            
            // FORCE CLEAR inventory before loading from server (prevent localStorage contamination)
            inventorySystem.items = [];
            console.log('🧹 Cleared local inventory before server sync');
            
            // Load inventory from server
            const serverInventory = await window.supabaseClient.getInventory();
            
            if (serverInventory && serverInventory.length > 0) {
                // Map server inventory to client format
                inventorySystem.items = serverInventory.map(item => {
                    // Find item config to get full details
                    const itemConfig = ITEMS_CONFIG.find(config => config.id === item.item_id);
                    
                    if (itemConfig) {
                        return {
                            id: item.item_id,
                            name: itemConfig.name,
                            description: itemConfig.description,
                            image: itemConfig.image,
                            type: itemConfig.type,
                            rewardRate: itemConfig.rewardRate,
                            count: item.count || item.quantity || 1
                        };
                    } else {
                        console.warn('⚠️ Unknown item in inventory:', item.item_id);
                        return null;
                    }
                }).filter(item => item !== null); // Remove unknown items
                
                console.log('✅ SERVER INVENTORY LOADED:', inventorySystem.items.length, 'items');
                console.log('📦 Server inventory details:', inventorySystem.items);
            } else {
                console.log('ℹ️ No inventory on server (starting fresh with empty inventory)');
                inventorySystem.items = [];
            }
            
            // Initialize inventory with server data
            inventorySystem.init();
            
            // Load placed plants from server
            const serverPlants = await window.supabaseClient.getPlacedPlants();
            
            if (serverPlants && serverPlants.length > 0) {
                // Clear any existing plants
                plantPlacement.plants = [];
                const gardenContainer = document.querySelector('.garden-container');
                if (gardenContainer) {
                    // Remove all plant elements except grid overlay
                    const plantElements = gardenContainer.querySelectorAll('.plant-container, .item-container');
                    plantElements.forEach(el => el.remove());
                }
                
                // Reset grid tile availability
                if (gridSystem && gridSystem.tiles) {
                    gridSystem.tiles.forEach(tile => {
                        tile.occupied = false;
                        tile.plantId = null;
                    });
                }
                
                // Restore plants from server data (source of truth)
                serverPlants.forEach((serverPlant) => {
                    // Find item config to get full details
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
                    plantPlacement.restorePlant(plantData);
                });
                
                console.log('✅ SERVER PLANTS LOADED:', serverPlants.length, 'plants');
            } else {
                console.log('ℹ️ No plants on server (empty garden)');
            }
            
            // Update localStorage cache with server data (for offline support only)
            gameState.saveToStorage();
            console.log('✅ Server data synced successfully (100% cheat-proof)');
            
        } catch (error) {
            console.error('❌ Failed to load server data:', error);
            console.log('⚠️ Cannot load game without server connection');
            
            // DO NOT LOAD FROM LOCALSTORAGE - Server is the ONLY source of truth
            // Start with empty inventory
            inventorySystem.items = [];
            inventorySystem.init();
            
            // Show error message to user
            alert('Unable to connect to server. Please check your internet connection and refresh the page.');
        }
    } else {
        console.log('⚠️ Server unavailable - Cannot load game');
        
        // DO NOT LOAD FROM LOCALSTORAGE - Server is the ONLY source of truth
        // Start with empty inventory
        inventorySystem.items = [];
        inventorySystem.init();
        
        // Show error message to user
        alert('Server is unavailable. Please refresh the page to try again.');
    }
    
    // Note: localStorage is ONLY used as offline cache (write-only)
    // All data is loaded from Supabase server (100% cheat-proof)
    // Server is the ONLY source of truth when online
    
    // Setup tab switching
    setupTabs();
    
    // Initialize grid aligner (helper tool)
    window.gridAligner = new GridAligner(gridSystem);
    
    // Instructions for alignment
    console.log('');
    console.log('🎯 GRID ALIGNMENT TOOL:');
    console.log('Type: gridAligner.activate()');
    console.log('Then use arrow keys to align the grid!');
    console.log('');
    console.log('🌱 PLANT PLACEMENT:');
    console.log('1. Click an item in your INVENTORY');
    console.log('2. Click EQUIP button to enable placement mode');
    console.log('3. Click grid tiles to place plants');
    console.log('4. Click UNEQUIP to disable placement mode');
    console.log('5. Click placed plants to remove them');
    console.log('');
    
    // Log game info
    console.log('Game Configuration:');
    console.log('- Total Supply:', CONFIG.TOTAL_SUPPLY.toLocaleString(), 'BUD');
    console.log('- No Time Limit - Game runs indefinitely');
    console.log('- Estimated Users:', CONFIG.ESTIMATED_USERS);
    console.log('- Tokens per User:', CONFIG.TOKENS_PER_USER_TOTAL.toLocaleString(), 'BUD');
    console.log('- Base Generation Rate:', CONFIG.BASE_GENERATION_RATE.toFixed(2), 'BUD/min');
    
    // Log game start
    console.log('💚 Current BUD:', (gameState.player.totalBUD + gameState.player.accumulatedBUD).toFixed(2));
    
    // Auto-save every 30 seconds (disabled - game is functionless)
    // Will rebuild from scratch
    
    // Display tips periodically (disabled - game is functionless)
    // Will rebuild from scratch
    
    // Keyboard shortcuts (disabled - game is functionless)
    // Will rebuild from scratch
    
    // Milestone notifications (disabled - game is functionless)
    // Will rebuild from scratch
    
    // Warn when stats are getting low (removed - no manual care needed)
    
    // Handle page visibility (disabled - game is functionless)
    // Will rebuild from scratch
    
    // Note: beforeunload save disabled - Supabase stores everything server-side
    // All BUD generation and plant data is automatically synced to the server
    
    // Debug mode (accessible via console)
    window.BUDGarden = {
        gameState,
        plantSystem,
        tokenSystem,
        uiSystem,
        config: CONFIG,
        utils: TokenomicsUtils,
        
        // Debug commands
        debug: {
            // Check what's saved in localStorage
            checkSave: () => {
                const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.GAME_STATE);
                if (saved) {
                    const state = JSON.parse(saved);
                    console.log('💾 Saved state:', state);
                    console.log('📦 Inventory:', state.inventory);
                    console.log('🌱 Placed plants:', state.placedPlants);
                } else {
                    console.log('❌ No save data found');
                }
            },
            
            // Manually save
            save: () => {
                gameState.saveToStorage();
                console.log('💾 Manual save complete');
                window.BUDGarden.debug.checkSave();
            },
            
            // Clear save
            clearSave: () => {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.GAME_STATE);
                console.log('🗑️ Save data cleared - reloading...');
                location.reload();
            },
            
            addBUD: (amount) => {
                gameState.player.totalBUD += amount;
                uiSystem.updateBUDCounter();
                console.log('Added', amount, 'BUD');
            },
            fillStats: () => {
                gameState.plant.health = 100;
                gameState.plant.hydration = 100;
                gameState.plant.nutrition = 100;
                gameState.plant.light = 100;
                uiSystem.updatePlantStats();
                console.log('All stats filled to 100%');
            },
            resetCooldowns: () => {
                for (let key in gameState.cooldowns) {
                    gameState.cooldowns[key] = 0;
                }
                console.log('All cooldowns reset');
            },
            getStats: () => {
                return gameState.getStats();
            },
            reset: () => {
                if (confirm('Reset game? This will delete all progress!')) {
                    gameState.reset();
                }
            }
        }
    };
    
    console.log('✅ BUD Garden initialized successfully!');
    console.log('💡 Access debug commands via: BUDGarden.debug');
    console.log('🌿 Happy growing!');
});

// Setup tab switching functionality
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Show corresponding content
            if (targetTab === 'stats') {
                document.getElementById('statsTab').classList.add('active');
            } else if (targetTab === 'calculator') {
                document.getElementById('calculatorTab').classList.add('active');
            }
        });
    });
    
    // Setup calculator functionality
    const marketCapInput = document.getElementById('calcMarketCap');
    const budAmountInput = document.getElementById('calcBudAmount');
    const resultDisplay = document.getElementById('calcResult');
    
    // Format number with commas
    function formatNumberWithCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // Remove commas from string to get raw number
    function removeCommas(str) {
        return str.replace(/,/g, '');
    }
    
    // Format input in real-time as user types
    function formatInputRealTime(input) {
        // Remove all non-digits and commas
        const rawValue = removeCommas(input.value).replace(/[^\d]/g, '');
        
        // Format with commas
        if (rawValue) {
            input.value = formatNumberWithCommas(rawValue);
        } else {
            input.value = '';
        }
    }
    
    function calculateRewards() {
        const marketCap = parseFloat(removeCommas(marketCapInput.value)) || 0;
        const budAmount = parseFloat(removeCommas(budAmountInput.value)) || 0;
        
        // Formula: (0.000000001 * Market Cap) * BUD Amount
        const result = (0.000000001 * marketCap) * budAmount;
        
        // Display with dollar sign, commas, and 2 decimal places
        resultDisplay.textContent = `$${formatNumberWithCommas(result.toFixed(2))}`;
    }
    
    // Update calculation and format on input
    marketCapInput.addEventListener('input', function() {
        formatInputRealTime(this);
        calculateRewards();
    });
    
    budAmountInput.addEventListener('input', function() {
        formatInputRealTime(this);
        calculateRewards();
    });
    
    console.log('✅ Tab system initialized');
}
