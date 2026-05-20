const GAME_CONFIG = {
    TILE_SIZE: 16,
    SCALE: 3,
    MAP_COLS: 15,
    MAP_ROWS: 15,
    PLAYER_SPEED: 80,
    // GID in tilemap data = frame index + 1 (0 = empty in Phaser tilemap)
    // col=0, row=5 (0-indexed) of 11×7 bitmask sheet = frame 55 = GID 56 = plain flat grass
    GRASS_TILE: 56,
};
