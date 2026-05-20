# My Farm Game

A pixel art farming game built with HTML5 + Phaser 3, using the Sprout Lands asset pack.

## Tech Stack

- **Engine**: Phaser 3 (loaded via CDN, no build step required)
- **Language**: JavaScript (no TypeScript, no React)
- **Tile size**: **16×16 pixels** (this is the unit for everything)
- **Display scale**: 3× (render game at 3× pixel size for visibility on modern monitors)
- **Art style**: 16×16 pixel art, Sprout Lands color palette

## Project Structure

```
my-farm-game/
├── index.html          ← entry point, double-click to run
├── README.md           ← this file
├── src/
│   ├── main.js         ← Phaser game config + scene registration
│   ├── scenes/
│   │   ├── BootScene.js    ← preload all assets
│   │   └── FarmScene.js    ← main gameplay scene
│   └── config.js       ← tile size, scale, colors constants
└── assets/             ← all sprites, organized by category
```

## Asset Reference

**All sprites use 16×16 base tile size unless noted otherwise.**
**All character/animal sprites have transparent background.**

### Characters (`assets/characters/`)

| File | Size | Grid | Notes |
|---|---|---|---|
| `player.png` | 384×1152 | 12 cols × 24 rows of **32×48 frames** | Premium character spritesheet. Two characters side-by-side (cols 0-5 = char A, cols 6-11 = char B). Multi-direction walk/idle/action animations. |
| `player_actions.png` | 96×576 | 6 cols × 9 rows of **16×32 frames** | Basic character action animations (chopping, watering, etc). |
| `tools.png` | 96×96 | 6×6 grid of **16×16** | Tool icons: axe, hoe, watering can, etc. |
| `watering_effect.png` | 432×144 | Animation frames **48×16** | Visual effect when watering. |

### Animals — Chicken (`assets/animals/chicken/`)

| File | Size | Notes |
|---|---|---|
| `chicken_white.png` | 128×432 | Adult chicken, multi-row animation sheet (8×16 per frame, multiple states) |
| `chicken_brown.png` | 128×432 | Brown variant |
| `chick_white.png` | 128×304 | Baby chick |
| `egg.png` | 160×288 | Egg sprite (hatching animation) |

### Animals — Cow (`assets/animals/cow/`)

| File | Size | Notes |
|---|---|---|
| `cow_brown.png` | 256×256 | Adult cow, **32×32 per frame** (cows are 2×2 tiles) |
| `cow_light.png` | 256×256 | Light/cream cow variant |
| `calf_brown.png` | 256×288 | Baby cow |

### Tiles (`assets/tiles/`)

These use **bitmask layout** — see `assets/reference/bitmask_reference.png` for which cell is which edge/corner.

| File | Size | Grid (16×16 tiles) | Notes |
|---|---|---|---|
| `grass.png` | 176×112 | 11×7 | Grass terrain with all edge/corner variants. **Primary ground tile.** |
| `soil.png` | 176×112 | 11×7 | Dirt/soil terrain, same bitmask layout |
| `water.png` | 64×16 | 4×1 | Water animation frames (animate by cycling through frames) |
| `tilled_dirt.png` | 176×112 | 11×7 | Tilled farming soil (hoed ground for planting) |
| `paths.png` | 64×64 | 4×4 | Stone path tiles |
| `house_walls.png` | 80×48 | 5×3 | House wall sections |
| `house_roof.png` | 112×80 | 7×5 | House roof sections |
| `fences.png` | 128×64 | 8×4 | Fence pieces (corners, edges, gate) |

### Objects (`assets/objects/`)

| File | Size | Notes |
|---|---|---|
| `trees.png` | 192×112 | Static trees, stumps, bushes (varied sizes) |
| `tree_apple.png` | 576×192 | Animated apple tree with growth/fruit stages |
| `farming_plants.png` | 80×240 | **Crops with growth stages**: 5 wide × 15 tall, each column = one crop, rows = growth stages |
| `mushrooms_flowers_stones.png` | 192×80 | Decorative natural objects (16×16 each) |
| `water_well.png` | 32×32 | Water well (2×2 tiles, single object) |
| `items.png` | 128×240 | Item icons (inventory display, 16×16 each) |
| `chest.png` | 240×96 | Treasure/storage chest (open/close states) |
| `furniture.png` | 144×96 | Indoor furniture (beds, tables, chairs) |
| `chicken_house.png` | 384×176 | Coop building (multi-tile object) |
| `barn.png` | 48×64 | Small barn (3×4 tiles) |

### UI (`assets/ui/`)

| File | Size | Notes |
|---|---|---|
| `dialog_box.png` | 48×48 | 9-slice dialog box (stretchable) |
| `buttons.png` | 96×192 | 26×26 square buttons (multiple states) |
| `icons.png` | 288×48 | UI icons (heart, coin, etc), 16×16 each |
| `emojis.png` | 160×608 | Emoji set for dialogue reactions |
| `inventory.png` | 368×336 | Inventory grid background |
| `weather.png` | 80×112 | Weather icons (sun, rain, snow, etc) |
| `cursor.png` | 16×16 | Cat paw mouse cursor |

### Fonts (`assets/fonts/`)

| File | Size | Notes |
|---|---|---|
| `pixel_font_sheet.png` | 118×106 | **8×14 per character** pixel font sprite sheet. Use as bitmap font in Phaser. |

### Reference (`assets/reference/`)

| File | Notes |
|---|---|
| `color_palette.png` | Official Sprout Lands color palette (16 colors) |
| `bitmask_reference.png` | **CRITICAL**: how the tile bitmask layout works for auto-tiling grass/soil edges |

## Phaser 3 Quickstart Notes

- Load Phaser via CDN: `<script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>`
- Game config should use `pixelArt: true` and `roundPixels: true` to avoid blurry pixels
- Set `scale.zoom = 3` (or use `scale.mode: Phaser.Scale.FIT`) to scale up the 16×16 art
- Disable image smoothing: `game.canvas.style.imageRendering = 'pixelated'`
- For spritesheets, use `this.load.spritesheet(key, path, { frameWidth, frameHeight })`
- For the player (32×48 frames): `frameWidth: 32, frameHeight: 48`
- For most tiles (16×16): `frameWidth: 16, frameHeight: 16`

## Development Roadmap (suggested)

1. **Phase 1 — Walk**: Load player sprite, move with arrow keys, basic animation.
2. **Phase 2 — Map**: Render a hand-built grass tilemap with some trees and a water tile.
3. **Phase 3 — Interaction**: Press a key to till soil, plant seeds, water crops.
4. **Phase 4 — Growth**: Crops cycle through growth stages over time.
5. **Phase 5 — Animals**: Add a chicken that wanders, lays eggs.
6. **Phase 6 — UI**: Inventory, day/night cycle, weather.

## Asset License

Sprout Lands by Cup Nooble (itch.io) — purchased asset pack, license per the seller's terms.
Do not redistribute the raw asset files.
