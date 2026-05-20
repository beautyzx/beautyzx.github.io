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
        this.player.body.setOffset(10, 38);

        // Keep player inside map
        const mapW = MAP_COLS * TILE_SIZE;
        const mapH = MAP_ROWS * TILE_SIZE;
        this.physics.world.setBounds(0, 0, mapW, mapH);
        this.player.setCollideWorldBounds(true);
    }

    _buildAnimations() {
        // player.png: 12 cols × 24 rows at 32×48 per frame (288 frames total).
        // Two characters side-by-side: char A = cols 0-5, char B = cols 6-11.
        // Row stride = 12 frames. Char A's frames for row N: N*12 through N*12+5.
        // Row 0 (frames  0- 5): walk-down
        // Row 2 (frames 24-29): walk-up
        // Row 6 (frames 72-77): walk-right
        // Row 7 (frames 84-89): walk-left
        const dirs = [
            { dir: 'down',  rowStart:  0 },
            { dir: 'up',    rowStart: 24 },
            { dir: 'right', rowStart: 72 },
            { dir: 'left',  rowStart: 84 },
        ];

        for (const { dir, rowStart } of dirs) {
            this.anims.create({
                key: `walk-${dir}`,
                frames: this.anims.generateFrameNumbers('player', { start: rowStart, end: rowStart + 5 }),
                frameRate: 8,
                repeat: -1,
            });
            this.anims.create({
                key: `idle-${dir}`,
                frames: this.anims.generateFrameNumbers('player', { start: rowStart, end: rowStart }),
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
