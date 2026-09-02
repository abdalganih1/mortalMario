export type FighterId = 'subzero' | 'scorpion' | 'noob' | 'raiden' | 'reptile';

export interface FighterConfig {
  id: FighterId;
  name: string;
  nameAr: string;
  title: string;
  primaryColor: string;
  accentColor: string;
  description: string;
  avatar: string;
  special1Name: string;
  special1Desc: string;
  special2Name: string;
  special2Desc: string;
  quote: string;
}

export type GameState = 'character_select' | 'playing' | 'paused' | 'stage_clear' | 'game_over' | 'victory';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  character: FighterId;
  health: number;
  maxHealth: number;
  lives: number;
  score: number;
  coins: number;
  isAttacking: boolean;
  attackTimer: number;
  attackType: 'punch' | 'uppercut' | 'special1' | 'special2' | null;
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  upShiftCooldown: number; // Cooldown specifically for Upward Super Shift
  hasAirShift: boolean; // Must touch ground to recharge Up Shift in mid-air
  isSliding?: boolean;
  slideTimer?: number;
  special1Cooldown: number;
  special2Cooldown: number;
  isInvincible: boolean;
  invincibleTimer: number;
  powerUp: 'none' | 'mushroom' | 'flower';
  powerUpTimer: number;
  animationFrame: number;
  walkCycle: number;
}

export interface Enemy {
  id: number;
  type: 'goomba' | 'koopa' | 'piranha' | 'bowser' | 'rival_ninja';
  rivalFighter?: FighterId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  facing: 'left' | 'right';
  isAlive: boolean;
  isFrozen: boolean;
  freezeTimer: number;
  animationTimer: number;
  // Specific to Bowser boss & Rival Ninja Boss
  attackTimer?: number;
  specialCooldown?: number;
  phase?: number;
  isBridgeFallen?: boolean;
}

export interface Block {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'question' | 'brick' | 'stone' | 'pipe' | 'pipe_top' | 'lava' | 'bridge' | 'axe';
  content?: 'coin' | 'mushroom' | 'flower' | 'empty';
  isHit?: boolean;
  bounceOffset?: number;
  isDestroyed?: boolean;
}

export interface Item {
  id: number;
  type: 'coin' | 'mushroom' | 'flower';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  collected: boolean;
  emerging: boolean;
  emergeY: number;
}

export interface Projectile {
  id: number;
  type: 'ice_blast' | 'spear' | 'shadow_clone' | 'shadow_ball' | 'bowser_fire' | 'fireball' | 'lightning' | 'acid_spit';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  owner: 'player' | 'enemy';
  duration: number;
  active: boolean;
  facing: 'left' | 'right';
  effect?: 'freeze' | 'pull' | 'tackle';
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'square' | 'spark' | 'smoke';
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  scale: number;
}

export interface LevelData {
  world: number;
  level: number;
  name: string;
  nameAr: string;
  theme: 'overworld' | 'underground' | 'castle' | 'desert' | 'airship' | 'netherrealm';
  width: number;
  height: number;
  startX: number;
  startY: number;
  goalX: number;
  blocks: Block[];
  enemies: Omit<Enemy, 'id' | 'isAlive' | 'isFrozen' | 'freezeTimer' | 'animationTimer'>[];
  hasBoss?: boolean;
  hasRivalBoss?: boolean;
}

export interface SlideItem {
  id: number;
  title: string;
  category: string;
  summary: string;
  diagramType: 'controls' | 'combat' | 'boxes' | 'boss' | 'audio' | 'uppercut' | 'worlds';
  keyPoints: string[];
  questions: {
    id: string;
    question: string;
    answer?: string;
    timestamp: string;
  }[];
}
