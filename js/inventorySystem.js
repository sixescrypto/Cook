// Inventory System - Manages inventory items and equip/unequip functionality
class InventorySystem {
    constructor(plantPlacement) {
        this.plantPlacement = plantPlacement;
        this.inventoryGrid = null;
        this.equipPanel = null;
        this.equipBtn = null;
        this.selectedItem = null;
        this.equippedItem = null;
        this.placementMode = false; // Track if placement mode is active
        
        // Inventory items - will be initialized in init() or loaded from save
        // Items are loaded from itemsConfig.js
        // To add new items, edit js/itemsConfig.js
        this.items = []; // Empty initially, will be populated in init() or from save
    }
    
    // Initialize inventory system
    init() {
        this.inventoryGrid = document.getElementById('inventoryGrid');
        this.equipPanel = document.getElementById('equipPanel');
        this.equipBtn = document.getElementById('equipBtn');
        
        if (!this.inventoryGrid || !this.equipPanel || !this.equipBtn) {
            console.error('❌ Inventory elements not found');
            return;
        }
        
        // Inventory items should ONLY be set from server data in main.js
        // This init() just renders whatever was already loaded from server
        if (this.items.length === 0) {
            console.log('🎒 Starting with empty inventory (waiting for server data)');
        } else {
            console.log('🎒 Rendering inventory loaded from server:', this.items.length, 'items');
        }
        
        console.log('📦 Items:', this.items);
        
        // Add initial items to the grid
        this.renderInventory();
        
        this.setupEquipButton();
        this.setupCloseButton();
        
        console.log('✅ Inventory System initialized');
        console.log('📦 Inventory grid children:', this.inventoryGrid.children.length);
    }
    
    // Render entire inventory (replaces items, keeps empty slots)
    renderInventory() {
        console.log('🔄 Rendering inventory...');
        
        // Clear all item elements (keep empty slots)
        const items = this.inventoryGrid.querySelectorAll('.inventory-item');
        console.log('🗑️ Removing', items.length, 'existing items');
        items.forEach(item => item.remove());
        
        // Add items that have count > 0
        this.items.forEach(item => {
            console.log('📦 Checking item:', item.id, 'count:', item.count);
            if (item.count > 0) {
                console.log('✅ Adding item to DOM:', item.id);
                this.addItemToDOM(item);
            }
        });
        
        console.log('✅ Inventory rendered. Grid now has', this.inventoryGrid.children.length, 'children');
    }
    
    // Add item to DOM
    addItemToDOM(item) {
        // Create inventory item element
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.dataset.itemId = item.id;
        
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.className = 'inventory-item-image';
        img.onerror = function() {
            this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%231a1f28'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2300ff41' font-size='10'%3EPLANT%3C/text%3E%3C/svg%3E";
        };
        
        const name = document.createElement('div');
        name.className = 'inventory-item-name';
        name.textContent = item.name;
        
        // Add reward rate
        const rewardRate = document.createElement('div');
        rewardRate.className = 'inventory-item-reward';
        rewardRate.textContent = item.rewardRate || '';
        
        // Add count badge
        const countBadge = document.createElement('div');
        countBadge.className = 'item-count';
        countBadge.textContent = item.count;
        
        itemElement.appendChild(img);
        itemElement.appendChild(name);
        itemElement.appendChild(rewardRate);
        itemElement.appendChild(countBadge);
        
        // Add click handler
        itemElement.addEventListener('click', () => {
            this.selectItem(item.id, itemElement);
        });
        
        // Insert at the beginning (left side) instead of appending (right side)
        const firstEmptySlot = this.inventoryGrid.querySelector('.inventory-slot.empty');
        if (firstEmptySlot) {
            // Replace first empty slot
            this.inventoryGrid.insertBefore(itemElement, firstEmptySlot);
            firstEmptySlot.remove();
        } else {
            // No empty slots, just add to grid
            this.inventoryGrid.appendChild(itemElement);
        }
    }
    
    // Update inventory display with counts
    updateInventoryDisplay() {
        // If count is 0, re-render entire inventory
        const hasEmptyItems = this.items.some(item => item.count <= 0);
        if (hasEmptyItems) {
            this.renderInventory();
            return;
        }
        
        // Otherwise just update count badges
        const inventoryItems = this.inventoryGrid.querySelectorAll('.inventory-item');
        
        inventoryItems.forEach(itemElement => {
            const itemId = itemElement.dataset.itemId;
            const item = this.items.find(i => i.id === itemId);
            
            if (item && item.count > 0) {
                // Update count badge
                const countBadge = itemElement.querySelector('.item-count');
                if (countBadge) {
                    countBadge.textContent = item.count;
                }
            }
        });
    }
    
    // Setup inventory items (now just for existing items in DOM)
    setupInventoryItems() {
        const inventoryItems = this.inventoryGrid.querySelectorAll('.inventory-item');
        
        inventoryItems.forEach(itemElement => {
            itemElement.addEventListener('click', () => {
                const itemId = itemElement.dataset.itemId;
                this.selectItem(itemId, itemElement);
            });
        });
    }
    
    // Select an inventory item
    selectItem(itemId, itemElement) {
        const item = this.items.find(i => i.id === itemId);
        
        if (!item) {
            console.warn(`Item ${itemId} not found`);
            return;
        }
        
        // Deselect previous item
        if (this.selectedItem) {
            const prevElement = this.inventoryGrid.querySelector('.inventory-item.selected');
            if (prevElement) {
                prevElement.classList.remove('selected');
            }
        }
        
        // Select new item
        this.selectedItem = item;
        itemElement.classList.add('selected');
        
        // Show equip panel
        this.showEquipPanel(item);
        
        console.log(`Selected: ${item.name}`);
    }
    
    // Show equip panel with item details
    showEquipPanel(item) {
        const equipItemPreview = document.getElementById('equipItemPreview');
        const equipItemName = document.getElementById('equipItemName');
        
        equipItemPreview.src = item.image;
        equipItemPreview.alt = item.name;
        equipItemName.textContent = item.name;
        
        // Update button text based on equip status
        if (this.equippedItem && this.equippedItem.id === item.id) {
            this.equipBtn.textContent = 'UNEQUIP';
            this.equipBtn.classList.add('equipped');
        } else {
            this.equipBtn.textContent = 'EQUIP';
            this.equipBtn.classList.remove('equipped');
        }
        
        // Show panel
        this.equipPanel.style.display = 'block';
    }
    
    // Setup equip button
    setupEquipButton() {
        this.equipBtn.addEventListener('click', () => {
            if (!this.selectedItem) return;
            
            // Toggle equip/unequip
            if (this.equippedItem && this.equippedItem.id === this.selectedItem.id) {
                this.unequipItem();
            } else {
                this.equipItem(this.selectedItem);
            }
        });
    }
    
    // Equip an item
    equipItem(item) {
        this.equippedItem = item;
        this.placementMode = true;
        
        // Update button
        this.equipBtn.textContent = 'UNEQUIP';
        this.equipBtn.classList.add('equipped');
        
        // Update plant placement system with new image and item ID
        this.plantPlacement.plantImage = item.image;
        this.plantPlacement.enablePlacement(item.id);
        
        console.log(`✅ Equipped: ${item.name} (${item.count} remaining) - Placement mode ACTIVE`);
    }
    
    // Consume one item (called when placing)
    consumeItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        
        if (!item) {
            console.warn(`Item ${itemId} not found`);
            return false;
        }
        
        if (item.count <= 0) {
            console.warn(`No ${item.name} remaining`);
            return false;
        }
        
        // Decrease count
        item.count--;
        console.log(`📦 Used 1x ${item.name} (${item.count} remaining)`);
        
        // Sync with server
        if (window.supabaseClient && window.supabaseClient.supabase) {
            window.supabaseClient.updateInventoryCount(itemId, item.count)
                .then(success => {
                    if (success) {
                        console.log('✅ Inventory count synced to server');
                    } else {
                        console.warn('⚠️ Failed to sync inventory count to server');
                    }
                })
                .catch(error => {
                    console.error('❌ Error syncing inventory to server:', error);
                });
        }
        
        // Update display
        this.updateInventoryDisplay();
        
        // If count reaches 0, unequip and add empty slot back
        if (item.count === 0) {
            console.log(`⚠️ Out of ${item.name}!`);
            
            // Add empty slot back
            const emptySlot = document.createElement('div');
            emptySlot.className = 'inventory-slot empty';
            this.inventoryGrid.appendChild(emptySlot);
            
            // Unequip and hide equip panel
            this.unequipItem();
            this.hideEquipPanel();
            
            // Clear selection
            this.selectedItem = null;
            const selectedElement = this.inventoryGrid.querySelector('.inventory-item.selected');
            if (selectedElement) {
                selectedElement.classList.remove('selected');
            }
        }
        
        return true;
    }
    
    // Hide equip panel
    hideEquipPanel() {
        if (this.equipPanel) {
            this.equipPanel.style.display = 'none';
        }
    }
    
    // Setup close button for equip panel
    setupCloseButton() {
        const closeBtn = document.getElementById('equipCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideEquipPanel();
                this.selectedItem = null;
            });
        }
    }
    
    // Add item count (for future use - e.g., when picking up items)
    async addItemCount(itemId, amount = 1) {
        const item = this.items.find(i => i.id === itemId);
        
        if (!item) {
            console.warn(`Item ${itemId} not found`);
            return;
        }
        
        item.count += amount;
        
        // Sync with server
        if (window.supabaseClient && window.supabaseClient.supabase) {
            const success = await window.supabaseClient.updateInventoryCount(itemId, item.count);
            if (success) {
                console.log('✅ Inventory count synced to server');
            } else {
                console.warn('⚠️ Failed to sync inventory count to server');
            }
        }
        
        this.updateInventoryDisplay();
        
        console.log(`✅ Added ${amount}x ${item.name} (Total: ${item.count})`);
    }
    
    // Unequip an item
    unequipItem() {
        if (!this.equippedItem) return;
        
        console.log(`🗑️ Unequipped: ${this.equippedItem.name} - Placement mode DISABLED`);
        
        this.equippedItem = null;
        this.placementMode = false;
        
        // Update button
        this.equipBtn.textContent = 'EQUIP';
        this.equipBtn.classList.remove('equipped');
        
        // Disable placement mode
        this.plantPlacement.disablePlacement();
    }
    
    // Add item to inventory (for future use)
    addItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) {
            console.warn(`Item ${itemId} not found in item database`);
            return;
        }
        
        // Create inventory item element
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.dataset.itemId = item.id;
        
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.className = 'inventory-item-image';
        
        const name = document.createElement('div');
        name.className = 'inventory-item-name';
        name.textContent = item.name;
        
        itemElement.appendChild(img);
        itemElement.appendChild(name);
        
        // Add click handler
        itemElement.addEventListener('click', () => {
            this.selectItem(item.id, itemElement);
        });
        
        this.inventoryGrid.appendChild(itemElement);
        
        console.log(`✅ Added ${item.name} to inventory`);
    }
}
