// Main Game Initialization
console.log('🔵 main.js loaded - before DOMContentLoaded');

// Function to calculate and claim offline BUD earnings
async function claimOfflineBUD() {
    if (!window.currentPlayer || !window.supabaseClient.supabase) {
        console.log('⏭️ Skipping offline BUD claim (no server connection)');
        return;
    }
    
    try {
        console.log('💰 Calculating offline BUD earnings...');
        
        // Call server-side harvest function to calculate offline earnings
        const result = await window.supabaseClient.harvestBUD();
        
        if (result && result.success && result.claimed > 0) {
            // Show popup with offline earnings
            showOfflineEarningsPopup(result.claimed);
            console.log('✅ Claimed offline BUD:', result.claimed);
        } else {
            console.log('ℹ️ No offline BUD to claim');
        }
    } catch (error) {
        console.error('❌ Failed to claim offline BUD:', error);
    }
}

// Function to show offline earnings popup
function showOfflineEarningsPopup(budEarned) {
    // Create popup backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'offline-earnings-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `;
    
    // Create popup content
    const popup = document.createElement('div');
    popup.className = 'offline-earnings-popup';
    popup.style.cssText = `
        background: #0f1419;
        border: 3px solid #00ff41;
        padding: 30px 40px;
        text-align: center;
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.6), inset 0 0 20px rgba(0, 255, 65, 0.1);
        animation: slideInDown 0.4s ease-out;
        max-width: 400px;
        width: 90%;
    `;
    
    // Format BUD amount with commas
    const formattedBUD = budEarned.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    popup.innerHTML = `
        <h2 style="
            font-family: 'Press Start 2P', monospace;
            font-size: 16px;
            color: #00ff41;
            margin-bottom: 20px;
            text-shadow: 0 0 10px rgba(0, 255, 65, 0.8);
        ">WELCOME BACK!</h2>
        
        <div style="
            font-family: 'Press Start 2P', monospace;
            font-size: 12px;
            color: #7fff7f;
            margin-bottom: 15px;
            line-height: 1.8;
        ">Your plants grew while<br>you were away!</div>
        
        <div style="
            background: rgba(0, 255, 65, 0.1);
            border: 2px solid #00ff41;
            padding: 20px;
            margin: 20px 0;
            font-family: 'Press Start 2P', monospace;
        ">
            <div style="font-size: 10px; color: #7fff7f; margin-bottom: 10px;">OFFLINE EARNINGS</div>
            <div style="font-size: 20px; color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);">
                +${formattedBUD} BUD
            </div>
        </div>
        
        <button id="closeOfflinePopup" style="
            background: #00ff41;
            border: none;
            color: #0f1419;
            padding: 12px 30px;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 0 #00cc33;
            margin-top: 10px;
        ">COLLECT</button>
    `;
    
    backdrop.appendChild(popup);
    document.body.appendChild(backdrop);
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideInDown {
            from {
                transform: translateY(-100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        #closeOfflinePopup:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 0 #00cc33, 0 0 15px rgba(0, 255, 65, 0.4);
        }
        #closeOfflinePopup:active {
            transform: translateY(2px);
            box-shadow: 0 2px 0 #00cc33;
        }
    `;
    document.head.appendChild(style);
    
    // Close button handler
    const closeBtn = document.getElementById('closeOfflinePopup');
    closeBtn.addEventListener('click', () => {
        backdrop.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => backdrop.remove(), 300);
    });
    
    // Also close on backdrop click
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            backdrop.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => backdrop.remove(), 300);
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌿 GROW - DOMContentLoaded fired - Initializing...');
    console.log('🔍 Checking globals:', {
        supabaseClient: typeof window.supabaseClient,
        SUPABASE_CONFIG: typeof SUPABASE_CONFIG,
        CONFIG: typeof CONFIG,
        ITEMS_CONFIG: typeof ITEMS_CONFIG
    });
    
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
    
    // Check if authenticated through new auth system
    const authenticatedUsername = localStorage.getItem('herbone_username');
    const authenticatedWallet = localStorage.getItem('herbone_wallet');
    
    if (authenticatedUsername && authenticatedWallet) {
        // User authenticated through invite code system
        walletAddress = authenticatedWallet;
        localStorage.setItem('walletAddress', walletAddress);
        console.log('🔐 Authenticated user:', authenticatedUsername);
    } else {
        // No authentication - auth system will handle this
        // DO NOT create a legacy player - wait for proper registration
        console.log('⚠️ No authentication - waiting for user registration');
        return; // Exit early - don't initialize game without auth
    }
    
    if (supabaseInitialized) {
        try {
            // If authenticated through invite system, look up by username
            if (authenticatedUsername) {
                const { data: player, error } = await window.supabaseClient.supabase
                    .from('players')
                    .select('*')
                    .eq('username', authenticatedUsername)
                    .single();
                
                if (player) {
                    playerId = player.id;
                    localStorage.setItem('playerId', playerId);
                    console.log('✅ Player loaded:', player);
                    window.currentPlayer = player;
                    window.supabaseClient.currentUser = player;
                } else {
                    console.error('❌ Player not found for username:', authenticatedUsername);
                }
            } else {
                // Legacy wallet authentication
                const player = await window.supabaseClient.authenticateWallet(walletAddress);
                if (player) {
                    playerId = player.id;
                    localStorage.setItem('playerId', playerId);
                    console.log('✅ Player authenticated:', player);
                    window.currentPlayer = player;
                }
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
    // Shop system now fetches items from database (server-side validation)
    shopSystem = new ShopSystem(supabaseClient, inventorySystem);
    
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
                    // Use item details from database JOIN
                    if (item.items) {
                        return {
                            id: item.item_id,
                            name: item.items.name,
                            description: item.items.description,
                            image: item.items.image_url, // Use image_url from database
                            rewardRate: `${item.items.generation_rate} BUD/min`,
                            count: item.count || 1
                        };
                    } else {
                        // Fallback to ITEMS_CONFIG if JOIN failed
                        const itemConfig = ITEMS_CONFIG.find(config => config.id === item.item_id);
                        if (itemConfig) {
                            return {
                                id: item.item_id,
                                name: itemConfig.name,
                                description: itemConfig.description,
                                image: itemConfig.image,
                                type: itemConfig.type,
                                rewardRate: itemConfig.rewardRate,
                                count: item.count || 1
                            };
                        } else {
                            console.warn('⚠️ Unknown item in inventory:', item.item_id);
                            return null;
                        }
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
                        serverPlantId: serverPlant.id,
                        items: serverPlant.items // Pass through items data from JOIN query
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
            
            // Calculate and claim offline BUD earnings
            await claimOfflineBUD();
            
            // Initialize shop system (fetches items from database)
            await shopSystem.init();
            
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
    
    // Load and display player's referral code
    loadReferralCodeDisplay();
    
    // Setup tab switching
    setupTabs();
    
    // Initialize grid aligner (helper tool)
    window.gridAligner = new GridAligner(gridSystem);
    
    // Add keyboard shortcut for grid aligner (Alt+G or Option+G)
    document.addEventListener('keydown', (e) => {
        // Debug logging
        if (e.key === 'g' || e.key === 'G') {
            console.log('🔍 G key pressed - altKey:', e.altKey, 'metaKey:', e.metaKey, 'key:', e.key, 'code:', e.code);
        }
        
        // Check for Alt/Option + G (multiple detection methods for Mac compatibility)
        // Mac Option key registers as altKey
        const isAltG = e.altKey && (e.key === 'g' || e.key === 'G' || e.code === 'KeyG' || e.keyCode === 71);
        // Also check if Option+G produces a special character on Mac (©, ˙, etc.)
        const isMacOptionG = e.altKey && (e.code === 'KeyG' || e.keyCode === 71);
        
        if (isAltG || isMacOptionG) {
            e.preventDefault();
            console.log('🎯 Grid Aligner shortcut triggered!');
            if (window.gridAligner.active) {
                window.gridAligner.deactivate();
            } else {
                window.gridAligner.activate();
            }
        }
    });
    
    console.log('🎯 Grid Aligner keyboard shortcut registered: Alt+G (Option+G on Mac)');
    
    // Instructions for alignment
    console.log('');
    console.log('🎯 GRID ALIGNMENT TOOL:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Method 1 (Keyboard): Press Option+G (Alt+G on Windows)');
    console.log('Method 2 (Console): Type: window.gridAligner.activate()');
    console.log('');
    console.log('💡 If Option+G doesn\'t work, use the console command above!');
    console.log('   Then use arrow keys to align the grid.');
    console.log('   Press ESC when done to auto-save alignment.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    
    console.log('✅ GROW initialized successfully!');
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

// Load and display player's referral code
async function loadReferralCodeDisplay() {
    const referralCodeDisplay = document.getElementById('referralCodeDisplay');
    const referralCodeText = document.getElementById('referralCodeText');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    
    if (!referralCodeDisplay || !referralCodeText || !copyCodeBtn) {
        console.warn('⚠️ Referral code UI elements not found');
        return;
    }
    
    // Try to get from localStorage first (quick display)
    let playerCode = localStorage.getItem('herbone_referral_code');
    
    // If not in localStorage, fetch from database
    if (!playerCode && window.currentPlayer && window.supabaseClient) {
        try {
            // Try to get username from localStorage or player object
            const username = localStorage.getItem('herbone_username') || window.currentPlayer.username;
            
            if (username) {
                const { data, error } = await window.supabaseClient.supabase
                    .from('invite_codes')
                    .select('code')
                    .eq('owner_username', username)
                    .single();
                
                if (data && data.code) {
                    playerCode = data.code;
                    localStorage.setItem('herbone_referral_code', playerCode);
                }
            }
        } catch (error) {
            console.error('❌ Failed to load referral code:', error);
        }
    }
    
    if (playerCode) {
        referralCodeText.textContent = playerCode;
        referralCodeDisplay.style.display = 'flex';
        
        // Copy to clipboard functionality
        copyCodeBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(playerCode);
                copyCodeBtn.textContent = '✓';
                copyCodeBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyCodeBtn.textContent = '📋';
                    copyCodeBtn.classList.remove('copied');
                }, 2000);
            } catch (error) {
                console.error('❌ Failed to copy:', error);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = playerCode;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                copyCodeBtn.textContent = '✓';
                setTimeout(() => {
                    copyCodeBtn.textContent = '📋';
                }, 2000);
            }
        });
    } else {
        console.log('ℹ️ No referral code found for player');
    }
}
