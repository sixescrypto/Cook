/* 
 * DEBUG COMMANDS FOR INVENTORY ISSUES
 * Paste these into your browser console when the game is running
 */

// 1. Check what's in Supabase database
async function checkServerInventory() {
    console.log('📦 Fetching from Supabase...');
    const inv = await window.supabaseClient.getInventory();
    console.table(inv);
    return inv;
}

// 2. Check what's in local memory
function checkLocalInventory() {
    console.log('💾 Local inventory (in memory):');
    console.table(window.inventorySystem.items);
    return window.inventorySystem.items;
}

// 3. Check placed plants on server
async function checkServerPlants() {
    console.log('🌱 Fetching placed plants from Supabase...');
    const plants = await window.supabaseClient.getPlacedPlants();
    console.table(plants);
    return plants;
}

// 4. Check placed plants in local memory
function checkLocalPlants() {
    console.log('🌱 Local placed plants (in memory):');
    console.table(window.plantPlacement.plants);
    return window.plantPlacement.plants;
}

// 5. Compare server vs local
async function compareServerVsLocal() {
    console.log('🔍 Comparing server vs local...');
    
    const serverInv = await window.supabaseClient.getInventory();
    const localInv = window.inventorySystem.items;
    
    console.log('📊 SERVER Inventory:', serverInv.length, 'items');
    console.table(serverInv);
    
    console.log('📊 LOCAL Inventory:', localInv.length, 'items');
    console.table(localInv);
    
    if (JSON.stringify(serverInv) === JSON.stringify(localInv)) {
        console.log('✅ MATCH - Server and local are in sync!');
    } else {
        console.log('⚠️ MISMATCH - Server and local are different!');
    }
}

// 6. Force reload from server (refreshes page)
function forceReloadFromServer() {
    console.log('🔄 Forcing reload from server...');
    localStorage.clear();
    location.reload();
}

// 7. Clear localStorage cache (doesn't reload)
function clearCache() {
    localStorage.clear();
    console.log('✅ localStorage cache cleared (refresh to reload from server)');
}

// Print available commands
console.log(`
🛠️ DEBUG COMMANDS LOADED:

Inventory Commands:
  checkServerInventory()  - Show what's in Supabase database
  checkLocalInventory()   - Show what's in browser memory
  compareServerVsLocal()  - Compare server vs local

Plant Commands:
  checkServerPlants()     - Show placed plants in database
  checkLocalPlants()      - Show placed plants in memory

Utility Commands:
  clearCache()            - Clear localStorage cache
  forceReloadFromServer() - Clear cache and refresh page

Example usage:
  await checkServerInventory()
  await compareServerVsLocal()
`);
