// Shop System - Fetch items from database and handle purchases
class ShopSystem {
    constructor(supabaseClient, inventorySystem) {
        this.supabaseClient = supabaseClient;
        this.inventorySystem = inventorySystem;
        this.shopContainer = null;
        this.items = []; // Fetched from database
        this.purchaseModal = null;
        this.currentItem = null;
    }
    
    // Initialize shop system
    async init() {
        this.shopContainer = document.getElementById('shopItems');
        
        if (!this.shopContainer) {
            console.error('❌ Shop container not found');
            return;
        }
        
        // Fetch items from database (server-side validation)
        await this.fetchItemsFromDatabase();
        
        // Render shop items
        this.renderShopItems();
        
        // Create purchase modal
        this.createPurchaseModal();
        
        console.log('✅ Shop System initialized with', this.items.length, 'items');
    }
    
    // Fetch shop items from Supabase database (NOT from client-side config)
    async fetchItemsFromDatabase() {
        try {
            const { data, error } = await this.supabaseClient.supabase
                .from('items')
                .select('*')
                .neq('id', 'joint') // Exclude joint (it's free/given automatically)
                .order('sort_order', { ascending: true });
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                this.items = data;
                console.log('✅ Fetched', data.length, 'items from database');
            } else {
                console.log('⚠️ No items found in database, falling back to ITEMS_CONFIG');
            // Fallback to ITEMS_CONFIG if database is empty
            this.items = Object.values(ITEMS_CONFIG).map(item => ({
                ...item,
                sort_order: item.sort_order || 999,
                generation_rate: this.getRewardRateFromConfig(item.id),
                price: this.getPriceFromConfig(item.id)
            }));
            }
        } catch (error) {
            console.error('❌ Failed to fetch items from database:', error);
            // Fallback to client-side config
            this.items = ITEMS_CONFIG.map(item => ({
                id: item.id,
                name: item.name,
                description: item.description,
                image: item.image,
                price: this.getPriceFromConfig(item.id),
                generation_rate: this.getRewardRateFromConfig(item.id),
                max_purchases: 999
            }));
        }
    }
    
    // Helper to get price from ITEMS_CONFIG (fallback only)
    getPriceFromConfig(itemId) {
        const prices = {
            'radio': 0,
            'mini-mary': 0,
            'puff-daddy': 0,
            'sprout': 5760000
        };
        return prices[itemId] || 1000;
    }
    
    // Helper to get reward rate from ITEMS_CONFIG (fallback only)
    getRewardRateFromConfig(itemId) {
        const rates = {
            'radio': 0,
            'mini-mary': 5000,
            'puff-daddy': 10000,
            'sprout': 1000
        };
        return rates[itemId] || 0;
    }
    
    // Render shop items using data from database
    async renderShopItems() {
        this.shopContainer.innerHTML = '';
        
        // Get player's purchase counts from database
        const purchaseCounts = await this.getPlayerPurchaseCounts();
        
        this.items.forEach(item => {
            const shopItem = this.createShopItemElement(item, purchaseCounts);
            this.shopContainer.appendChild(shopItem);
        });
        
        console.log('✅ Rendered', this.items.length, 'shop items');
    }
    
    // Get player's purchase counts from database
    async getPlayerPurchaseCounts() {
        if (!this.supabaseClient.currentUser) return {};
        
        try {
            // Get counts from player_inventory (items not yet placed)
            const { data: inventoryData, error: invError } = await this.supabaseClient.supabase
                .from('player_inventory')
                .select('item_id, count')
                .eq('player_id', this.supabaseClient.currentUser.id);
            
            if (invError) throw invError;
            
            // Get counts from placed_plants (items already placed on grid)
            const { data: placedData, error: placedError } = await this.supabaseClient.supabase
                .from('placed_plants')
                .select('item_id')
                .eq('player_id', this.supabaseClient.currentUser.id);
            
            if (placedError) throw placedError;
            
            // Combine both: inventory count + placed count = total purchased
            const counts = {};
            
            // Add inventory counts
            if (inventoryData) {
                inventoryData.forEach(item => {
                    counts[item.item_id] = (counts[item.item_id] || 0) + (item.count || 0);
                });
            }
            
            // Add placed plant counts
            if (placedData) {
                placedData.forEach(plant => {
                    counts[plant.item_id] = (counts[plant.item_id] || 0) + 1;
                });
            }
            
            console.log('📊 Player purchase counts (inventory + placed):', counts);
            return counts;
        } catch (error) {
            console.error('❌ Failed to fetch purchase counts:', error);
            return {};
        }
    }
    
    // Create shop item element
    createShopItemElement(item, purchaseCounts) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        itemDiv.dataset.itemId = item.id;
        
        // Check if player has reached max purchases (from database)
        const purchaseCount = purchaseCounts[item.id] || 0;
        const isSoldOut = item.max_purchases !== null && purchaseCount >= item.max_purchases;
        
        console.log(`🛒 Item: ${item.name}, Purchased: ${purchaseCount}, Max: ${item.max_purchases}, Sold Out: ${isSoldOut}`);
        
        if (isSoldOut) {
            itemDiv.classList.add('sold-out');
        }
        
        // Item image
        const img = document.createElement('img');
        img.src = item.image_url || item.image || 'assets/sprites/placeholder.png';
        img.alt = item.name;
        img.className = 'shop-item-image';
        img.onerror = function() {
            this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%231a1f28'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2300ff41' font-size='8'%3EITEM%3C/text%3E%3C/svg%3E";
        };
        
        // Item info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'shop-item-info';
        
        const name = document.createElement('div');
        name.className = 'shop-item-name';
        name.textContent = item.name;
        
        const rate = document.createElement('div');
        rate.className = 'shop-item-rate';
        rate.textContent = `${this.formatNumber(item.generation_rate)} BUD/min`;
        
        const price = document.createElement('div');
        price.className = 'shop-item-price';
        // Show "FREE" for items with 0 price
        price.textContent = item.price === 0 ? 'FREE' : `${this.formatNumber(item.price)} BUD`;
        
        infoDiv.appendChild(name);
        infoDiv.appendChild(rate);
        infoDiv.appendChild(price);
        
        // Buy button
        const buyBtn = document.createElement('button');
        buyBtn.className = 'shop-buy-btn';
        
        if (isSoldOut) {
            buyBtn.textContent = 'SOLD OUT';
            buyBtn.classList.add('disabled');
            buyBtn.disabled = true;
        } else {
            // Show "GET FREE" for free items, "BUY" for paid items
            buyBtn.textContent = item.price === 0 ? 'GET FREE' : 'BUY';
            buyBtn.onclick = () => this.openPurchaseModal(item);
        }
        
        itemDiv.appendChild(img);
        itemDiv.appendChild(infoDiv);
        itemDiv.appendChild(buyBtn);
        
        return itemDiv;
    }
    
    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Create purchase confirmation modal
    createPurchaseModal() {
        // Check if modal already exists (prevent duplicates)
        const existing = document.getElementById('purchaseModalBackdrop');
        if (existing) {
            existing.remove();
        }
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'purchaseModalBackdrop';
        overlay.className = 'purchase-modal-overlay';
        overlay.style.display = 'none';
        overlay.onclick = () => this.closePurchaseModal();
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'purchaseModal';
        modal.className = 'purchase-modal';
        modal.innerHTML = `
            <h2>Confirm Purchase</h2>
            <div class="purchase-modal-content">
                <div class="item-preview">
                    <img id="purchaseItemImage" src="" alt="">
                </div>
                <div class="item-details">
                    <h3 id="purchaseItemName"></h3>
                    <p class="item-description" id="purchaseItemDescription"></p>
                    <p class="item-price">💰 <span id="purchaseItemPrice"></span> BUD</p>
                    <p class="current-balance">Your Balance: <span id="purchaseCurrentBalance"></span> BUD</p>
                </div>
            </div>
            <div class="modal-buttons">
                <button class="cancel-btn" id="cancelPurchaseBtn">CANCEL</button>
                <button class="confirm-btn" id="confirmPurchaseBtn">CONFIRM PURCHASE</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        this.purchaseModal = overlay;
        
        // Setup button handlers
        document.getElementById('confirmPurchaseBtn').onclick = () => this.confirmPurchase();
        document.getElementById('cancelPurchaseBtn').onclick = () => this.closePurchaseModal();
        
        // Prevent overlay click from closing when clicking modal
        modal.onclick = (e) => e.stopPropagation();
    }
    
    // Open purchase modal
    async openPurchaseModal(item) {
        this.currentItem = item;
        
        console.log('🖼️ Opening modal for item:', {
            id: item.id,
            name: item.name,
            image: item.image,
            imagePath: item.image
        });
        
        // Get current player balance
        const budData = await this.supabaseClient.getPlayerBUD();
        const balance = budData.displayBUD || budData.totalBUD || 0;
        
        console.log('💰 Balance check:', {
            budData,
            balance,
            itemPrice: item.price,
            canAfford: balance >= item.price
        });
        
        // Populate modal
        const imageElement = document.getElementById('purchaseItemImage');
        console.log('🔍 Image element found:', imageElement);
        console.log('🔍 Image element parent:', imageElement?.parentElement);
        console.log('🔍 Current src before setting:', imageElement?.src);
        
        imageElement.src = item.image_url || item.image || 'assets/sprites/placeholder.png';
        
        console.log('🔍 Current src after setting:', imageElement.src);
        console.log('🔍 Item image_url value:', item.image_url);
        console.log('🔍 Item image value:', item.image);
        
        imageElement.onerror = () => {
            console.error('❌ Failed to load image:', item.image_url || item.image);
            console.log('🔍 Trying to load from:', window.location.origin + '/' + (item.image_url || item.image));
        };
        imageElement.onload = () => {
            console.log('✅ Image loaded successfully:', item.image_url || item.image);
            console.log('🔍 Final src value:', imageElement.src);
        };
        console.log('🖼️ Set image src to:', item.image_url || item.image);
        console.log('🖼️ Image element:', imageElement);
        
        document.getElementById('purchaseItemName').textContent = item.name;
        document.getElementById('purchaseItemDescription').textContent = item.description;
        document.getElementById('purchaseItemPrice').textContent = this.formatNumber(item.price);
        document.getElementById('purchaseCurrentBalance').textContent = this.formatNumber(balance);
        
        // Reset and configure confirm button
        const confirmBtn = document.getElementById('confirmPurchaseBtn');
        
        // Reset button text (in case it was left as "BUYING..." from previous purchase)
        if (item.price === 0) {
            confirmBtn.textContent = 'GET FREE';
        } else {
            confirmBtn.textContent = 'CONFIRM PURCHASE';
        }
        
        // Disable confirm button if insufficient balance
        if (balance < item.price) {
            console.log('❌ Insufficient balance - disabling button');
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
        } else {
            console.log('✅ Sufficient balance - enabling button');
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.cursor = 'pointer';
        }
        
        // Show modal (overlay uses flexbox display from CSS)
        this.purchaseModal.style.display = 'flex';
    }
    
    // Close purchase modal
    closePurchaseModal() {
        this.purchaseModal.style.display = 'none';
        this.currentItem = null;
    }
    
    // Confirm purchase (NO PRICE PARAMETER - server validates)
    async confirmPurchase() {
        if (!this.currentItem) return;
        
        const confirmBtn = document.getElementById('confirmPurchaseBtn');
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = 'BUYING...';
        confirmBtn.disabled = true;
        
        // Call server-side purchase (ONLY send item ID, not price)
        const result = await this.supabaseClient.purchaseItem(this.currentItem.id);
        
        if (result && result.success) {
            // Success!
            console.log('✅ Purchase successful:', result);
            
            // Update inventory
            if (this.inventorySystem) {
                // Add item to inventory or increment count
                const existingItem = this.inventorySystem.items.find(i => i.id === this.currentItem.id);
                if (existingItem) {
                    existingItem.count = result.new_count || (existingItem.count + 1);
                } else {
                    // Add new item to inventory
                    this.inventorySystem.items.push({
                        id: this.currentItem.id,
                        name: this.currentItem.name,
                        image: this.currentItem.image_url || this.currentItem.image, // Use image_url from database
                        rewardRate: `${this.currentItem.generation_rate} BUD/min`,
                        count: result.new_count || 1
                    });
                }
                
                // Re-render inventory
                this.inventorySystem.renderInventory();
            }
            
            // Show success message
            this.showPurchaseSuccess(this.currentItem.name);
            
            // Close modal
            this.closePurchaseModal();
            
            // Refresh shop to update SOLD OUT status
            await this.fetchItemsFromDatabase();
            this.renderShopItems();
            
            // Update BUD display (main.js will handle via syncBUDWithServer)
            
        } else {
            // Error
            console.error('❌ Purchase failed:', result.message);
            alert(`Purchase failed: ${result.message}`);
            confirmBtn.textContent = originalText;
            confirmBtn.disabled = false;
        }
    }
    
    // Show purchase success message
    showPurchaseSuccess(itemName) {
        const successDiv = document.createElement('div');
        successDiv.className = 'purchase-success';
        successDiv.textContent = `✅ ${itemName} purchased!`;
        successDiv.style.position = 'fixed';
        successDiv.style.top = '50%';
        successDiv.style.left = '50%';
        successDiv.style.transform = 'translate(-50%, -50%)';
        successDiv.style.background = '#0f1419';
        successDiv.style.border = '2px solid #00ff41';
        successDiv.style.padding = '20px 40px';
        successDiv.style.color = '#00ff41';
        successDiv.style.fontFamily = "'Press Start 2P', monospace";
        successDiv.style.fontSize = '12px';
        successDiv.style.zIndex = '10000';
        successDiv.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.5)';
        
        document.body.appendChild(successDiv);
        
        // Remove after 2 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 2000);
    }
}

// Initialize shop system after other systems are ready
// This will be called from main.js
console.log('📦 Shop System class loaded');
