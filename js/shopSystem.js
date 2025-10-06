// Shop System - Handles purchasing items with BUD
class ShopSystem {
    constructor(inventorySystem, gameState) {
        this.inventorySystem = inventorySystem;
        this.gameState = gameState;
        this.shopItemsContainer = null;
        
        // Shop items with prices
        this.shopItems = [
            {
                id: 'radio',
                name: 'Radio',
                description: 'A classic radio to keep you company while you grow.',
                image: 'assets/sprites/radio.png',
                price: 0, // FREE!
                rewardRate: '0 BUD/min',
                maxPurchases: 1 // Can only buy once
            },
            {
                id: 'sprout',
                name: 'Sprout',
                description: 'The potential to grow into something bigger..',
                image: 'assets/sprout.png',
                price: 5760000, // 5.76 million BUD
                rewardRate: '1000 BUD/min'
            },
            {
                id: 'mini-mary',
                name: 'Mini-Mary',
                description: 'Now this has some pot-ential..',
                image: 'assets/sprites/mini-mary.png',
                price: 0, // TEMPORARILY FREE FOR TESTING (was 28.8 million BUD)
                rewardRate: '5000 BUD/min'
            },
            {
                id: 'puff-daddy',
                name: 'Puff Daddy',
                description: 'This is one puffy mfer..',
                image: 'assets/sprites/puff-daddy.png',
                price: 0, // TEMPORARILY FREE FOR TESTING (was 57.6 million BUD)
                rewardRate: '10000 BUD/min'
            }
            // Add more shop items here in the future
        ];
    }
    
    // Initialize shop system
    init() {
        this.shopItemsContainer = document.getElementById('shopItems');
        
        if (!this.shopItemsContainer) {
            console.error('❌ Shop items container not found');
            return;
        }
        
        this.renderShop();
        console.log('✅ Shop System initialized');
    }
    
    // Render shop items
    async renderShop() {
        this.shopItemsContainer.innerHTML = '';
        
        for (const item of this.shopItems) {
            // Check if item has been purchased (for maxPurchases limit)
            const alreadyPurchased = item.maxPurchases && await this.hasReachedPurchaseLimit(item);
            
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            if (alreadyPurchased) {
                shopItem.classList.add('sold-out');
            }
            
            const itemImage = document.createElement('img');
            itemImage.src = item.image;
            itemImage.alt = item.name;
            itemImage.className = 'shop-item-image';
            itemImage.onerror = function() {
                this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%231a1f28'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2300ff41' font-size='10'%3EITEM%3C/text%3E%3C/svg%3E";
            };
            
            const itemInfo = document.createElement('div');
            itemInfo.className = 'shop-item-info';
            
            const itemName = document.createElement('div');
            itemName.className = 'shop-item-name';
            itemName.textContent = item.name;
            
            const itemRate = document.createElement('div');
            itemRate.className = 'shop-item-rate';
            itemRate.textContent = item.rewardRate;
            
            const itemPrice = document.createElement('div');
            itemPrice.className = 'shop-item-price';
            itemPrice.textContent = this.formatPrice(item.price);
            
            const buyButton = document.createElement('button');
            buyButton.className = 'shop-buy-btn';
            
            if (alreadyPurchased) {
                buyButton.textContent = 'SOLD OUT';
                buyButton.disabled = true;
                buyButton.classList.add('disabled');
            } else {
                buyButton.textContent = item.price === 0 ? 'GET FREE' : 'BUY';
                buyButton.addEventListener('click', () => this.purchaseItem(item));
            }
            
            itemInfo.appendChild(itemName);
            itemInfo.appendChild(itemRate);
            itemInfo.appendChild(itemPrice);
            
            shopItem.appendChild(itemImage);
            shopItem.appendChild(itemInfo);
            shopItem.appendChild(buyButton);
            
            this.shopItemsContainer.appendChild(shopItem);
        }
    }
    
    // Check if player has reached purchase limit for an item
    async hasReachedPurchaseLimit(item) {
        if (!item.maxPurchases) return false;
        
        let totalPurchased = 0;
        
        // Check server inventory if Supabase is available
        if (window.supabaseClient && window.supabaseClient.supabase && window.currentPlayer) {
            try {
                // Get inventory count from server
                const { data: inventoryData, error: invError } = await window.supabaseClient.supabase
                    .from('inventory')
                    .select('*')
                    .eq('player_id', window.currentPlayer.id)
                    .eq('item_id', item.id)
                    .maybeSingle();
                
                const inventoryCount = inventoryData ? (inventoryData.count || 0) : 0;
                
                // Get placed items count from server
                const { data: placedData, error: placedError } = await window.supabaseClient.supabase
                    .from('placed_plants')
                    .select('id')
                    .eq('player_id', window.currentPlayer.id)
                    .eq('item_id', item.id);
                
                const placedCount = placedData ? placedData.length : 0;
                
                totalPurchased = inventoryCount + placedCount;
                
                console.log(`📊 ${item.name} purchase check:`, {
                    inventoryCount,
                    placedCount,
                    totalPurchased,
                    maxPurchases: item.maxPurchases
                });
            } catch (error) {
                console.error('❌ Error checking purchase limit:', error);
                // Fall back to local check
                const inventoryItem = this.inventorySystem.items.find(i => i.id === item.id);
                const currentCount = inventoryItem ? inventoryItem.count : 0;
                const placedCount = window.plantPlacement ? 
                    window.plantPlacement.plants.filter(p => p.itemId === item.id).length : 0;
                totalPurchased = currentCount + placedCount;
            }
        } else {
            // Fallback to local inventory check
            const inventoryItem = this.inventorySystem.items.find(i => i.id === item.id);
            const currentCount = inventoryItem ? inventoryItem.count : 0;
            const placedCount = window.plantPlacement ? 
                window.plantPlacement.plants.filter(p => p.itemId === item.id).length : 0;
            totalPurchased = currentCount + placedCount;
        }
        
        return totalPurchased >= item.maxPurchases;
    }
    
    // Format price for display
    formatPrice(price) {
        if (price === 0) {
            return 'FREE';
        }
        if (price >= 1000000) {
            return (price / 1000000).toFixed(2) + 'M BUD';
        } else if (price >= 1000) {
            return (price / 1000).toFixed(1) + 'K BUD';
        }
        return price + ' BUD';
    }
    
        // Show purchase confirmation modal
    async showPurchaseConfirmation(shopItem) {
        return new Promise(async (resolve) => {
            // Fetch current balance from server
            let currentBalance = 0;
            if (window.supabaseClient && window.supabaseClient.supabase && window.currentPlayer) {
                try {
                    const budData = await window.supabaseClient.getPlayerBUD();
                    // Total balance is totalBUD + accumulatedBUD
                    currentBalance = (budData.totalBUD || 0) + (budData.accumulatedBUD || 0);
                    console.log('💰 Balance check:', {
                        totalBUD: budData.totalBUD,
                        accumulatedBUD: budData.accumulatedBUD,
                        combined: currentBalance
                    });
                } catch (error) {
                    console.error('❌ Failed to fetch balance from server:', error);
                    currentBalance = 0;
                }
            }
            
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'purchase-modal-overlay';
            overlay.innerHTML = `
                <div class="purchase-modal">
                    <h2>Confirm Purchase</h2>
                    <div class="purchase-modal-content">
                        <div class="item-preview">
                            <img src="${shopItem.image}" alt="${shopItem.name}">
                        </div>
                        <div class="item-details">
                            <h3>${shopItem.name}</h3>
                            <p class="item-description">${shopItem.description}</p>
                            <p class="item-price">💰 ${shopItem.price.toLocaleString()} BUD</p>
                            <p class="current-balance">Your Balance: ${currentBalance.toLocaleString()} BUD</p>
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button class="cancel-btn">Cancel</button>
                        <button class="confirm-btn">Confirm Purchase</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Handle cancel
            overlay.querySelector('.cancel-btn').addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(false);
            });
            
            // Handle confirm
            overlay.querySelector('.confirm-btn').addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(true);
            });
            
            // Handle click outside modal
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            });
        });
    }
    
    // Show error modal with game styling
    showErrorModal(title, message) {
        return new Promise((resolve) => {
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'purchase-modal-overlay';
            overlay.innerHTML = `
                <div class="purchase-modal error-modal">
                    <h2 style="color: #ff4444; text-shadow: 0 0 10px rgba(255, 68, 68, 0.8);">❌ ${title}</h2>
                    <div class="error-modal-content">
                        <p style="color: #ff9999; font-size: 10px; line-height: 1.8; text-align: center; padding: 20px;">
                            ${message}
                        </p>
                    </div>
                    <div class="modal-buttons" style="justify-content: center;">
                        <button class="confirm-btn" style="background: #2a2f38; color: #ff4444; border-color: #ff4444;">OK</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Handle OK button
            overlay.querySelector('.confirm-btn').addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve();
            });
            
            // Handle click outside modal
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve();
                }
            });
        });
    }
    
    // Purchase an item
    async purchaseItem(shopItem) {
        // Check if item has purchase limit
        // Check if purchase limit reached (for items with maxPurchases)
        if (shopItem.maxPurchases && await this.hasReachedPurchaseLimit(shopItem)) {
            if (window.soundEffects) {
                window.soundEffects.playError();
            }
            await this.showErrorModal(
                'Already Purchased',
                `You've already purchased ${shopItem.name}!<br><br>This item can only be purchased ${shopItem.maxPurchases} time(s).`
            );
            console.log(`❌ Purchase blocked: ${shopItem.name} purchase limit reached`);
            return;
        }
        
        // Show confirmation modal
        const confirmed = await this.showPurchaseConfirmation(shopItem);
        if (!confirmed) {
            console.log('❌ Purchase cancelled by user');
            return;
        }
        
        // Try server-side purchase first if Supabase is available
        if (window.supabaseClient && window.supabaseClient.supabase && window.currentPlayer) {
            try {
                const result = await window.supabaseClient.purchaseItem(
                    shopItem.id,
                    shopItem.price
                );
                
                if (result && result.success) {
                    // Purchase successful on server
                    console.log('✅ Server-validated purchase:', shopItem.name);
                    
                    // Play ka-ching sound
                    if (window.soundEffects) {
                        window.soundEffects.playKaChing();
                    }
                    
                    // Reload inventory from server to ensure consistency
                    const serverInventory = await window.supabaseClient.getInventory();
                    
                    if (serverInventory && serverInventory.length > 0) {
                        // Map server inventory to client format
                        this.inventorySystem.items = serverInventory.map(item => {
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
                        }).filter(item => item !== null);
                        
                        console.log('✅ Reloaded inventory from server:', this.inventorySystem.items.length, 'items');
                    }
                    
                    // Sync BUD from server
                    if (window.plantPlacement) {
                        await window.plantPlacement.syncBUDWithServer();
                    }
                    
                    // Update displays
                    this.inventorySystem.renderInventory();
                    this.renderShop(); // Re-render shop to update button states
                    if (window.uiSystem) {
                        window.uiSystem.updateBUDCounter();
                    }
                    
                    this.showPurchaseSuccess(shopItem);
                    return;
                } else {
                    // Server rejected purchase
                    if (window.soundEffects) {
                        window.soundEffects.playError();
                    }
                    await this.showErrorModal(
                        'Purchase Failed',
                        result.message || 'Insufficient BUD'
                    );
                    console.log('❌ Server rejected purchase:', result.message);
                    return;
                }
            } catch (error) {
                console.error('❌ Server purchase error:', error);
                // Fall through to local purchase as fallback
            }
        }
        
        // Fallback to local purchase (for offline mode)
        const playerBUD = this.gameState.player.accumulatedBUD + this.gameState.player.totalBUD;
        
        // Check if player has enough BUD
        if (playerBUD < shopItem.price) {
            const needed = shopItem.price - playerBUD;
            if (window.soundEffects) {
                window.soundEffects.playError();
            }
            await this.showErrorModal(
                'Not Enough BUD!',
                `You need ${this.formatPrice(needed)} more BUD to purchase ${shopItem.name}.`
            );
            console.log(`❌ Purchase failed: Need ${this.formatPrice(needed)} more BUD`);
            return;
        }
        
        // Deduct BUD (prioritize accumulated first, then total)
        let remaining = shopItem.price;
        
        if (this.gameState.player.accumulatedBUD >= remaining) {
            this.gameState.player.accumulatedBUD -= remaining;
        } else {
            remaining -= this.gameState.player.accumulatedBUD;
            this.gameState.player.accumulatedBUD = 0;
            this.gameState.player.totalBUD -= remaining;
        }
        
        // Add item to inventory
        const inventoryItem = this.inventorySystem.items.find(i => i.id === shopItem.id);
        
        // Play ka-ching sound for local purchase
        if (window.soundEffects) {
            window.soundEffects.playKaChing();
        }
        
        if (inventoryItem) {
            // Item exists, increase count
            inventoryItem.count++;
            console.log(`✅ Purchased ${shopItem.name}! New count: ${inventoryItem.count}`);
        } else {
            // Item doesn't exist, add it
            this.inventorySystem.items.push({
                id: shopItem.id,
                name: shopItem.name,
                description: shopItem.description,
                image: shopItem.image,
                type: 'placeable',
                rewardRate: shopItem.rewardRate,
                count: 1
            });
            console.log(`✅ Purchased ${shopItem.name}! Added to inventory.`);
        }
        
        // Update displays
        this.inventorySystem.renderInventory();
        this.renderShop(); // Re-render shop to update button states
        
        if (window.uiSystem) {
            window.uiSystem.updateBUDCounter();
        }
        
        // Show success message
        this.showPurchaseSuccess(shopItem);
    }
    
    // Show purchase success message
    showPurchaseSuccess(item) {
        const message = document.createElement('div');
        message.className = 'purchase-success';
        message.textContent = `✅ Purchased ${item.name}!`;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('fade-out');
            setTimeout(() => message.remove(), 500);
        }, 2000);
    }
}
