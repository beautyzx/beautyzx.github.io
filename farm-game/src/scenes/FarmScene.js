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
        // Row 0 (frames  0– 5): walk-down
        // Row 1 (frames  6–11): walk-up
        // Row 2 (frames 12–17): walk-right
        // Row 3 (frames 18–23): walk-left
        // Rows 4–17: action animations — do NOT use for movement
        //
        // Idle = single static frame (first frame of each walk row).
        const dirs = [
            { dir: 'down',  start:  0 },
            { dir: 'up',    start:  6 },
            { dir: 'right', start: 12 },
            { dir: 'left',  start: 18 },
        ];

        for (const { dir, start } of dirs) {
            this.anims.create({
                key: `walk-${dir}`,
                frames: this.anims.generateFrameNumbers('player', { start, end: start + 5 }),
                frameRate: 8,
                repeat: -1,
            });
            this.anims.create({
                key: `idle-${dir}`,
                frames: this.anims.generateFrameNumbers('player', { start, end: start }),
                frameRate: 4,
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
