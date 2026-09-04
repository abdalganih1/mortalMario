import { LevelData, Block } from '../types';

const BASE_LEVELS: LevelData[] = [
  // --- WORLD 1: OVERWORLD ---
  {
    world: 1,
    level: 1,
    name: 'Mushroom Kingdom - Overworld',
    nameAr: 'العالم 1: السهول الخضراء',
    theme: 'overworld',
    width: 3200,
    height: 480,
    startX: 60,
    startY: 380,
    goalX: 3050,
    blocks: [
      // Ground continuous
      ...createGround(0, 3200, 440, 40, 'stone'),

      // First mystery blocks and bricks
      { id: 101, x: 260, y: 320, width: 32, height: 32, type: 'question', content: 'coin' },
      { id: 102, x: 310, y: 320, width: 32, height: 32, type: 'brick' },
      { id: 103, x: 342, y: 320, width: 32, height: 32, type: 'question', content: 'mushroom' },
      { id: 104, x: 374, y: 320, width: 32, height: 32, type: 'brick' },
      { id: 105, x: 406, y: 320, width: 32, height: 32, type: 'question', content: 'coin' },

      // High mystery block with FLOWER
      { id: 106, x: 342, y: 200, width: 32, height: 32, type: 'question', content: 'flower' },

      // Warp pipes
      { id: 110, x: 560, y: 380, width: 48, height: 60, type: 'pipe' },
      { id: 111, x: 740, y: 350, width: 48, height: 90, type: 'pipe', isWarp: true, warpTo: { x: 1900, y: 240 } },
      { id: 112, x: 920, y: 320, width: 48, height: 120, type: 'pipe' },

      // Second block structure with hidden flower and coins
      { id: 120, x: 1100, y: 320, width: 32, height: 32, type: 'brick' },
      { id: 121, x: 1132, y: 320, width: 32, height: 32, type: 'question', content: 'flower' },
      { id: 122, x: 1164, y: 320, width: 32, height: 32, type: 'brick' },
      { id: 123, x: 1220, y: 220, width: 32, height: 32, type: 'question', content: 'coin' },
      { id: 124, x: 1252, y: 220, width: 32, height: 32, type: 'question', content: 'coin' },

      // Pit gap 1
      // Ground skipped from 1450 to 1550 (handled by createGround segments if split, but let's add pipe bridge)
      { id: 130, x: 1580, y: 350, width: 48, height: 90, type: 'pipe' },

      // Pyramid stairs
      ...createStairs(1800, 440, 4, 32, 1),
      ...createStairs(2100, 440, 4, 32, -1),

      // Goal castle flag tower
      ...createStairs(2800, 440, 8, 32, 1),
      { id: 199, x: 3050, y: 220, width: 40, height: 220, type: 'stone' },
    ],
    enemies: [
      { type: 'goomba', x: 420, y: 400, vx: -1.2, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'goomba', x: 650, y: 400, vx: -1.2, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'koopa', x: 840, y: 395, vx: -1.5, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'goomba', x: 1040, y: 400, vx: -1.2, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'koopa', x: 1350, y: 395, vx: -1.5, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'goomba', x: 1700, y: 400, vx: -1.2, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'goomba', x: 2350, y: 400, vx: -1.2, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'koopa', x: 2500, y: 395, vx: -1.5, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
    ],
  },

  // --- WORLD 2: UNDERGROUND ---
  {
    world: 2,
    level: 2,
    name: 'Underground Cavern',
    nameAr: 'العالم 2: الكهف الأزرق السفلي',
    theme: 'underground',
    width: 3200,
    height: 480,
    startX: 60,
    startY: 380,
    goalX: 3050,
    blocks: [
      // Ceiling blocks
      ...createGround(0, 3200, 0, 40, 'stone'),
      // Ground
      ...createGround(0, 3200, 440, 40, 'stone'),

      // Elevated brick walkways
      { id: 201, x: 200, y: 310, width: 160, height: 28, type: 'brick' },
      { id: 202, x: 260, y: 310, width: 32, height: 28, type: 'question', content: 'flower' },
      { id: 203, x: 420, y: 230, width: 140, height: 28, type: 'brick' },
      { id: 204, x: 470, y: 230, width: 32, height: 28, type: 'question', content: 'coin' },

      // Pipes with piranhas
      { id: 210, x: 680, y: 350, width: 48, height: 90, type: 'pipe' },
      { id: 211, x: 920, y: 310, width: 48, height: 130, type: 'pipe', isWarp: true, warpTo: { x: 2080, y: 240 } },
      { id: 212, x: 1200, y: 350, width: 48, height: 90, type: 'pipe' },

      // Flying platforms and question blocks
      { id: 220, x: 1400, y: 300, width: 120, height: 28, type: 'brick' },
      { id: 221, x: 1440, y: 300, width: 32, height: 28, type: 'question', content: 'mushroom' },
      { id: 222, x: 1620, y: 240, width: 140, height: 28, type: 'brick' },
      { id: 223, x: 1670, y: 240, width: 32, height: 28, type: 'question', content: 'flower' },

      // Stepped caverns with plateau (authentic Mario pyramid without any inescapable pits)
      ...createPyramid(1900, 440, 4, 160, 32),
      // Reward blocks on top of the cavern pyramid
      { id: 240, x: 2060, y: 220, width: 32, height: 28, type: 'question', content: 'coin' },
      { id: 241, x: 2092, y: 220, width: 32, height: 28, type: 'question', content: 'flower' },
      { id: 242, x: 2124, y: 220, width: 32, height: 28, type: 'question', content: 'coin' },

      // Exit pipe
      { id: 299, x: 3020, y: 320, width: 56, height: 120, type: 'pipe' },
    ],
    enemies: [
      { type: 'goomba', x: 300, y: 400, vx: -1.4, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'piranha', x: 688, y: 318, vx: 0, vy: 0, width: 32, height: 32, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'koopa', x: 820, y: 395, vx: -1.6, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'piranha', x: 928, y: 278, vx: 0, vy: 0, width: 32, height: 32, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'goomba', x: 1080, y: 400, vx: -1.4, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'piranha', x: 1208, y: 318, vx: 0, vy: 0, width: 32, height: 32, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'koopa', x: 1500, y: 395, vx: -1.6, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'goomba', x: 1800, y: 400, vx: -1.4, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'koopa', x: 2600, y: 395, vx: -1.6, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
    ],
  },

  // --- WORLD 3: BOWSER'S CASTLE & BOSS BATTLE ---
  {
    world: 3,
    level: 3,
    name: "Bowser's Fiery Castle",
    nameAr: 'العالم 3: قلعة باوزر النارية والزعيم',
    theme: 'castle',
    width: 2800,
    height: 480,
    startX: 60,
    startY: 380,
    goalX: 2650,
    hasBoss: true,
    blocks: [
      // Ground segment 1
      ...createGround(0, 1600, 440, 40, 'stone'),

      // Castle battlements & blocks
      { id: 301, x: 220, y: 320, width: 96, height: 28, type: 'brick' },
      { id: 302, x: 252, y: 320, width: 32, height: 28, type: 'question', content: 'flower' },
      { id: 303, x: 420, y: 240, width: 96, height: 28, type: 'brick' },
      { id: 304, x: 452, y: 240, width: 32, height: 28, type: 'question', content: 'mushroom' },

      // Lava pit 1
      ...createGround(600, 200, 450, 30, 'lava'),

      // Middle fortress
      ...createGround(800, 600, 440, 40, 'stone'),
      { id: 310, x: 920, y: 310, width: 120, height: 28, type: 'brick' },
      { id: 311, x: 960, y: 310, width: 32, height: 28, type: 'question', content: 'flower' },

      // High vantage point
      { id: 320, x: 1200, y: 250, width: 140, height: 28, type: 'stone' },

      // --- BOWSER BOSS ARENA ---
      // Left cliff
      ...createGround(1400, 200, 440, 40, 'stone'),

      // Giant Boiling Lava Pit under the bridge
      ...createGround(1600, 750, 450, 30, 'lava'),

      // Collapsible Castle Chain Bridge (from x: 1600 to 2350)
      ...createBridge(1600, 750, 440, 20),

      // Golden Axe switch on right side of bridge
      { id: 390, x: 2360, y: 408, width: 32, height: 32, type: 'axe' },

      // Right safety cliff and Princess Peach / victory gate
      ...createGround(2360, 440, 440, 40, 'stone'),
      { id: 395, x: 2600, y: 300, width: 50, height: 140, type: 'stone' },
    ],
    enemies: [
      { type: 'koopa', x: 350, y: 395, vx: -1.5, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'goomba', x: 880, y: 400, vx: -1.3, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'koopa', x: 1100, y: 395, vx: -1.5, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      // --- BOWSER BOSS ---
      {
        type: 'bowser',
        x: 2000,
        y: 360,
        vx: -0.6,
        vy: 0,
        width: 72,
        height: 80,
        health: 100,
        maxHealth: 100,
        facing: 'left',
        attackTimer: 0,
        phase: 1,
      },
    ],
  },

  // --- WORLD 4: DESERT PYRAMIDS & RIVAL NINJA BOSS ---
  {
    world: 4,
    level: 1,
    name: 'Desert of Ancient Kombat',
    nameAr: 'العالم 4: صحراء الأهرامات ونزال النينجا',
    theme: 'desert',
    width: 3200,
    height: 480,
    startX: 60,
    startY: 380,
    goalX: 3050,
    hasRivalBoss: true,
    blocks: [
      // Golden Sand Dune Ground
      ...createGround(0, 3200, 440, 40, 'stone'),

      // Desert palms and oasis blocks
      { id: 401, x: 260, y: 320, width: 32, height: 32, type: 'question', content: 'mushroom' },
      { id: 402, x: 292, y: 320, width: 32, height: 32, type: 'brick' },
      { id: 403, x: 324, y: 320, width: 32, height: 32, type: 'question', content: 'flower' },
      { id: 404, x: 356, y: 320, width: 32, height: 32, type: 'brick' },

      // Sandstone pipes
      { id: 410, x: 580, y: 360, width: 48, height: 80, type: 'pipe' },
      { id: 411, x: 800, y: 330, width: 48, height: 110, type: 'pipe' },

      // Great Pharaoh Pyramid
      ...createPyramid(1100, 440, 5, 200, 32),
      { id: 420, x: 1320, y: 180, width: 32, height: 32, type: 'question', content: 'flower' },
      { id: 421, x: 1352, y: 180, width: 32, height: 32, type: 'question', content: 'coin' },
      { id: 422, x: 1384, y: 180, width: 32, height: 32, type: 'question', content: 'mushroom' },

      // Ancient Ruins Pillars before boss arena
      { id: 430, x: 1750, y: 300, width: 40, height: 140, type: 'stone' },
      { id: 431, x: 1900, y: 260, width: 120, height: 28, type: 'brick' },
      { id: 432, x: 1940, y: 260, width: 32, height: 28, type: 'question', content: 'flower' },
      { id: 433, x: 2100, y: 300, width: 40, height: 140, type: 'stone' },

      // Boss Arena Plateau (x: 2200 to 2800)
      ...createStairs(2160, 440, 3, 32, 1),
      ...createGround(2256, 600, 344, 96, 'stone'),
      ...createStairs(2856, 440, 3, 32, -1),

      // Goal portal
      { id: 499, x: 3050, y: 220, width: 40, height: 220, type: 'stone' },
    ],
    enemies: [
      { type: 'goomba', x: 400, y: 400, vx: -1.3, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'koopa', x: 720, y: 395, vx: -1.5, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'piranha', x: 808, y: 298, vx: 0, vy: 0, width: 32, height: 32, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'koopa', x: 1650, y: 395, vx: -1.6, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'goomba', x: 1850, y: 400, vx: -1.4, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      // --- RIVAL NINJA BOSS ---
      {
        type: 'rival_ninja',
        x: 2450,
        y: 300,
        vx: -1.5,
        vy: 0,
        width: 32,
        height: 48,
        health: 80,
        maxHealth: 80,
        facing: 'left',
        attackTimer: 0,
        specialCooldown: 1.8,
      },
    ],
  },

  // --- WORLD 5: BOWSER'S SKY AIRSHIP FLEET ---
  {
    world: 5,
    level: 1,
    name: "Bowser's Sky Airship",
    nameAr: 'العالم 5: سفينة باوزر الطائرة في السماء',
    theme: 'airship',
    width: 3400,
    height: 480,
    startX: 60,
    startY: 380,
    goalX: 3250,
    blocks: [
      // Starting airship deck
      ...createGround(0, 700, 440, 40, 'stone'),
      { id: 501, x: 280, y: 320, width: 32, height: 32, type: 'question', content: 'flower' },
      { id: 502, x: 312, y: 320, width: 32, height: 32, type: 'brick' },
      { id: 503, x: 344, y: 320, width: 32, height: 32, type: 'question', content: 'mushroom' },

      // Airship Cannon Turrets
      { id: 510, x: 500, y: 360, width: 48, height: 80, type: 'pipe' },

      // Cloud jump gap to ship 2
      ...createGround(800, 600, 410, 40, 'stone'),
      { id: 520, x: 920, y: 280, width: 120, height: 28, type: 'brick' },
      { id: 521, x: 960, y: 280, width: 32, height: 28, type: 'question', content: 'flower' },
      { id: 522, x: 1150, y: 330, width: 48, height: 80, type: 'pipe' },

      // Floating propeller platforms
      { id: 530, x: 1480, y: 360, width: 120, height: 28, type: 'stone' },
      { id: 531, x: 1680, y: 300, width: 140, height: 28, type: 'stone' },
      { id: 532, x: 1720, y: 220, width: 32, height: 28, type: 'question', content: 'mushroom' },
      { id: 533, x: 1900, y: 340, width: 120, height: 28, type: 'stone' },

      // Flagship Captain Deck
      ...createGround(2100, 1100, 440, 40, 'stone'),
      { id: 540, x: 2260, y: 320, width: 160, height: 28, type: 'brick' },
      { id: 541, x: 2320, y: 320, width: 32, height: 28, type: 'question', content: 'flower' },
      { id: 542, x: 2500, y: 350, width: 48, height: 90, type: 'pipe', isWarp: true, warpTo: { x: 2900, y: 300 } },
      { id: 543, x: 2750, y: 320, width: 48, height: 120, type: 'pipe' },

      // Goal Airship Cabin
      ...createStairs(3000, 440, 6, 32, 1),
      { id: 599, x: 3250, y: 220, width: 50, height: 220, type: 'stone' },
    ],
    enemies: [
      { type: 'goomba', x: 380, y: 400, vx: -1.4, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'koopa', x: 600, y: 395, vx: -1.6, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'koopa', x: 980, y: 365, vx: -1.6, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'piranha', x: 1158, y: 298, vx: 0, vy: 0, width: 32, height: 32, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'goomba', x: 1520, y: 325, vx: -1.2, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'koopa', x: 2200, y: 395, vx: -1.6, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'goomba', x: 2420, y: 400, vx: -1.5, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'piranha', x: 2508, y: 318, vx: 0, vy: 0, width: 32, height: 32, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'koopa', x: 2850, y: 395, vx: -1.6, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
    ],
  },

  // --- WORLD 6: NETHERREALM KOMBAT COLOSSEUM (DUAL BOSS CLIMAX) ---
  {
    world: 6,
    level: 1,
    name: 'Netherrealm Arena - The Final Kombat',
    nameAr: 'العالم 6: عرش مورتال كومبات والنزال الخارق',
    theme: 'netherrealm',
    width: 3200,
    height: 480,
    startX: 60,
    startY: 380,
    goalX: 3050,
    hasBoss: true,
    hasRivalBoss: true,
    blocks: [
      // Gothic Demon Stone Entrance
      ...createGround(0, 1000, 440, 40, 'stone'),
      { id: 601, x: 260, y: 320, width: 32, height: 32, type: 'question', content: 'flower' },
      { id: 602, x: 300, y: 320, width: 32, height: 32, type: 'question', content: 'mushroom' },
      { id: 603, x: 340, y: 320, width: 32, height: 32, type: 'question', content: 'flower' },

      // Lava abyss gap 1
      ...createGround(1000, 250, 450, 30, 'lava'),
      ...createBridge(1000, 250, 440, 20),

      // Demon Gate Shrine
      ...createGround(1250, 450, 440, 40, 'stone'),
      { id: 610, x: 1350, y: 310, width: 120, height: 28, type: 'brick' },
      { id: 611, x: 1390, y: 310, width: 32, height: 28, type: 'question', content: 'flower' },

      // --- THE GRAND FINAL ARENA (x: 1700 to 2850) ---
      // Left cliff
      ...createGround(1700, 200, 440, 40, 'stone'),

      // Boiling Netherrealm Lava Chasm
      ...createGround(1900, 800, 450, 30, 'lava'),

      // Grand Chain Bridge
      ...createBridge(1900, 800, 440, 20),

      // Golden Axe switch to drop the bridge!
      { id: 690, x: 2710, y: 408, width: 32, height: 32, type: 'axe' },

      // Right Victory Platform
      ...createGround(2710, 490, 440, 40, 'stone'),
      { id: 695, x: 3000, y: 220, width: 50, height: 220, type: 'stone' },
    ],
    enemies: [
      { type: 'koopa', x: 450, y: 395, vx: -1.7, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'kombatant', fighterKind: 'kitana', x: 800, y: 390, vx: -1.2, vy: 0, width: 32, height: 48, health: 4, maxHealth: 4, facing: 'left' },
      { type: 'goomba', x: 750, y: 400, vx: -1.5, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'koopa', x: 1400, y: 395, vx: -1.7, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      // --- RIVAL NINJA BOSS ---
      {
        type: 'rival_ninja',
        x: 2150,
        y: 390,
        vx: -1.6,
        vy: 0,
        width: 32,
        height: 48,
        health: 70,
        maxHealth: 70,
        facing: 'left',
        attackTimer: 0,
        specialCooldown: 1.5,
      },
      // --- SUPREME BOWSER BOSS ---
      {
        type: 'bowser',
        x: 2450,
        y: 360,
        vx: -0.8,
        vy: 0,
        width: 72,
        height: 80,
        health: 120,
        maxHealth: 120,
        facing: 'left',
        attackTimer: 0,
        phase: 1,
      },
    ],
  },

  // --- WORLD 7: LIVING FOREST (BRANCHING HIGH CANOPY / LOW SWAMP ROUTES + BARAKA WARLORD BOSS) ---
  {
    world: 7,
    level: 1,
    name: 'Living Forest - Baraka Warlord',
    nameAr: 'العالم 7: الغابة الحية وزعيم باراكا',
    theme: 'forest',
    width: 3400,
    height: 480,
    startX: 60,
    startY: 380,
    goalX: 3250,
    hasRivalBoss: true,
    blocks: [
      // Jungle floor
      ...createGround(0, 1250, 440, 40, 'stone'),
      { id: 701, x: 260, y: 320, width: 32, height: 32, type: 'question', content: 'mushroom' },
      { id: 702, x: 292, y: 320, width: 32, height: 32, type: 'brick' },
      { id: 703, x: 324, y: 320, width: 32, height: 32, type: 'question', content: 'flower' },

      // Warp pipe: dive down to the secret canopy road
      { id: 710, x: 640, y: 360, width: 48, height: 80, type: 'pipe', isWarp: true, warpTo: { x: 1300, y: 200 } },

      // LOW ROUTE: swamp water gaps (lava = swamp) with stone hops
      ...createGround(1250, 300, 450, 30, 'lava'),
      ...createGround(1250, 120, 400, 40, 'stone'),
      ...createGround(1470, 120, 400, 40, 'stone'),
      ...createGround(1690, 120, 400, 40, 'stone'),
      ...createGround(1910, 120, 400, 40, 'stone'),

      // HIGH ROUTE: canopy bridges through the treetops
      ...createBridge(1250, 900, 250, 20),
      { id: 720, x: 1400, y: 180, width: 32, height: 28, type: 'question', content: 'coin' },
      { id: 721, x: 1432, y: 180, width: 32, height: 28, type: 'question', content: 'flower' },
      { id: 722, x: 1700, y: 180, width: 32, height: 28, type: 'question', content: 'mushroom' },

      // Canopy exit pipe back down to the forest floor
      { id: 730, x: 2100, y: 190, width: 48, height: 60, type: 'pipe', isWarp: true, warpTo: { x: 2280, y: 340 } },

      // Reunited forest floor
      ...createGround(2150, 400, 440, 40, 'stone'),
      { id: 740, x: 2220, y: 320, width: 96, height: 28, type: 'brick' },
      { id: 741, x: 2252, y: 320, width: 32, height: 28, type: 'question', content: 'flower' },

      // BARAKA WARLORD ARENA (x: 2550 to 3150)
      ...createGround(2550, 600, 440, 40, 'stone'),
      ...createStairs(2510, 440, 3, 32, 1),
      { id: 799, x: 3250, y: 220, width: 50, height: 220, type: 'stone' },
    ],
    enemies: [
      { type: 'goomba', x: 400, y: 400, vx: -1.4, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' },
      { type: 'kombatant', fighterKind: 'baraka', x: 900, y: 390, vx: -1.0, vy: 0, width: 32, height: 48, health: 4, maxHealth: 4, facing: 'left' },
      { type: 'koopa', x: 1350, y: 205, vx: -1.5, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'kombatant', fighterKind: 'liukang', x: 1600, y: 390, vx: -1.2, vy: 0, width: 32, height: 48, health: 4, maxHealth: 4, facing: 'left' },
      { type: 'piranha', x: 1808, y: 368, vx: 0, vy: 0, width: 32, height: 32, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'kombatant', fighterKind: 'baraka', x: 2300, y: 390, vx: -1.3, vy: 0, width: 32, height: 48, health: 5, maxHealth: 5, facing: 'left' },
      { type: 'koopa', x: 2450, y: 395, vx: -1.6, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      // --- BARAKA WARLORD (FIGHTER BOSS) ---
      {
        type: 'fighter_boss',
        fighterKind: 'baraka',
        isBoss: true,
        x: 2800,
        y: 380,
        vx: -1.4,
        vy: 0,
        width: 40,
        height: 58,
        health: 130,
        maxHealth: 130,
        facing: 'left',
        attackTimer: 0,
        specialCooldown: 1.6,
      },
    ],
  },

  // --- WORLD 8: KAHN'S PIT ARENA (FINAL FIGHTER-BOSS: SHANG TSUNG, NO DRAGON) ---
  {
    world: 8,
    level: 1,
    name: "Kahn's Pit - Shang Tsung Final",
    nameAr: 'العالم 8: حلبة شانغ تسونغ والنزال الأخير',
    theme: 'pit',
    width: 3200,
    height: 480,
    startX: 60,
    startY: 380,
    goalX: 3050,
    hasBoss: true,
    hasRivalBoss: true,
    blocks: [
      // Entrance platform
      ...createGround(0, 900, 440, 40, 'stone'),
      { id: 801, x: 260, y: 320, width: 32, height: 32, type: 'question', content: 'flower' },
      { id: 802, x: 292, y: 320, width: 32, height: 32, type: 'question', content: 'mushroom' },
      { id: 803, x: 324, y: 320, width: 32, height: 32, type: 'question', content: 'coin' },

      // Bottomless pit: TWO routes — low bridge or high stone ledges
      ...createGround(900, 700, 450, 30, 'lava'),
      ...createBridge(900, 700, 440, 20),
      { id: 810, x: 1050, y: 300, width: 120, height: 28, type: 'stone' },
      { id: 811, x: 1300, y: 240, width: 120, height: 28, type: 'stone' },
      { id: 812, x: 1340, y: 180, width: 32, height: 28, type: 'question', content: 'flower' },

      // Warp pipe shortcut across the pit
      { id: 820, x: 700, y: 360, width: 48, height: 80, type: 'pipe', isWarp: true, warpTo: { x: 1700, y: 340 } },

      // Mid arena with guards
      ...createGround(1600, 600, 440, 40, 'stone'),
      { id: 830, x: 1750, y: 320, width: 120, height: 28, type: 'brick' },
      { id: 831, x: 1790, y: 320, width: 32, height: 28, type: 'question', content: 'flower' },

      // FINAL ARENA: Shang Tsung throne platform (x: 2200 to 3000)
      ...createStairs(2160, 440, 3, 32, 1),
      ...createGround(2256, 750, 380, 100, 'stone'),
      { id: 840, x: 2400, y: 260, width: 32, height: 28, type: 'question', content: 'mushroom' },
      { id: 899, x: 3050, y: 180, width: 50, height: 200, type: 'stone' },
    ],
    enemies: [
      { type: 'kombatant', fighterKind: 'kitana', x: 600, y: 390, vx: -1.2, vy: 0, width: 32, height: 48, health: 4, maxHealth: 4, facing: 'left' },
      { type: 'koopa', x: 1700, y: 395, vx: -1.7, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' },
      { type: 'kombatant', fighterKind: 'shangtsung', x: 1950, y: 390, vx: -1.3, vy: 0, width: 32, height: 48, health: 6, maxHealth: 6, facing: 'left' },
      // --- SHANG TSUNG (FINAL FIGHTER BOSS) ---
      {
        type: 'fighter_boss',
        fighterKind: 'shangtsung',
        isBoss: true,
        x: 2600,
        y: 320,
        vx: -1.6,
        vy: 0,
        width: 42,
        height: 60,
        health: 200,
        maxHealth: 200,
        facing: 'left',
        attackTimer: 0,
        specialCooldown: 1.4,
      },
    ],
  },
];

// ================= 100-STAGE CLASSIC PACK =================
// 8 handcrafted worlds + 92 generated classic-Mario stages = 100 total.

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let genBlockId = 90000;
const nid = () => genBlockId++;

// Classic pattern row: '?' = coin, M = mushroom, F = flower, B = brick
function rowBlocks(x: number, y: number, s: string): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === ' ') continue;
    const bx = x + i * 32;
    if (c === 'B') out.push({ id: nid(), x: bx, y, width: 32, height: 32, type: 'brick' });
    else
      out.push({
        id: nid(),
        x: bx,
        y,
        width: 32,
        height: 32,
        type: 'question',
        content: c === 'M' ? 'mushroom' : c === 'F' ? 'flower' : 'coin',
      });
  }
  return out;
}

function buildClassicLevels(): LevelData[] {
  const out: LevelData[] = [];
  const themes = ['overworld', 'underground', 'desert', 'airship', 'forest', 'castle', 'pit', 'netherrealm'] as const;
  const themeAr: Record<string, string> = {
    overworld: 'السهول',
    underground: 'الكهوف',
    desert: 'الصحراء',
    airship: 'السفن الطائرة',
    forest: 'الغابة',
    castle: 'القلاع',
    pit: 'الحفرة',
    netherrealm: 'العالم السفلي',
  };
  const gruntKinds = ['baraka', 'liukang', 'kitana', 'shangtsung', 'kunglao', 'johnnycage', 'jax', 'sonya', 'kano', 'jade', 'mileena', 'ermac', 'smoke', 'rain', 'sindel', 'nightwolf', 'kabal', 'sheeva', 'quanchi', 'fujin', 'striker', 'goro', 'kintaro', 'shaokahn'] as const;
  const rivalKinds = ['subzero', 'scorpion', 'noob', 'raiden', 'reptile', 'baraka', 'liukang', 'kitana', 'kunglao', 'shangtsung'] as const;
  const TOTAL = 92;

  for (let i = 0; i < TOTAL; i++) {
    const stageNo = 9 + i; // human stage number (1-based)
    const r = mulberry(4243 + i * 131);
    const theme = themes[i % themes.length];
    const diff = i / (TOTAL - 1); // 0 easy .. 1 brutal
    const width = 3000 + Math.floor(r() * 700);
    const endArena = width - 700;
    const goalX = width - 160;
    const blocks: Block[] = [];
    const enemies: LevelData['enemies'] = [];
    const isBossStage = i % 10 === 9;

    const addGrunt = (x: number, y: number) => {
      const roll = r();
      if (i >= 10 && roll < 0.12 + diff * 0.25) {
        const kind = gruntKinds[Math.floor(r() * gruntKinds.length)];
        enemies.push({ type: 'kombatant', fighterKind: kind, x, y: 390, vx: -1.1, vy: 0, width: 32, height: 48, health: 4 + Math.floor(diff * 3), maxHealth: 4 + Math.floor(diff * 3), facing: 'left' });
      } else if (i >= 6 && roll < 0.3) {
        enemies.push({ type: roll < 0.2 ? 'spiny' : 'hammerbro', x, y: 398, vx: -1.0, vy: 0, width: 30, height: 32, health: 2, maxHealth: 2, facing: 'left' });
      } else if (roll < 0.62) {
        enemies.push({ type: 'koopa', x, y: 395, vx: -1.5, vy: 0, width: 32, height: 42, health: 2, maxHealth: 2, facing: 'left' });
      } else {
        enemies.push({ type: 'goomba', x, y: 400, vx: -1.2 - diff, vy: 0, width: 30, height: 30, health: 1, maxHealth: 1, facing: 'left' });
      }
    };

    // Safe runway + starter row (classic 1-1 homage opening)
    blocks.push(...createGround(0, 700, 440, 40, 'stone'));
    blocks.push(...rowBlocks(260, 320, '?B?B?'));
    addGrunt(430, 400);

    let x = 700;
    let pipes = 0;
    while (x < endArena) {
      const roll = r();
      if (roll < 0.2 + diff * 0.16) {
        // Lava pit gap (wider when harder) with high detour on big ones
        const gap = Math.floor(90 + r() * (90 + diff * 130));
        blocks.push(...createGround(x, gap, 450, 30, 'lava'));
        if (gap > 150) blocks.push({ id: nid(), x: x + gap / 2 - 60, y: 300, width: 120, height: 28, type: 'stone' });
        x += gap;
      } else if (roll < 0.44) {
        // Classic block row segment
        const patterns = ['?B?B?', 'BMB', '?F?', 'B?B', '??M??', 'BFB', '?B?F?B?'];
        const pat = patterns[Math.floor(r() * patterns.length)];
        const segLen = Math.max(380, pat.length * 32 + 260);
        blocks.push(...createGround(x, segLen, 440, 40, 'stone'));
        blocks.push(...rowBlocks(x + 120, 320, pat));
        addGrunt(x + 60, 400);
        if (r() < 0.5 + diff * 0.3) addGrunt(x + segLen - 120, 400);
        x += segLen;
      } else if (roll < 0.6) {
        // Iconic ascending pipe trio (one sometimes hides a warp)
        const segLen = 420;
        blocks.push(...createGround(x, segLen, 440, 40, 'stone'));
        const heights = [60, 90, 120];
        for (let k = 0; k < 3; k++) {
          const px = x + 60 + k * 110;
          const ph = heights[k];
          const isWarpPipe = pipes % 7 === 3 && k === 1;
          blocks.push({
            id: nid(), x: px, y: 440 - ph, width: 48, height: ph, type: 'pipe',
            ...(isWarpPipe ? { isWarp: true, warpTo: { x: x + 200, y: 160 } } : {}),
          });
          if (r() < 0.45) enemies.push({ type: 'piranha', x: px + 8, y: 440 - ph - 32, vx: 0, vy: 0, width: 32, height: 32, health: 2, maxHealth: 2, facing: 'left' });
          pipes++;
        }
        // Sky bonus for warp pipes
        if (pipes % 7 === 4) {
          blocks.push({ id: nid(), x: x + 100, y: 190, width: 220, height: 28, type: 'stone' });
          blocks.push(...rowBlocks(x + 130, 130, '?M?'));
        }
        addGrunt(x + 30, 400);
        x += segLen;
      } else if (roll < 0.76) {
        // Stair pyramid (up then down) like the classics
        const steps = 3 + Math.floor(r() * 3);
        const segLen = steps * 32 * 2 + 200;
        blocks.push(...createGround(x, segLen, 440, 40, 'stone'));
        blocks.push(...createStairs(x + 80, 440, steps, 32, 1));
        blocks.push(...createStairs(x + 80 + steps * 32, 440, steps, 32, -1));
        if (r() < 0.5) blocks.push(...rowBlocks(x + 80 + Math.floor(steps / 2) * 32, 440 - (steps + 1) * 32, '?'));
        addGrunt(x + segLen - 100, 400);
        x += segLen;
      } else {
        // High platform road with rewards + guards below
        const segLen = 480;
        blocks.push(...createGround(x, segLen, 440, 40, 'stone'));
        blocks.push({ id: nid(), x: x + 60, y: 300, width: 360, height: 28, type: 'stone' });
        blocks.push(...rowBlocks(x + 120, 240, r() < 0.5 ? '?F?' : '?M?'));
        addGrunt(x + 40, 400);
        addGrunt(x + 300, 255);
        x += segLen;
      }
    }

    // Final arena + goal staircase
    blocks.push(...createGround(endArena, 700, 440, 40, 'stone'));
    blocks.push(...createStairs(goalX - 260, 440, 6, 32, 1));
    blocks.push({ id: nid(), x: goalX, y: 220, width: 44, height: 220, type: 'stone' });

    // Boss every 10th stage (end of each world)
    if (isBossStage) {
      const bCycle = Math.floor(i / 10) % 3;
      const hp = Math.floor(110 + diff * 130);
      const bx = endArena + 330;
      if (bCycle === 0) {
        enemies.push({ type: 'bowser', x: bx, y: 360, vx: -0.7, vy: 0, width: 72, height: 80, health: hp, maxHealth: hp, facing: 'left', attackTimer: 0, phase: 1 });
      } else if (bCycle === 1) {
        const kind = rivalKinds[Math.floor(r() * rivalKinds.length)];
        enemies.push({ type: 'rival_ninja', fighterKind: kind, x: bx, y: 390, vx: -1.5, vy: 0, width: 32, height: 48, health: Math.floor(hp * 0.7), maxHealth: Math.floor(hp * 0.7), facing: 'left', attackTimer: 0, specialCooldown: 1.8 });
      } else {
        const kind = gruntKinds[Math.floor(r() * gruntKinds.length)];
        enemies.push({ type: 'fighter_boss', fighterKind: kind, isBoss: true, x: bx, y: 380, vx: -1.5, vy: 0, width: 40, height: 58, health: hp, maxHealth: hp, facing: 'left', attackTimer: 0, specialCooldown: 1.6 });
      }
    }

    out.push({
      world: 9 + Math.floor(i / 10),
      level: (i % 10) + 1,
      name: `Classic Stage ${stageNo}`,
      nameAr: `المرحلة ${stageNo}: ${themeAr[theme]}${isBossStage ? ' والزعيم' : ''}`,
      theme,
      width,
      height: 480,
      startX: 60,
      startY: 380,
      goalX,
      hasBoss: isBossStage,
      hasRivalBoss: isBossStage,
      blocks,
      enemies,
    });
  }
  return out;
}

export const LEVEL_DEFINITIONS: LevelData[] = [...BASE_LEVELS, ...buildClassicLevels()];

function createGround(startX: number, totalWidth: number, y: number, height: number, type: 'stone' | 'lava'): Block[] {
  const blocks: Block[] = [];
  const step = 40;
  for (let x = startX; x < startX + totalWidth; x += step) {
    blocks.push({
      id: Math.floor(x + y * 10),
      x,
      y,
      width: Math.min(step, startX + totalWidth - x),
      height,
      type,
    });
  }
  return blocks;
}

function createBridge(startX: number, totalWidth: number, y: number, height: number): Block[] {
  const blocks: Block[] = [];
  const plankWidth = 30;
  for (let x = startX; x < startX + totalWidth; x += plankWidth) {
    blocks.push({
      id: Math.floor(x + y * 10 + 50000),
      x,
      y,
      width: plankWidth,
      height,
      type: 'bridge',
    });
  }
  return blocks;
}

function createStairs(startX: number, groundY: number, steps: number, blockSize: number, direction: 1 | -1): Block[] {
  const blocks: Block[] = [];
  for (let i = 0; i < steps; i++) {
    const colHeight = i + 1;
    const x = direction === 1 ? startX + i * blockSize : startX + (steps - 1 - i) * blockSize;
    for (let j = 0; j < colHeight; j++) {
      const y = groundY - (j + 1) * blockSize;
      blocks.push({
        id: Math.floor(x * 10 + y),
        x,
        y,
        width: blockSize,
        height: blockSize,
        type: 'stone',
      });
    }
  }
  return blocks;
}

function createPyramid(startX: number, groundY: number, steps: number, plateauWidth: number, blockSize: number): Block[] {
  const blocks: Block[] = [];
  // Ascending stairs
  for (let i = 0; i < steps; i++) {
    const colHeight = i + 1;
    const x = startX + i * blockSize;
    for (let j = 0; j < colHeight; j++) {
      const y = groundY - (j + 1) * blockSize;
      blocks.push({
        id: Math.floor(x * 10 + y + 1000),
        x,
        y,
        width: blockSize,
        height: blockSize,
        type: 'stone',
      });
    }
  }

  // Plateau
  const plateauStartX = startX + steps * blockSize;
  for (let px = plateauStartX; px < plateauStartX + plateauWidth; px += blockSize) {
    for (let j = 0; j < steps; j++) {
      const y = groundY - (j + 1) * blockSize;
      blocks.push({
        id: Math.floor(px * 10 + y + 2000),
        x: px,
        y,
        width: blockSize,
        height: blockSize,
        type: 'stone',
      });
    }
  }

  // Descending stairs
  const descStartX = plateauStartX + plateauWidth;
  for (let i = 0; i < steps; i++) {
    const colHeight = steps - i;
    const x = descStartX + i * blockSize;
    for (let j = 0; j < colHeight; j++) {
      const y = groundY - (j + 1) * blockSize;
      blocks.push({
        id: Math.floor(x * 10 + y + 3000),
        x,
        y,
        width: blockSize,
        height: blockSize,
        type: 'stone',
      });
    }
  }

  return blocks;
}

