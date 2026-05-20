new Phaser.Game({
    type: Phaser.AUTO,
    width:  GAME_CONFIG.MAP_COLS * GAME_CONFIG.TILE_SIZE,   // 240
    height: GAME_CONFIG.MAP_ROWS * GAME_CONFIG.TILE_SIZE,   // 240
    zoom: GAME_CONFIG.SCALE,                                // 3× → 720×720 canvas
    pixelArt: true,
    roundPixels: true,
    backgroundColor: '#3a7d1e',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false },
    },
    scene: [BootScene, FarmScene],
});
