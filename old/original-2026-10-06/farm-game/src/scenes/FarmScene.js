class FarmScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FarmScene' });
        this.player = null;
        this.keys = null;
        this.facing = 'down';
    }

    create() {
        this._buildMap();
        this._buildPlayer();
        this._buildAnimations();
        this._setupInput();
        this.player.play('idle-down');
    }

    _buildMap() {
        const { MAP_COLS, MAP_ROWS, TILE_SIZE, GRASS_TILE } = GAME_CONFIG;

        const mapData = [];
        for (let y = 0; y < MAP_ROWS; y++) {
            mapData.push(new Array(MAP_COLS).fill(GRASS_TILE));
        }

        const map = this.make.tilemap({
            data: mapData,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
        });

        const tileset = map.addTilesetImage('grass');
        map.createLayer(0, tileset, 0, 0);
    }

    _buildPlayer() {
        const { MAP_COLS, MAP_ROWS, TILE_SIZE } = GAME_CONFIG;

        // Center tile position
        const cx = Math.floor(MAP_COLS / 2) * TILE_SIZE + TILE_SIZE / 2;
        const cy = Math.floor(MAP_ROWS / 2) * TILE_SIZE + TILE_SIZE / 2;

        this.player = this.physics.add.sprite(cx, cy, 'player', 0);

        // Small collision box at the player's feet
        this.player.body.setSize(12, 8);
        this.player.body.setOffset(26, 52);

        // Keep player inside map
        const mapW = MAP_COLS * TILE_SIZE;
        const mapH = MAP_ROWS * TILE_SIZE;
        this.physics.world.setBounds(0, 0, mapW, mapH);
        this.player.setCollideWorldBounds(true);
    }

    _buildAnimations() {
        // Player spritesheet layout (6 cols × 18 rows at 64×64):
        // Row 0: idle-down   (frames  0– 5)   Row 1: walk-down   (frames  6–11)
        // Row 2: idle-up     (frames 12–17)   Row 3: walk-up     (frames 18–23)
        // Row 4: idle-right  (frames 24–29)   Row 5: walk-right  (frames 30–35)
        // Row 6: idle-left   (frames 36–41)   Row 7: walk-left   (frames 42–47)
        // Rows 8–17: action animations (unused in Phase 1)
        const defs = [
            { key: 'idle-down',  start:  0, end:  5, rate: 4 },
            { key: 'walk-down',  start:  6, end: 11, rate: 8 },
            { key: 'idle-up',    start: 12, end: 17, rate: 4 },
            { key: 'walk-up',    start: 18, end: 23, rate: 8 },
            { key: 'idle-right', start: 24, end: 29, rate: 4 },
            { key: 'walk-right', start: 30, end: 35, rate: 8 },
            { key: 'idle-left',  start: 36, end: 41, rate: 4 },
            { key: 'walk-left',  start: 42, end: 47, rate: 8 },
        ];

        for (const { key, start, end, rate } of defs) {
            this.anims.create({
                key,
                frames: this.anims.generateFrameNumbers('player', { start, end }),
                frameRate: rate,
                repeat: -1,
            });
        }
    }

    _setupInput() {
        this.keys = this.input.keyboard.createCursorKeys();
    }

    update() {
        const { PLAYER_SPEED } = GAME_CONFIG;
        const { left, right, up, down } = this.keys;

        let vx = 0;
        let vy = 0;

        if (left.isDown)       { vx = -PLAYER_SPEED; this.facing = 'left'; }
        else if (right.isDown) { vx =  PLAYER_SPEED; this.facing = 'right'; }

        if (up.isDown)         { vy = -PLAYER_SPEED; this.facing = 'up'; }
        else if (down.isDown)  { vy =  PLAYER_SPEED; this.facing = 'down'; }

        // Normalize diagonal speed
        if (vx !== 0 && vy !== 0) {
            const inv = 1 / Math.SQRT2;
            vx *= inv;
            vy *= inv;
        }

        this.player.setVelocity(vx, vy);

        const moving = vx !== 0 || vy !== 0;
        const animKey = `${moving ? 'walk' : 'idle'}-${this.facing}`;

        if (this.player.anims.currentAnim?.key !== animKey) {
            this.player.play(animKey);
        }
    }
}
