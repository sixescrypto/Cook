// Items Configuration - Easy to add new items!
// Each item should have:
// - id: unique identifier (use kebab-case)
// - name: display name
// - description: flavor text shown in info panel
// - image: path to image asset
// - type: 'placeable' for items that can be placed on grid
// - rewardRate: BUD generation rate (e.g., '0.5 BUD/min')
// - count: starting quantity in inventory

const ITEMS_CONFIG = [
    {
        id: 'sprout',
        name: 'Sprout',
        description: 'The potential to grow into something bigger..',
        image: 'assets/sprout.png',
        type: 'placeable',
        rewardRate: '1000 BUD/min'
    },
    {
        id: 'mini-mary',
        name: 'Mini-Mary',
        description: 'Now this has some pot-ential..',
        image: 'assets/sprites/mini-mary.png',
        type: 'placeable',
        rewardRate: '5000 BUD/min'
    },
    {
        id: 'radio',
        name: 'Radio',
        description: 'A classic radio to keep you company while you grow.',
        image: 'assets/sprites/radio.png',
        type: 'placeable',
        rewardRate: '0 BUD/min'
    },
    {
        id: 'puff-daddy',
        name: 'Puff Daddy',
        description: 'This is one puffy mfer..',
        image: 'assets/sprites/puff-daddy.png',
        type: 'placeable',
        rewardRate: '10000 BUD/min'
    },
    
    // === ADD MORE ITEMS BELOW === //
    
    // Example Cannabis Plant:
    // {
    //     id: 'cannabis-plant',
    //     name: 'Cannabis Plant',
    //     description: 'A fully grown cannabis plant ready to produce.',
    //     image: 'assets/cannabis-plant.png',
    //     type: 'placeable',
    //     rewardRate: '2.0 BUD/min',
    //     count: 0
    // },
    
    // Example Grow Light:
    // {
    //     id: 'grow-light',
    //     name: 'Grow Light',
    //     description: 'Helps your plants grow faster and healthier.',
    //     image: 'assets/grow-light.png',
    //     type: 'placeable',
    //     rewardRate: '0 BUD/min', // Doesn't generate, but boosts nearby plants
    //     count: 0
    // },
    
    // Example Fertilizer:
    // {
    //     id: 'fertilizer',
    //     name: 'Fertilizer',
    //     description: 'Boosts plant growth significantly.',
    //     image: 'assets/fertilizer.png',
    //     type: 'consumable', // Different type for items that aren't placed
    //     rewardRate: 'N/A',
    //     count: 0
    // }
];
