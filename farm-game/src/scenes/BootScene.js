class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Grass tileset: 176×112, 16×16 per tile (11 cols × 7 rows)
        this.load.image('grass', 'assets/tiles/grass.png');

        // Player spritesheet: 384×1152, 64×64 per frame (6 cols × 18 rows)
        this.load.spritesheet('player', 'assets/characters/player.png', {
            frameWidth: 32,
            frameHeight: 48,
        });
    }

    create() {
        this.scene.start('FarmScene');
    }
}
