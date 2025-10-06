// 🧪 CHEAT PREVENTION TEST SCRIPT
// Copy and paste this into your browser console to test cheat prevention

console.log('🧪 CHEAT PREVENTION TEST SUITE');
console.log('===============================\n');

// Save current state
const originalState = localStorage.getItem('bud_garden_game_state');
console.log('📸 Original state saved\n');

// TEST 1: Try to give yourself infinite BUD
console.log('🔓 TEST 1: Attempting to hack BUD balance...');
try {
    let state = JSON.parse(localStorage.getItem('bud_garden_game_state'));
    const originalBUD = state.player.totalBUD;
    state.player.totalBUD = 999999999;
    localStorage.setItem('bud_garden_game_state', JSON.stringify(state));
    
    console.log('   ✓ localStorage hacked:', originalBUD, '→', 999999999);
    console.log('   🔄 Refresh the page and watch BUD counter...');
    console.log('   ✅ EXPECTED: Server overwrites fake balance within 1 second\n');
} catch (e) {
    console.error('   ❌ Test failed:', e);
}

// TEST 2: Try to duplicate inventory items
console.log('🔓 TEST 2: Attempting to duplicate inventory items...');
try {
    let state = JSON.parse(localStorage.getItem('bud_garden_game_state'));
    const originalCount = state.inventory.length;
    
    // Add fake radio items
    state.inventory.push({
        id: 'radio',
        name: 'Retro Radio',
        description: 'HACKED ITEM',
        image: 'assets/sprites/radio.png',
        type: 'placeable',
        rewardRate: '5 BUD/min',
        count: 999
    });
    
    localStorage.setItem('bud_garden_game_state', JSON.stringify(state));
    
    console.log('   ✓ localStorage hacked:', originalCount, '→', state.inventory.length, 'items');
    console.log('   ⚠️ Fake items will show in inventory UI');
    console.log('   ✅ BUT: Shop purchases still validated server-side');
    console.log('   ✅ Can\'t buy items you can\'t afford\n');
} catch (e) {
    console.error('   ❌ Test failed:', e);
}

// TEST 3: Try to place fake plants
console.log('🔓 TEST 3: Attempting to place fake plants...');
try {
    let state = JSON.parse(localStorage.getItem('bud_garden_game_state'));
    const originalPlants = state.placedPlants ? state.placedPlants.length : 0;
    
    if (!state.placedPlants) state.placedPlants = [];
    
    // Add fake plant with insane reward rate
    state.placedPlants.push({
        row: 5,
        col: 5,
        itemId: 'radio',
        itemName: 'HACKED RADIO',
        rewardRate: '1000000 BUD/min',
        rotation: 0,
        serverPlantId: null // No server ID = fake plant
    });
    
    localStorage.setItem('bud_garden_game_state', JSON.stringify(state));
    
    console.log('   ✓ localStorage hacked:', originalPlants, '→', state.placedPlants.length, 'plants');
    console.log('   🔄 Refresh the page...');
    console.log('   ✅ EXPECTED: Server loads real plants, fake plant disappears');
    console.log('   ✅ BUD generation uses server data, not fake rewardRate\n');
} catch (e) {
    console.error('   ❌ Test failed:', e);
}

// TEST 4: Try to manipulate rotation
console.log('🔓 TEST 4: Attempting to fake rotation state...');
try {
    let state = JSON.parse(localStorage.getItem('bud_garden_game_state'));
    
    if (state.placedPlants && state.placedPlants.length > 0) {
        state.placedPlants.forEach(plant => {
            plant.rotation = 1; // Flip all plants
        });
        
        localStorage.setItem('bud_garden_game_state', JSON.stringify(state));
        
        console.log('   ✓ localStorage hacked: All plants flipped');
        console.log('   🔄 Refresh the page...');
        console.log('   ✅ EXPECTED: Server rotation state overwrites fake rotations\n');
    } else {
        console.log('   ⚠️ No plants to test with\n');
    }
} catch (e) {
    console.error('   ❌ Test failed:', e);
}

console.log('===============================');
console.log('🎯 SUMMARY');
console.log('===============================');
console.log('✅ localStorage can be hacked (expected)');
console.log('✅ Server overwrites fake data on page load');
console.log('✅ BUD balance always synced from server');
console.log('✅ Shop purchases validated server-side');
console.log('✅ Plant placement saved to database');
console.log('✅ Rotation state saved to database\n');

console.log('🔄 REFRESH PAGE NOW to see cheat prevention in action!\n');

console.log('📝 To restore original state:');
console.log('localStorage.setItem("bud_garden_game_state", `' + originalState + '`);\n');
