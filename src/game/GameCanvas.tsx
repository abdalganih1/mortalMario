import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FighterId,
  Player,
  Enemy,
  Block,
  Item,
  Projectile,
  Particle,
  FloatingText,
  GameState,
} from '../types';
import { LEVEL_DEFINITIONS } from './levels';
import { SpriteRenderer } from './sprites';
import { soundManager } from '../audio/soundEffects';
import { saveStageCleared, isMoveUnlocked, MOVE_UNLOCK, MOVE_NAMES, FIGHTERS } from './characters';
import { MobileControls } from '../components/MobileControls';
import { GameHUD } from '../components/GameHUD';

interface GameCanvasProps {
  character: FighterId;
  onOpenGuide: () => void;
  onOpenSelectFighter: () => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  character,
  onOpenGuide,
  onOpenSelectFighter,
  gameState,
  setGameState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Level progression state
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(400);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bossEnemyState, setBossEnemyState] = useState<Enemy | null>(null);

  // Cooldown states for UI
  const [dashCd, setDashCd] = useState<number>(0);
  const [upShiftCd, setUpShiftCd] = useState<number>(0);
  const [hasAirShiftState, setHasAirShiftState] = useState<boolean>(true);
  const [isGroundedState, setIsGroundedState] = useState<boolean>(true);
  const [special1Cd, setSpecial1Cd] = useState<number>(0);
  const [special2Cd, setSpecial2Cd] = useState<number>(0);

  // Game Engine Entities stored in refs for 60fps loop performance
  const playerRef = useRef<Player>({
    x: 60,
    y: 380,
    vx: 0,
    vy: 0,
    width: 28,
    height: 48,
    isGrounded: false,
    facing: 'right',
    character,
    health: 3,
    maxHealth: 3,
    blood: 100,
    maxBlood: 100,
    isBlocking: false,
    isCrouching: false,
    crouchUppercut: false,
    lives: 3,
    score: 0,
    coins: 0,
    isAttacking: false,
    attackTimer: 0,
    attackType: null,
    isDashing: false,
    dashTimer: 0,
    dashCooldown: 0,
    upShiftCooldown: 0,
    hasAirShift: true,
    isSliding: false,
    slideTimer: 0,
    special1Cooldown: 0,
    special2Cooldown: 0,
    isInvincible: false,
    invincibleTimer: 0,
    powerUp: 'none',
    powerUpTimer: 0,
    animationFrame: 0,
    walkCycle: 0,
  });

  const blocksRef = useRef<Block[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const itemsRef = useRef<Item[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const cameraRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const screenShakeRef = useRef<number>(0);

  // Input states
  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    jump: boolean;
    dash: boolean;
    down: boolean;
    block: boolean;
    attack: boolean;
    special1: boolean;
    special2: boolean;
  }>({
    left: false,
    right: false,
    jump: false,
    dash: false,
    attack: false,
    special1: false,
    special2: false,
    down: false,
    block: false,
  });

  // Live mirrors for keyboard shortcuts (avoid stale closures)
  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;
  const levelIdxRef = useRef<number>(0);
  const bossWarnRef = useRef<number>(0);
  const [unlockedNow, setUnlockedNow] = useState<FighterId[]>([]);

  // Locked-move feedback (moves unlock stage by stage!)
  const lockedMsg = (move: keyof typeof MOVE_UNLOCK) => {
    soundManager.playError();
    floatingTextsRef.current.push({
      id: Math.random(),
      text: `🔒 ${MOVE_NAMES[move]} — ينفتح بالمرحلة ${MOVE_UNLOCK[move] + 1}!`,
      x: playerRef.current.x + playerRef.current.width / 2,
      y: playerRef.current.y - 14,
      vy: -1.2,
      color: '#fca5a5',
      alpha: 1,
      scale: 1.15,
    });
  };

  // Double-tap timing tracking refs (for Jump -> Up Shift, Left/Right -> Dash, Punch -> Close Special)
  const lastLeftTapRef = useRef<number>(0);
  const lastRightTapRef = useRef<number>(0);
  const lastJumpTapRef = useRef<number>(0);
  const lastPunchTapRef = useRef<number>(0);
  const lastLeftKeyRef = useRef<number>(0);
  const lastRightKeyRef = useRef<number>(0);
  const lastJumpKeyRef = useRef<number>(0);
  const lastPunchKeyRef = useRef<number>(0);

  // Keep player character in sync with props
  useEffect(() => {
    playerRef.current.character = character;
  }, [character]);

  // Mushroom growth: BIG fighter (Mario-style) — feet stay planted
  const growPlayer = () => {
    const p = playerRef.current;
    if (p.height < 62) {
      const dh = 62 - p.height;
      p.height = 62;
      p.width = 34;
      p.y -= dh;
    }
  };

  // Shrink back to small
  const shrinkPlayer = () => {
    const p = playerRef.current;
    if (p.height > 48) {
      const dh = p.height - 48;
      p.height = 48;
      p.width = 28;
      p.y += dh;
    }
  };

  // Load a level
  const loadLevel = useCallback((levelIdx: number) => {
    const levelDef = LEVEL_DEFINITIONS[levelIdx] || LEVEL_DEFINITIONS[0];
    blocksRef.current = JSON.parse(JSON.stringify(levelDef.blocks));

    // Determine rival ninja for this player character (lore-based match)
    const playerChar = playerRef.current.character;
    const rivalMap: Record<FighterId, FighterId> = {
      subzero: 'scorpion',
      scorpion: 'subzero',
      noob: 'subzero',
      raiden: 'noob',
      reptile: 'raiden',
      baraka: 'liukang',
      liukang: 'shangtsung',
      kitana: 'baraka',
      shangtsung: 'liukang',
      kunglao: 'shangtsung',
      johnnycage: 'sonya',
      jax: 'johnnycage',
      sonya: 'jax',
    };
    const assignedRival = rivalMap[playerChar] || 'scorpion';

    enemiesRef.current = levelDef.enemies.map((e, idx) => ({
      ...e,
      id: idx + 1,
      homeX: e.x,
      isAlive: true,
      isFrozen: false,
      freezeTimer: 0,
      animationTimer: 0,
      attackTimer: 0,
      fighterKind: e.type === 'rival_ninja' || e.type === 'kombatant' || e.type === 'fighter_boss' ? (e.fighterKind || assignedRival) : e.fighterKind,
    }));
    itemsRef.current = [];
    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];

    // Reset player position & states
    playerRef.current.x = levelDef.startX;
    playerRef.current.y = levelDef.startY;
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
    playerRef.current.isGrounded = false;
    playerRef.current.isDashing = false;
    playerRef.current.blood = playerRef.current.maxBlood;
    playerRef.current.health = 3;
    playerRef.current.isBlocking = false;
    playerRef.current.isCrouching = false;
    playerRef.current.crouchUppercut = false;
    playerRef.current.upShiftCooldown = 0;
    playerRef.current.hasAirShift = true;
    playerRef.current.isSliding = false;
    playerRef.current.slideTimer = 0;
    playerRef.current.isAttacking = false;
    setUpShiftCd(0);
    setHasAirShiftState(true);
    setIsGroundedState(false);

    cameraRef.current = { x: 0, y: 0 };
    setTimeRemaining(400);
    setCurrentLevelIndex(levelIdx);
    levelIdxRef.current = levelIdx;

    // Spawn protection: 2s shield so bosses can't spawn-kill you
    playerRef.current.isInvincible = true;
    playerRef.current.invincibleTimer = Math.max(playerRef.current.invincibleTimer, 2.0);

    const boss = enemiesRef.current.find(e => e.type === 'bowser' || e.type === 'rival_ninja' || e.type === 'fighter_boss' || (e.type === 'kombatant' && e.isBoss));
    setBossEnemyState(boss || null);
  }, []);

  // Initialize first level
  useEffect(() => {
    loadLevel(currentLevelIndex);
  }, [loadLevel, currentLevelIndex]);

  // Handle Keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling on game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Shift', 'KeyW', 'KeyA', 'KeyD', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }

      const now = performance.now();

      // ENTER: desktop shortcut — stage_clear -> next stage, game_over -> retry SAME stage
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        if (gameStateRef.current === 'stage_clear') {
          const nxt = levelIdxRef.current + 1;
          if (nxt < LEVEL_DEFINITIONS.length) {
            loadLevel(nxt);
            setGameState('playing');
          } else {
            setGameState('victory');
          }
        } else if (gameStateRef.current === 'game_over') {
          playerRef.current.lives = 3;
          playerRef.current.blood = playerRef.current.maxBlood;
          playerRef.current.health = 3;
          loadLevel(levelIdxRef.current);
          setGameState('playing');
        }
        return;
      }

      // LEFT (Single press moves left, double-tap dashes left)
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysRef.current.left = true;
        if (!e.repeat) {
          if (now - lastLeftKeyRef.current < 320) {
            triggerDash('left');
            lastLeftKeyRef.current = 0;
          } else {
            lastLeftKeyRef.current = now;
          }
        }
      }

      // RIGHT (Single press moves right, double-tap dashes right)
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysRef.current.right = true;
        if (!e.repeat) {
          if (now - lastRightKeyRef.current < 320) {
            triggerDash('right');
            lastRightKeyRef.current = 0;
          } else {
            lastRightKeyRef.current = now;
          }
        }
      }

      // JUMP (Single press jumps, double-tap executes Up Shift Leap)
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        keysRef.current.jump = true;
        if (!e.repeat) {
          if (now - lastJumpKeyRef.current < 350) {
            triggerDash('up');
            lastJumpKeyRef.current = 0;
          } else {
            lastJumpKeyRef.current = now;
          }
        }
      }

      // SHIFT KEY (Direct hotkey for quick Dash)
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        if (keysRef.current.jump || !playerRef.current.isGrounded) {
          triggerDash('up');
        } else {
          triggerDash('forward');
        }
      }
      // DOWN / CROUCH + PIPE ENTER (ArrowDown or S)
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        keysRef.current.down = true;
        tryPipeWarp();
      }
      // BLOCK / DEFEND (hold F)
      if (e.code === 'KeyF') {
        keysRef.current.block = true;
      }
      if (e.code === 'KeyE') {
        triggerDash('up');
      }

      // ATTACK (Single tap = punch/uppercut, Double-tap = Close Special 1)
      if (e.code === 'KeyJ' || e.code === 'KeyZ') {
        if (!e.repeat) {
          if (now - lastPunchKeyRef.current < 330) {
            triggerAttack('special2'); // Close special
            lastPunchKeyRef.current = 0;
          } else {
            triggerAttack('punch');
            lastPunchKeyRef.current = now;
          }
        }
      }

      // RANGED SPECIAL (Dedicated key for Ranged Special 2)
      if (e.code === 'KeyK' || e.code === 'KeyX') {
        triggerAttack('special1');
      }

      // DIRECT CLOSE SPECIAL KEY
      if (e.code === 'KeyL' || e.code === 'KeyC') {
        triggerAttack('special2');
      }

      if (e.code === 'KeyP') {
        setGameState(prev => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') keysRef.current.jump = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keysRef.current.down = false;
      if (e.code === 'KeyF') keysRef.current.block = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handlePlayerDeath();
          return 400;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Dash execution (Forward, Upward Super Shift Leap, or Directional Left/Right)
  const triggerDash = (direction: 'forward' | 'up' | 'left' | 'right' = 'forward') => {
    const p = playerRef.current;
    const isUpward = direction === 'up';

    const particleColor =
      p.character === 'subzero'
        ? '#00e5ff'
        : p.character === 'scorpion'
        ? '#ff7700'
        : p.character === 'raiden'
        ? '#38bdf8'
        : p.character === 'reptile'
        ? '#22c55e'
        : '#a855f7';

    if (isUpward) {
      // Grounded = INSTANT refresh: the moment you touch earth the shift is ready again!
      // (double up-shifts in a row work — no timer lock while grounded)
      if (p.isGrounded) {
        p.upShiftCooldown = 0;
        p.hasAirShift = true;
      }

      // Up-shift unlocks at stage 4 — earn it!
      if (!isMoveUnlocked('upshift', levelIdxRef.current)) {
        lockedMsg('upshift');
        return;
      }

      // 1. Check cooldown (airborne only — ground is always free)
      if ((p.upShiftCooldown || 0) > 0) {
        soundManager.playError();
        floatingTextsRef.current.push({
          id: Math.random(),
          text: `WAIT ${Math.ceil(p.upShiftCooldown || 0)}s ⏳`,
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.4,
          color: '#ef4444',
          alpha: 1,
          scale: 1.1,
        });
        return;
      }

      // 2. Check ground-touch recharge
      if (!p.isGrounded && !p.hasAirShift) {
        soundManager.playError();
        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'TOUCH GROUND! ⛔',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.4,
          color: '#f97316',
          alpha: 1,
          scale: 1.1,
        });
        return;
      }

      // Consume ground charge & trigger cooldown
      p.hasAirShift = false;
      setHasAirShiftState(false);
      p.upShiftCooldown = 4.5;
      setUpShiftCd(4.5);

      p.isDashing = true;
      p.dashTimer = 0.3;
      p.dashCooldown = 0.7;
      p.isInvincible = true;
      p.invincibleTimer = 0.45;

      // Powerful Upward Super Leap (شيفت للأعلى) - launches player 270px high!
      p.vy = -16.8;
      p.vx = p.facing === 'right' ? 3.0 : -3.0;
      p.isGrounded = false;
      setIsGroundedState(false);
      soundManager.playJump();
      soundManager.playDash();

      // Floating text feedback
      floatingTextsRef.current.push({
        id: Math.random(),
        text: 'UP SHIFT! 🚀',
        x: p.x + p.width / 2,
        y: p.y - 12,
        vy: -1.8,
        color: '#f59e0b',
        alpha: 1,
        scale: 1.3,
      });

      // Downward jet particle blast under feet
      for (let i = 0; i < 12; i++) {
        particlesRef.current.push({
          id: Math.random(),
          x: p.x + p.width / 2 + (Math.random() - 0.5) * 20,
          y: p.y + p.height,
          vx: (Math.random() - 0.5) * 5,
          vy: Math.random() * 4 + 2,
          color: particleColor,
          size: Math.random() * 7 + 4,
          alpha: 1,
          decay: 0.05,
          shape: 'smoke',
        });
      }
    } else {
      // Horizontal directional dash sprint (unlocks at stage 2!)
      if (!isMoveUnlocked('dash', levelIdxRef.current)) {
        lockedMsg('dash');
        return;
      }
      if (p.dashCooldown > 0 || p.isDashing) return;

      if (direction === 'left') {
        p.facing = 'left';
      } else if (direction === 'right') {
        p.facing = 'right';
      }

      p.isDashing = true;
      p.dashTimer = 0.22;
      p.dashCooldown = 0.6;
      p.isInvincible = true;
      p.invincibleTimer = 0.4;

      // Instant forward surge in facing direction
      const speed = 10.0;
      p.vx = p.facing === 'right' ? speed : -speed;
      soundManager.playDash();

      floatingTextsRef.current.push({
        id: Math.random(),
        text: p.facing === 'left' ? '⚡ DASH ◀' : '⚡ DASH ▶',
        x: p.x + p.width / 2,
        y: p.y - 12,
        vy: -1.6,
        color: '#f59e0b',
        alpha: 1,
        scale: 1.15,
      });

      // Spawn elemental dash trail particles behind player
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
          id: Math.random(),
          x: p.x + (p.facing === 'right' ? -10 : 38),
          y: p.y + Math.random() * p.height,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 2,
          color: particleColor,
          size: Math.random() * 6 + 3,
          alpha: 1,
          decay: 0.05,
          shape: 'smoke',
        });
      }
    }
  };

  // Attack execution
  const triggerAttack = (type: 'punch' | 'special1' | 'special2') => {
    const p = playerRef.current;

    if (type === 'punch') {
      if (p.isAttacking) return;
      p.isAttacking = true;

      // CLASSIC MK UPPERCUT: crouch + punch = the famous rising fist! (also jump-held or airborne)
      const isCrouchHit = keysRef.current.down && p.isGrounded;
      const isUppercut = keysRef.current.jump || !p.isGrounded || isCrouchHit;
      p.crouchUppercut = isCrouchHit;
      p.attackTimer = isUppercut ? 0.35 : 0.25;
      p.attackType = isUppercut ? 'uppercut' : 'punch';

      if (isUppercut) {
        soundManager.playUppercut();
        screenShakeRef.current = 6;
      } else {
        soundManager.playPunch();
      }

      // Melee check against enemies in front
      const attackRange = isUppercut ? 52 : 45;
      const attackX = p.facing === 'right' ? p.x + p.width : p.x - attackRange;
      const attackY = isUppercut ? p.y - 12 : p.y + 10;

      let hitAny = false;
      enemiesRef.current.forEach(e => {
        if (!e.isAlive) return;
        // Stationary shells get KICKED by punches (never punched through)
        if (e.type === 'koopa' && e.inShell && !e.shellVx) {
          if (
            attackX < e.x + e.width &&
            attackX + attackRange > e.x &&
            attackY < e.y + e.height &&
            attackY + (isUppercut ? 50 : 30) > e.y
          ) {
            e.shellVx = p.facing === 'right' ? 6.5 : -6.5;
            e.shellTimer = 6;
            hitAny = true;
            p.score += 100;
            soundManager.playPunch();
            floatingTextsRef.current.push({
              id: Math.random(),
              text: 'SHELL KICK! 🐢💨 +100',
              x: e.x + e.width / 2,
              y: e.y - 12,
              vy: -1.4,
              color: '#bbf7d0',
              alpha: 1,
              scale: 1.1,
            });
          }
          return;
        }
        if (
          attackX < e.x + e.width &&
          attackX + attackRange > e.x &&
          attackY < e.y + e.height &&
          attackY + (isUppercut ? 50 : 30) > e.y
        ) {
          hitAny = true;
          const damage = p.crouchUppercut ? 3 : isUppercut ? 2 : 1;
          applyDamageToEnemy(e, damage, isUppercut ? 'uppercut' : 'punch');

          if (isUppercut && e.isAlive) {
            // Launch enemy high into air with classic Mortal Kombat uppercut arc!
            // (crouch uppercut launches even higher — the famous MK juggle starter)
            e.vy = p.crouchUppercut ? -10.5 : -8.5;
            e.vx = p.facing === 'right' ? 3.5 : -3.5;
            if (e.type === 'kombatant' || e.type === 'fighter_boss' || e.type === 'rival_ninja') {
              e.isDizzy = true;
              e.dizzyTimer = 1.6;
            }
          }
        }
      });

      if (isUppercut) {
        floatingTextsRef.current.push({
          id: Math.random(),
          text: p.crouchUppercut ? 'CROUCH UPPERCUT! 💥👊' : 'UPPERCUT! 💥',
          x: p.x + p.width / 2,
          y: p.y - 16,
          vy: -1.6,
          color: '#f59e0b',
          alpha: 1,
          scale: 1.3,
        });

        if (hitAny && Math.random() < 0.4) {
          soundManager.playToasty();
          floatingTextsRef.current.push({
            id: Math.random(),
            text: 'TOASTY! 🔥',
            x: p.x + (p.facing === 'right' ? 50 : -50),
            y: p.y - 32,
            vy: -1.0,
            color: '#ef4444',
            alpha: 1,
            scale: 1.5,
          });
        }
      }
    } else if (type === 'special1') {
      // SPECIAL 1 (ranged): unlocks at stage 3!
      if (!isMoveUnlocked('special1', levelIdxRef.current)) {
        lockedMsg('special1');
        return;
      }
      // SPECIAL 1 (ranged): Sub-Zero / Scorpion / Noob / Raiden / Reptile / Baraka / Liu Kang / Kitana / Shang Tsung
      if (p.special1Cooldown > 0) return;
      p.special1Cooldown = 1.8;
      p.isAttacking = true;
      p.attackTimer = 0.3;
      p.attackType = 'special1';

      if (p.character === 'subzero') {
        // Ice Blast Projectile
        soundManager.playIceFreeze();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'ice_blast',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 20,
          y: p.y + 18,
          vx: p.facing === 'right' ? 6.5 : -6.5,
          vy: 0,
          width: 20,
          height: 20,
          damage: 20,
          owner: 'player',
          duration: 3.5,
          active: true,
          facing: p.facing,
          effect: 'freeze',
        });
      } else if (p.character === 'scorpion') {
        // Harpoon Spear Hook
        soundManager.playSpear();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'spear',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 25,
          y: p.y + 18,
          vx: p.facing === 'right' ? 8.0 : -8.0,
          vy: 0,
          width: 25,
          height: 14,
          damage: 25,
          owner: 'player',
          duration: 1.8,
          active: true,
          facing: p.facing,
          effect: 'pull',
        });
      } else if (p.character === 'noob') {
        // NOOB SAIBOT: SHADOW CLONE RUSH
        soundManager.playShadowClone();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'shadow_clone',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 30,
          y: p.y + 4,
          vx: p.facing === 'right' ? 7.2 : -7.2,
          vy: 0,
          width: 32,
          height: 44,
          damage: 30,
          owner: 'player',
          duration: 3.0,
          active: true,
          facing: p.facing,
          effect: 'tackle',
        });

        for (let i = 0; i < 10; i++) {
          particlesRef.current.push({
            id: Math.random(),
            x: p.x + 16,
            y: p.y + 24,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: '#7c3aed',
            size: Math.random() * 8 + 4,
            alpha: 1,
            decay: 0.04,
            shape: 'smoke',
          });
        }
      } else if (p.character === 'raiden') {
        // RAIDEN: LIGHTNING BOLT
        soundManager.playLightning();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'lightning',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 30,
          y: p.y + 16,
          vx: p.facing === 'right' ? 8.5 : -8.5,
          vy: 0,
          width: 28,
          height: 18,
          damage: 25,
          owner: 'player',
          duration: 3.0,
          active: true,
          facing: p.facing,
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'LIGHTNING BOLT! ⚡',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.5,
          color: '#38bdf8',
          alpha: 1,
          scale: 1.2,
        });
      } else if (p.character === 'reptile') {
        // REPTILE: ACID SPIT
        soundManager.playAcid();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'acid_spit',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 24,
          y: p.y + 16,
          vx: p.facing === 'right' ? 6.8 : -6.8,
          vy: 0,
          width: 24,
          height: 24,
          damage: 22,
          owner: 'player',
          duration: 3.0,
          active: true,
          facing: p.facing,
          effect: 'freeze',
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'ACID SPIT! 🦎',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.5,
          color: '#22c55e',
          alpha: 1,
          scale: 1.2,
        });
      } else if (p.character === 'baraka') {
        // BARAKA: BLADE SPARK (piercing ranged blades)
        soundManager.playFanThrow();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'blade_spark',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 26,
          y: p.y + 14,
          vx: p.facing === 'right' ? 7.5 : -7.5,
          vy: 0,
          width: 26,
          height: 18,
          damage: 26,
          owner: 'player',
          duration: 3.0,
          active: true,
          facing: p.facing,
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'BLADE SPARK! 🔪',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.5,
          color: '#f43f5e',
          alpha: 1,
          scale: 1.2,
        });
      } else if (p.character === 'liukang') {
        // LIU KANG: DRAGON FIREBALL
        soundManager.playTorpedo();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'dragon_fire',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 28,
          y: p.y + 14,
          vx: p.facing === 'right' ? 7.0 : -7.0,
          vy: 0,
          width: 28,
          height: 22,
          damage: 28,
          owner: 'player',
          duration: 3.2,
          active: true,
          facing: p.facing,
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'DRAGON FIRE! 🐉',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.5,
          color: '#f97316',
          alpha: 1,
          scale: 1.2,
        });
      } else if (p.character === 'kitana') {
        // KITANA: STEEL FAN THROW
        soundManager.playFanThrow();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'steel_fan',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 28,
          y: p.y + 14,
          vx: p.facing === 'right' ? 8.0 : -8.0,
          vy: 0,
          width: 28,
          height: 20,
          damage: 24,
          owner: 'player',
          duration: 3.0,
          active: true,
          facing: p.facing,
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'FAN THROW! 🪭',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.5,
          color: '#60a5fa',
          alpha: 1,
          scale: 1.2,
        });
      } else if (p.character === 'shangtsung') {
        // SHANG TSUNG: SOUL SKULL
        soundManager.playShadowClone();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'soul_skull',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 28,
          y: p.y + 14,
          vx: p.facing === 'right' ? 6.4 : -6.4,
          vy: 0,
          width: 28,
          height: 26,
          damage: 30,
          owner: 'player',
          duration: 3.5,
          active: true,
          facing: p.facing,
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'SOUL SKULL! 💀',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.5,
          color: '#a855f7',
          alpha: 1,
          scale: 1.2,
        });
      } else if (p.character === 'kunglao') {
        // KUNG LAO: RAZOR HAT THROW
        soundManager.playFanThrow();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'razor_hat',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 30,
          y: p.y + 12,
          vx: p.facing === 'right' ? 8.2 : -8.2,
          vy: 0,
          width: 30,
          height: 18,
          damage: 26,
          owner: 'player',
          duration: 3.0,
          active: true,
          facing: p.facing,
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'HAT THROW! 🎩',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.5,
          color: '#eab308',
          alpha: 1,
          scale: 1.2,
        });
      } else if (p.character === 'johnnycage') {
        // JOHNNY CAGE: GREEN FORCEBALL BOLT
        soundManager.playForceball();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'cage_bolt',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 26,
          y: p.y + 14,
          vx: p.facing === 'right' ? 7.4 : -7.4,
          vy: 0,
          width: 24,
          height: 24,
          damage: 26,
          owner: 'player',
          duration: 3.0,
          active: true,
          facing: p.facing,
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'CAGE BOLT! 🕶️',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.5,
          color: '#4ade80',
          alpha: 1,
          scale: 1.2,
        });
      } else if (p.character === 'jax') {
        // JAX: GROUND SHOCKWAVE
        soundManager.playBlockHit();
        screenShakeRef.current = 7;
        projectilesRef.current.push({
          id: Math.random(),
          type: 'shockwave',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 34,
          y: p.y + p.height - 26,
          vx: p.facing === 'right' ? 6.0 : -6.0,
          vy: 0,
          width: 34,
          height: 26,
          damage: 30,
          owner: 'player',
          duration: 3.0,
          active: true,
          facing: p.facing,
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'SHOCKWAVE! 🦾',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.5,
          color: '#94a3b8',
          alpha: 1,
          scale: 1.2,
        });
      } else if (p.character === 'sonya') {
        // SONYA: ENERGY RING
        soundManager.playLightning();
        projectilesRef.current.push({
          id: Math.random(),
          type: 'energy_ring',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 26,
          y: p.y + 14,
          vx: p.facing === 'right' ? 7.8 : -7.8,
          vy: 0,
          width: 24,
          height: 24,
          damage: 24,
          owner: 'player',
          duration: 3.0,
          active: true,
          facing: p.facing,
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'ENERGY RING! 💖',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.5,
          color: '#f472b6',
          alpha: 1,
          scale: 1.2,
        });
      }
    } else if (type === 'special2') {
      // SPECIAL 2 (close): unlocks at stage 5!
      if (!isMoveUnlocked('special2', levelIdxRef.current)) {
        lockedMsg('special2');
        return;
      }
      // SPECIAL 2 (close): Sub-Zero / Scorpion / Noob / Raiden / Reptile / Baraka / Liu Kang / Kitana / Shang Tsung
      if (p.special2Cooldown > 0) return;
      p.special2Cooldown = 1.8;
      p.isAttacking = true;
      p.attackTimer = 0.45;
      p.attackType = 'special2';

      if (p.character === 'subzero') {
        // --- SUB-ZERO ICONIC COLD SLIDE ---
        soundManager.playIceSlide();
        p.isSliding = true;
        p.slideTimer = 0.52; // Sustained 520ms glide
        p.isInvincible = true;
        p.invincibleTimer = 0.55;
        p.vx = p.facing === 'right' ? 9.8 : -9.8;
        screenShakeRef.current = 6;

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'COLD SLIDE! ❄️',
          x: p.x,
          y: p.y - 14,
          vy: -1.6,
          color: '#00f0ff',
          alpha: 1,
          scale: 1.3,
        });

        // Initial frost burst behind the slide
        for (let i = 0; i < 14; i++) {
          particlesRef.current.push({
            id: Math.random(),
            x: p.x + (p.facing === 'right' ? -6 : 34),
            y: p.y + p.height - 4,
            vx: (p.facing === 'right' ? -1 : 1) * (Math.random() * 4 + 1.5),
            vy: -Math.random() * 3 - 0.5,
            color: Math.random() > 0.35 ? '#00e5ff' : '#ffffff',
            size: Math.random() * 7 + 3,
            alpha: 1,
            decay: 0.04,
            shape: 'spark',
          });
        }
      } else if (p.character === 'scorpion') {
        // --- SCORPION HELLFIRE TELEPORT ---
        soundManager.playDash();
        soundManager.playBowserRoar();
        screenShakeRef.current = 7;

        // Smoke and fire burst at departure point
        for (let i = 0; i < 14; i++) {
          particlesRef.current.push({
            id: Math.random(),
            x: p.x + p.width / 2,
            y: p.y + p.height / 2,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
            size: Math.random() * 8 + 4,
            alpha: 1,
            decay: 0.04,
            shape: 'smoke',
          });
        }

        // Teleport 110px forward in facing direction
        p.x += p.facing === 'right' ? 110 : -110;
        p.vx = p.facing === 'right' ? 3 : -3;
        p.isInvincible = true;
        p.invincibleTimer = 0.4;

        // Smoke and flame burst at arrival point
        for (let i = 0; i < 14; i++) {
          particlesRef.current.push({
            id: Math.random(),
            x: p.x + p.width / 2,
            y: p.y + p.height / 2,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            color: '#fbbf24',
            size: Math.random() * 8 + 4,
            alpha: 1,
            decay: 0.04,
            shape: 'spark',
          });
        }

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'HELLFIRE TELEPORT! 🔥',
          x: p.x,
          y: p.y - 12,
          vy: -1.5,
          color: '#f97316',
          alpha: 1,
          scale: 1.3,
        });

        // Blast damage to all nearby enemies
        enemiesRef.current.forEach(e => {
          if (e.isAlive && Math.abs(e.x - p.x) < 70 && Math.abs(e.y - p.y) < 50) {
            applyDamageToEnemy(e, 2, 'fire');
          }
        });
      } else if (p.character === 'noob') {
        // --- NOOB SAIBOT DARK VORTEX ---
        soundManager.playShadowClone();
        screenShakeRef.current = 6;
        projectilesRef.current.push({
          id: Math.random(),
          type: 'shadow_ball',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 28,
          y: p.y + 14,
          vx: p.facing === 'right' ? 6.2 : -6.2,
          vy: 0,
          width: 28,
          height: 28,
          damage: 25,
          owner: 'player',
          duration: 3.5,
          active: true,
          facing: p.facing,
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'DARK VORTEX! 🌀',
          x: p.x,
          y: p.y - 12,
          vy: -1.5,
          color: '#a855f7',
          alpha: 1,
          scale: 1.3,
        });
      } else if (p.character === 'raiden') {
        // --- RAIDEN SUPERMAN TORPEDO DIVE ---
        soundManager.playTorpedo();
        screenShakeRef.current = 8;
        p.isDashing = true;
        p.dashTimer = 0.52;
        p.isInvincible = true;
        p.invincibleTimer = 0.6;
        p.vy = 0;
        p.vx = p.facing === 'right' ? 12.5 : -12.5;

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'TORPEDO FLY! ⚡',
          x: p.x,
          y: p.y - 14,
          vy: -1.6,
          color: '#38bdf8',
          alpha: 1,
          scale: 1.4,
        });

        // Hit enemies directly in the torpedo path
        enemiesRef.current.forEach(e => {
          if (e.isAlive && Math.abs(e.x - p.x) < 80 && Math.abs(e.y - p.y) < 40) {
            applyDamageToEnemy(e, 3, 'lightning');
            if (e.isAlive) {
              e.vy = -7;
              e.vx = p.facing === 'right' ? 5 : -5;
            }
          }
        });
      } else if (p.character === 'reptile') {
        // --- REPTILE FORCEBALL ---
        soundManager.playForceball();
        screenShakeRef.current = 6;
        projectilesRef.current.push({
          id: Math.random(),
          type: 'acid_spit',
          x: p.facing === 'right' ? p.x + p.width + 5 : p.x - 26,
          y: p.y + 14,
          vx: p.facing === 'right' ? 5.2 : -5.2,
          vy: 0,
          width: 26,
          height: 26,
          damage: 28,
          owner: 'player',
          duration: 4.0,
          active: true,
          facing: p.facing,
          effect: 'freeze',
        });

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'FORCEBALL ROLL! 🟢',
          x: p.x,
          y: p.y - 12,
          vy: -1.5,
          color: '#22c55e',
          alpha: 1,
          scale: 1.3,
        });
      } else if (p.character === 'baraka') {
        // --- BARAKA SHREDDER SPIN: whirling blades, invincible while spinning ---
        soundManager.playFanThrow();
        screenShakeRef.current = 8;
        p.isDashing = true;
        p.dashTimer = 0.5;
        p.isInvincible = true;
        p.invincibleTimer = 0.55;
        p.vx = p.facing === 'right' ? 8.5 : -8.5;

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'SHREDDER SPIN! 🔪',
          x: p.x,
          y: p.y - 14,
          vy: -1.6,
          color: '#f43f5e',
          alpha: 1,
          scale: 1.4,
        });

        enemiesRef.current.forEach(e => {
          if (e.isAlive && Math.abs(e.x - p.x) < 85 && Math.abs(e.y - p.y) < 50) {
            applyDamageToEnemy(e, 3, 'blades');
          }
        });
      } else if (p.character === 'liukang') {
        // --- LIU KANG BICYCLE KICK: flying multi-hit kick rush ---
        soundManager.playUppercut();
        screenShakeRef.current = 8;
        p.isDashing = true;
        p.dashTimer = 0.55;
        p.isInvincible = true;
        p.invincibleTimer = 0.6;
        p.vy = -2;
        p.vx = p.facing === 'right' ? 10.5 : -10.5;

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'BICYCLE KICK! 🐉🦵',
          x: p.x,
          y: p.y - 14,
          vy: -1.6,
          color: '#f97316',
          alpha: 1,
          scale: 1.4,
        });

        enemiesRef.current.forEach(e => {
          if (e.isAlive && Math.abs(e.x - p.x) < 90 && Math.abs(e.y - p.y) < 55) {
            applyDamageToEnemy(e, 2, 'projectile');
            if (e.isAlive) {
              e.vy = -6;
              e.vx = p.facing === 'right' ? 4 : -4;
            }
          }
        });
      } else if (p.character === 'kitana') {
        // --- KITANA FAN LIFT: rising fan uppercut lifts ALL nearby enemies ---
        soundManager.playUppercut();
        screenShakeRef.current = 7;

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'FAN LIFT! 🪭',
          x: p.x,
          y: p.y - 14,
          vy: -1.6,
          color: '#60a5fa',
          alpha: 1,
          scale: 1.4,
        });

        enemiesRef.current.forEach(e => {
          if (e.isAlive && Math.abs(e.x - p.x) < 75 && Math.abs(e.y - p.y) < 60) {
            applyDamageToEnemy(e, 3, 'uppercut');
            if (e.isAlive) {
              e.vy = -9.5;
              e.vx = p.facing === 'right' ? 3 : -3;
              if (e.type === 'kombatant' || e.type === 'fighter_boss' || e.type === 'rival_ninja') {
                e.isDizzy = true;
                e.dizzyTimer = 1.8;
              }
            }
          }
        });
      } else if (p.character === 'shangtsung') {
        // --- SHANG TSUNG SHADOW MORPH: demonic shadow rush, fully invincible ---
        soundManager.playShadowClone();
        screenShakeRef.current = 9;
        p.isDashing = true;
        p.dashTimer = 0.55;
        p.isInvincible = true;
        p.invincibleTimer = 0.65;
        p.vx = p.facing === 'right' ? 11 : -11;

        for (let i = 0; i < 16; i++) {
          particlesRef.current.push({
            id: Math.random(),
            x: p.x + p.width / 2,
            y: p.y + p.height / 2,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            color: Math.random() > 0.4 ? '#a855f7' : '#22c55e',
            size: Math.random() * 8 + 4,
            alpha: 1,
            decay: 0.04,
            shape: 'smoke',
          });
        }

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'SHADOW MORPH! 💀',
          x: p.x,
          y: p.y - 12,
          vy: -1.5,
          color: '#a855f7',
          alpha: 1,
          scale: 1.4,
        });

        enemiesRef.current.forEach(e => {
          if (e.isAlive && Math.abs(e.x - p.x) < 85 && Math.abs(e.y - p.y) < 55) {
            applyDamageToEnemy(e, 3, 'tackle');
          }
        });
      } else if (p.character === 'kunglao') {
        // --- KUNG LAO HAT CYCLONE: whirling tornado dash ---
        soundManager.playFanThrow();
        screenShakeRef.current = 8;
        p.isDashing = true;
        p.dashTimer = 0.5;
        p.isInvincible = true;
        p.invincibleTimer = 0.55;
        p.vx = p.facing === 'right' ? 9.0 : -9.0;

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'HAT CYCLONE! 🎩🌀',
          x: p.x,
          y: p.y - 14,
          vy: -1.6,
          color: '#eab308',
          alpha: 1,
          scale: 1.4,
        });

        enemiesRef.current.forEach(e => {
          if (e.isAlive && Math.abs(e.x - p.x) < 85 && Math.abs(e.y - p.y) < 50) {
            applyDamageToEnemy(e, 3, 'blades');
          }
        });
      } else if (p.character === 'johnnycage') {
        // --- JOHNNY CAGE SHADOW UPPERCUT: the famous one! ---
        soundManager.playUppercut();
        screenShakeRef.current = 9;

        floatingTextsRef.current.push({
          id: Math.random(),
          text: "SHADOW UPPERCUT! HERE'S JOHNNY! 🕶️",
          x: p.x,
          y: p.y - 14,
          vy: -1.6,
          color: '#4ade80',
          alpha: 1,
          scale: 1.4,
        });

        enemiesRef.current.forEach(e => {
          if (e.isAlive && Math.abs(e.x - p.x) < 80 && Math.abs(e.y - p.y) < 65) {
            applyDamageToEnemy(e, 3, 'uppercut');
            if (e.isAlive) {
              e.vy = -10;
              e.vx = p.facing === 'right' ? 3.5 : -3.5;
              if (e.type === 'kombatant' || e.type === 'fighter_boss' || e.type === 'rival_ninja') {
                e.isDizzy = true;
                e.dizzyTimer = 2.0;
              }
            }
          }
        });
      } else if (p.character === 'jax') {
        // --- JAX GOTCHA GRAB: rushing steel-fist combo ---
        soundManager.playPunch();
        screenShakeRef.current = 9;
        p.isDashing = true;
        p.dashTimer = 0.5;
        p.isInvincible = true;
        p.invincibleTimer = 0.55;
        p.vx = p.facing === 'right' ? 8.0 : -8.0;

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'GOTCHA GRAB! 🦾👊',
          x: p.x,
          y: p.y - 14,
          vy: -1.6,
          color: '#94a3b8',
          alpha: 1,
          scale: 1.4,
        });

        enemiesRef.current.forEach(e => {
          if (e.isAlive && Math.abs(e.x - p.x) < 80 && Math.abs(e.y - p.y) < 50) {
            applyDamageToEnemy(e, 2, 'punch');
            applyDamageToEnemy(e, 1, 'punch');
          }
        });
      } else if (p.character === 'sonya') {
        // --- SONYA SCISSOR KICK: flying double kick ---
        soundManager.playTorpedo();
        screenShakeRef.current = 8;
        p.isDashing = true;
        p.dashTimer = 0.55;
        p.isInvincible = true;
        p.invincibleTimer = 0.6;
        p.vy = -2;
        p.vx = p.facing === 'right' ? 10.5 : -10.5;

        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'SCISSOR KICK! 💖🦵',
          x: p.x,
          y: p.y - 14,
          vy: -1.6,
          color: '#f472b6',
          alpha: 1,
          scale: 1.4,
        });

        enemiesRef.current.forEach(e => {
          if (e.isAlive && Math.abs(e.x - p.x) < 90 && Math.abs(e.y - p.y) < 55) {
            applyDamageToEnemy(e, 2, 'projectile');
            if (e.isAlive) {
              e.vy = -6;
              e.vx = p.facing === 'right' ? 4 : -4;
            }
          }
        });
      }
    }
  };

  // Damage Enemy Logic
  const applyDamageToEnemy = (enemy: Enemy, dmg: number, source: string) => {
    // KOOPA SHELL RULES (classic Mario):
    if (enemy.type === 'koopa' && enemy.isAlive) {
      if (enemy.inShell && enemy.shellVx && (source === 'dash_tackle' || source === 'slide' || source === 'uppercut' || source === 'blades')) {
        dmg = 99; // smash the racing shell apart!
      } else if (!enemy.inShell && (source === 'stomp' || source === 'punch' || source === 'uppercut' || source === 'dash_tackle' || source === 'slide')) {
        // FIRST hit: the turtle hides inside its shell — now SAFE to touch!
        enemy.inShell = true;
        enemy.shellVx = 0;
        enemy.shellTimer = 7;
        enemy.vx = 0;
        playerRef.current.score += 100;
        soundManager.playPunch();
        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'SHELL UP! 🐢 +100',
          x: enemy.x + enemy.width / 2,
          y: enemy.y - 10,
          vy: -1.4,
          color: '#bbf7d0',
          alpha: 1,
          scale: 1.1,
        });
        return;
      }
    }
    // Kombatant guard: MK fighters sometimes BLOCK melee/projectile hits
    if (
      (enemy.type === 'kombatant' || enemy.type === 'fighter_boss' || enemy.type === 'rival_ninja') &&
      !enemy.isDizzy &&
      !enemy.isFrozen &&
      (source === 'punch' || source === 'uppercut' || source === 'projectile') &&
      Math.random() < (enemy.type === 'fighter_boss' ? 0.3 : 0.22)
    ) {
      enemy.enemyBlockTimer = 0.5;
      soundManager.playBlock();
      floatingTextsRef.current.push({
        id: Math.random(),
        text: 'BLOCKED!',
        x: enemy.x + enemy.width / 2,
        y: enemy.y - 10,
        vy: -1.4,
        color: '#93c5fd',
        alpha: 1,
        scale: 1.0,
      });
      return;
    }

    enemy.health -= dmg;

    // Floating text feedback
    floatingTextsRef.current.push({
      id: Math.random(),
      text: enemy.type === 'bowser' ? `-${dmg * 10} HP` : source === 'tackle' ? 'SHADOW SLAM!' : '+100',
      x: enemy.x + enemy.width / 2,
      y: enemy.y - 10,
      vy: -1.5,
      color: enemy.type === 'bowser' ? '#ff3b30' : '#facc15',
      alpha: 1,
      scale: 1.2,
    });

    // Blood / Spark / Shadow particles
    const particleColor =
      source === 'freeze' ? '#00e5ff' : source === 'fire' ? '#ff6600' : '#7c3aed';
    for (let i = 0; i < 6; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height / 2,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        color: particleColor,
        size: Math.random() * 5 + 3,
        alpha: 1,
        decay: 0.05,
        shape: 'spark',
      });
    }

    if (enemy.health <= 0) {
      enemy.isAlive = false;
      enemy.isDizzy = false;
      playerRef.current.score += enemy.type === 'bowser' || enemy.isBoss ? 5000 : 200;

      if (enemy.type === 'bowser' || enemy.isBoss) {
        // Mid-game bosses open the road onward — only the FINAL boss ends the game!
        handleBossDefeated();
      } else {
        soundManager.playPunch();
      }
    } else {
      // Enemy stagger back
      enemy.vx = enemy.facing === 'left' ? 2.5 : -2.5;
    }
  };

  // Player Takes Damage — MORTAL KOMBAT BLOOD SYSTEM (0-100) + DEFENSE
  const handlePlayerHurt = (dmg: number = 12) => {
    const p = playerRef.current;
    if (p.isInvincible || p.isDashing || p.isSliding) return;

    // DEFENSE: holding block on the ground absorbs almost everything (chip damage only)
    if (p.isBlocking && p.isGrounded) {
      const chip = Math.max(1, Math.round(dmg * 0.1));
      p.blood = Math.max(0, p.blood - chip);
      p.health = Math.max(1, Math.ceil((p.blood / p.maxBlood) * 3));
      soundManager.playBlock();
      floatingTextsRef.current.push({
        id: Math.random(),
        text: 'BLOCKED! 🛡️',
        x: p.x + p.width / 2,
        y: p.y - 12,
        vy: -1.4,
        color: '#93c5fd',
        alpha: 1,
        scale: 1.1,
      });
      for (let i = 0; i < 5; i++) {
        particlesRef.current.push({
          id: Math.random(),
          x: p.x + p.width / 2,
          y: p.y + p.height / 2,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          color: '#bfdbfe',
          size: Math.random() * 4 + 2,
          alpha: 1,
          decay: 0.08,
          shape: 'spark',
        });
      }
      if (p.blood <= 0) handlePlayerDeath();
      return;
    }

    // Fire flower shield: every petal absorbs one FULL hit — a real guard
    if (p.powerUp === 'flower') {
      p.flowerShield = Math.max(0, (p.flowerShield ?? 3) - 1);
      p.isInvincible = true;
      p.invincibleTimer = 1.0;
      soundManager.playBlock();
      screenShakeRef.current = Math.max(screenShakeRef.current, 3);
      if ((p.flowerShield ?? 0) <= 0) {
        p.powerUp = 'mushroom';
        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'SHIELD BROKEN! 🌸💔',
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.4,
          color: '#f9a8d4',
          alpha: 1,
          scale: 1.2,
        });
      } else {
        floatingTextsRef.current.push({
          id: Math.random(),
          text: `FLOWER SHIELD x${p.flowerShield}! 🌸🛡️`,
          x: p.x + p.width / 2,
          y: p.y - 12,
          vy: -1.4,
          color: '#fdba74',
          alpha: 1,
          scale: 1.1,
        });
      }
      return;
    } else if (p.powerUp === 'mushroom') {
      p.powerUp = 'none';
      shrinkPlayer();
      p.isInvincible = true;
      p.invincibleTimer = 1.0;
      soundManager.playPunch();
      floatingTextsRef.current.push({
        id: Math.random(),
        text: 'SHRUNK! 🍄',
        x: p.x + p.width / 2,
        y: p.y - 12,
        vy: -1.4,
        color: '#fca5a5',
        alpha: 1,
        scale: 1.0,
      });
      return;
    }

    p.blood = Math.max(0, p.blood - dmg);
    p.health = Math.max(0, Math.ceil((p.blood / p.maxBlood) * 3));

    // Blood burst particles (MK style)
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x: p.x + p.width / 2,
        y: p.y + p.height / 2,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5 - 1,
        color: Math.random() > 0.3 ? '#dc2626' : '#7f1d1d',
        size: Math.random() * 5 + 2,
        alpha: 1,
        decay: 0.05,
        shape: 'spark',
      });
    }

    p.isInvincible = true;
    p.invincibleTimer = 1.2;
    p.vy = -5.5; // bounce back
    p.vx = p.facing === 'right' ? -4 : 4;
    soundManager.playPunch();
    screenShakeRef.current = Math.max(screenShakeRef.current, 5);

    if (p.blood <= 0) {
      handlePlayerDeath();
    }
  };

  const handlePlayerDeath = () => {
    const p = playerRef.current;
    p.lives -= 1;
    soundManager.playGameOver();

    if (p.lives <= 0) {
      setGameState('game_over');
    } else {
      // Respawn at level start with full MK blood bar
      p.health = 3;
      p.blood = p.maxBlood;
      p.powerUp = 'none';
      p.flowerShield = 0;
      p.width = 28;
      p.height = 48;
      p.isBlocking = false;
      p.isCrouching = false;
      loadLevel(currentLevelIndex);
    }
  };

  // Complete level
  const handleStageClear = () => {
    soundManager.playVictory();
    // Persist progress + reveal newly unlocked fighters!
    const newly = saveStageCleared(levelIdxRef.current);
    setUnlockedNow(newly);
    setGameState('stage_clear');
  };

  // Next level transition
  const handleNextLevel = () => {
    setUnlockedNow([]);
    if (currentLevelIndex < LEVEL_DEFINITIONS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
      loadLevel(currentLevelIndex + 1);
      setGameState('playing');
    } else {
      setGameState('victory');
    }
  };

  // Boss defeated: FINAL level -> victory screen, any earlier boss -> stage clear (worlds keep coming!)
  const handleBossDefeated = () => {
    soundManager.playVictory();
    setTimeout(() => {
      if (levelIdxRef.current >= LEVEL_DEFINITIONS.length - 1) {
        setGameState('victory');
      } else {
        setGameState('stage_clear');
      }
    }, 2200);
  };

  // MAIN 60 FPS GAME LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Debug hook (?debug=1): state injection for automated testing
    try {
      if (new URLSearchParams(window.location.search).get('debug') === '1') {
        (window as unknown as Record<string, unknown>).__mmk = {
          player: playerRef.current,
          enemies: enemiesRef.current,
          loadLevel,
          triggerAttack,
          triggerDash,
          count: LEVEL_DEFINITIONS.length,
        };
      }
    } catch {
      /* ignore */
    }

    let animationFrameId: number;
    let lastTime = performance.now();

    const gameLoop = (now: number) => {
      // Re-register FIRST so no exception can ever freeze the game
      animationFrameId = requestAnimationFrame(gameLoop);
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap delta time
      lastTime = now;

      try {
        if (gameState === 'playing') {
          updateGame(dt);
        }
        renderGame(ctx, canvas);
      } catch (err) {
        // Survive + sanitize: NaN entities get reset instead of killing the loop
        console.warn('gameLoop recovered:', err);
        const p = playerRef.current;
        if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(p.vx) || !isFinite(p.vy)) {
          p.x = LEVEL_DEFINITIONS[currentLevelIndex]?.startX ?? 60;
          p.y = LEVEL_DEFINITIONS[currentLevelIndex]?.startY ?? 380;
          p.vx = 0;
          p.vy = 0;
        }
        enemiesRef.current = enemiesRef.current.filter(e => isFinite(e.x) && isFinite(e.y));
        projectilesRef.current = projectilesRef.current.filter(pr => isFinite(pr.x) && isFinite(pr.y));
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  // UPDATE TICK
  const updateGame = (dt: number) => {
    const p = playerRef.current;
    const levelDef = LEVEL_DEFINITIONS[currentLevelIndex];

    // Update timers & cooldowns
    if (screenShakeRef.current > 0) {
      screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
    }

    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      if (p.dashTimer <= 0) p.isDashing = false;
    }
    if (p.dashCooldown > 0) {
      p.dashCooldown -= dt;
      setDashCd(Math.max(0, p.dashCooldown));
    }
    if ((p.upShiftCooldown || 0) > 0) {
      p.upShiftCooldown = (p.upShiftCooldown || 0) - dt;
      setUpShiftCd(Math.max(0, p.upShiftCooldown));
    }
    if (p.special1Cooldown > 0) {
      p.special1Cooldown -= dt;
      setSpecial1Cd(Math.max(0, p.special1Cooldown));
    }
    if (p.special2Cooldown > 0) {
      p.special2Cooldown -= dt;
      setSpecial2Cd(Math.max(0, p.special2Cooldown));
    }
    if (p.attackTimer > 0) {
      p.attackTimer -= dt;
      if (p.attackTimer <= 0) {
        p.isAttacking = false;
        p.crouchUppercut = false;
      }
    }
    if (p.invincibleTimer > 0) {
      p.invincibleTimer -= dt;
      if (p.invincibleTimer <= 0) p.isInvincible = false;
    }

    // --- SUB-ZERO CONTINUOUS ICE SLIDE ENGINE ---
    if (p.isSliding) {
      p.slideTimer = (p.slideTimer || 0) - dt;
      // High-speed slide maintains velocity with zero friction slowdown
      p.vx = p.facing === 'right' ? 9.8 : -9.8;

      // Spawn continuous ice shards and frost trail
      for (let i = 0; i < 2; i++) {
        particlesRef.current.push({
          id: Math.random(),
          x: p.x + (p.facing === 'right' ? -4 : 32) + (Math.random() - 0.5) * 8,
          y: p.y + p.height - 2 + (Math.random() - 0.5) * 4,
          vx: (p.facing === 'right' ? -1 : 1) * (Math.random() * 3.5 + 1),
          vy: -Math.random() * 2 - 0.5,
          color: Math.random() > 0.35 ? '#00e5ff' : '#ffffff',
          size: Math.random() * 6 + 3,
          alpha: 1,
          decay: 0.06,
          shape: 'spark',
        });
      }

      // Continuous active hitbox during the entire slide duration
      enemiesRef.current.forEach(e => {
        if (!e.isAlive) return;
        if (
          p.x < e.x + e.width + 12 &&
          p.x + p.width + 12 > e.x &&
          p.y < e.y + e.height &&
          p.y + p.height > e.y
        ) {
          applyDamageToEnemy(e, e.type === 'bowser' ? 2 : 2, 'slide');
          if (e.isAlive && e.type !== 'bowser') {
            e.isFrozen = true;
            e.freezeTimer = 3.5;
            e.vy = -6.5; // knock upward into air!
            e.vx = p.facing === 'right' ? 4 : -4;
          }
          soundManager.playIceFreeze();
          screenShakeRef.current = 8;
        }
      });

      if ((p.slideTimer || 0) <= 0) {
        p.isSliding = false;
        p.slideTimer = 0;
      }
    }

    // --- PLAYER MOVEMENT & INPUT PHYSICS ---
    const keys = keysRef.current;

    // MK STANCES: hold Block to defend, hold Down to crouch (both root you in place)
    p.isBlocking = !!keys.block && p.isGrounded && !p.isDashing && !p.isSliding;
    p.isCrouching = !!keys.down && p.isGrounded && !p.isDashing && !p.isSliding && !p.isBlocking;

    const accel = 0.8;
    const maxSpeed = 4.2;
    const friction = 0.82;
    const gravity = 0.52;

    if (!p.isDashing && !p.isSliding) {
      if (p.isBlocking || p.isCrouching) {
        // Rooted stance: heavy friction, no acceleration
        p.vx *= 0.7;
        if (Math.abs(p.vx) < 0.3) p.vx = 0;
      } else if (keys.left) {
        p.vx -= accel;
        p.facing = 'left';
        p.walkCycle += 1;
      } else if (keys.right) {
        p.vx += accel;
        p.facing = 'right';
        p.walkCycle += 1;
      } else {
        p.vx *= friction;
        if (Math.abs(p.vx) < 0.1) p.vx = 0;
      }

      // Clamp max horizontal speed
      if (p.vx > maxSpeed) p.vx = maxSpeed;
      if (p.vx < -maxSpeed) p.vx = -maxSpeed;
    }

    // Jump
    if (keys.jump && p.isGrounded) {
      p.vy = -12.5; // solid responsive jump height
      p.isGrounded = false;
      soundManager.playJump();
    }

    // Apply gravity
    p.vy += gravity;
    if (p.vy > 11) p.vy = 11; // terminal velocity

    // Move player horizontally
    p.x += p.vx;
    // Boundary check
    if (p.x < 0) p.x = 0;

    // Horizontal block collisions
    blocksRef.current.forEach(block => {
      if (block.isDestroyed || block.type === 'lava') return;
      if (
        p.x < block.x + block.width &&
        p.x + p.width > block.x &&
        p.y < block.y + block.height &&
        p.y + p.height > block.y
      ) {
        if (p.isSliding) {
          p.isSliding = false;
          p.slideTimer = 0;
        }
        if (p.vx > 0) {
          p.x = block.x - p.width;
          p.vx = 0;
        } else if (p.vx < 0) {
          p.x = block.x + block.width;
          p.vx = 0;
        }
      }
    });

    // Move player vertically
    p.y += p.vy;
    p.isGrounded = false;

    // Vertical block collisions (Standing on top or hitting from below)
    blocksRef.current.forEach(block => {
      if (block.isDestroyed) return;

      // Handle Golden Axe touch in World 3
      if (block.type === 'axe') {
        if (
          p.x < block.x + block.width &&
          p.x + p.width > block.x &&
          p.y < block.y + block.height &&
          p.y + p.height > block.y
        ) {
          // Player hit the golden axe switch!
          triggerAxeBridgeCollapse();
        }
        return;
      }

      // Handle lava collision
      if (block.type === 'lava') {
        if (
          p.x < block.x + block.width &&
          p.x + p.width > block.x &&
          p.y + p.height > block.y + 10 &&
          p.y < block.y + block.height
        ) {
          handlePlayerDeath();
        }
        return;
      }

      // Solid block collision
      if (
        p.x < block.x + block.width &&
        p.x + p.width > block.x &&
        p.y < block.y + block.height &&
        p.y + p.height > block.y
      ) {
        if (p.vy > 0) {
          // Landing on top of block
          p.y = block.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
          if (!p.hasAirShift) {
            p.hasAirShift = true;
            setHasAirShiftState(true);
          }
          setIsGroundedState(true);
        } else if (p.vy < 0) {
          // HITTING BLOCK FROM BELOW (Mystery box / Brick)
          p.y = block.y + block.height;
          p.vy = 0;

          // Headbutt Mystery Question Block
          if (block.type === 'question' && !block.isHit) {
            block.isHit = true;
            block.bounceOffset = -8;
            soundManager.playBlockHit();

            // Spawn Item safely without any freeze!
            spawnBlockItem(block);
          } else if (block.type === 'brick') {
            // BIG fighters smash bricks with their heads!
            if (p.powerUp !== 'none') {
              block.isDestroyed = true;
              p.score += 50;
              soundManager.playBlockHit();
              screenShakeRef.current = Math.max(screenShakeRef.current, 4);
              for (let i = 0; i < 10; i++) {
                particlesRef.current.push({
                  id: Math.random(),
                  x: block.x + block.width / 2,
                  y: block.y + block.height / 2,
                  vx: (Math.random() - 0.5) * 6,
                  vy: -Math.random() * 5 - 1,
                  color: Math.random() > 0.5 ? '#c84c0c' : '#782604',
                  size: Math.random() * 5 + 3,
                  alpha: 1,
                  decay: 0.04,
                  shape: 'square',
                });
              }
              floatingTextsRef.current.push({
                id: Math.random(),
                text: 'BRICK SMASH! +50 🧱',
                x: block.x + block.width / 2,
                y: block.y - 10,
                vy: -1.4,
                color: '#fdba74',
                alpha: 1,
                scale: 1.1,
              });
            } else {
              block.bounceOffset = -5;
              soundManager.playBlockHit();
            }
          }
        }
      }
    });

    // Return bounce offset smoothly
    blocksRef.current.forEach(b => {
      if (b.bounceOffset && b.bounceOffset < 0) {
        b.bounceOffset += 1.5;
        if (b.bounceOffset > 0) b.bounceOffset = 0;
      }
    });

    // Check goal flag/finish reach
    if (p.x >= levelDef.goalX) {
      const bossAlive = enemiesRef.current.some(
        e => e.isAlive && (e.type === 'bowser' || e.type === 'rival_ninja' || e.type === 'fighter_boss' || (e.type === 'kombatant' && e.isBoss))
      );
      if (bossAlive) {
        // NO ESCAPING a boss stage — kill the boss first!
        p.x = levelDef.goalX - 14;
        if (p.vx > 0) p.vx = 0;
        const nowMs = performance.now();
        if (nowMs - bossWarnRef.current > 2200) {
          bossWarnRef.current = nowMs;
          soundManager.playError();
          floatingTextsRef.current.push({
            id: Math.random(),
            text: '🔒 اقتل الزعيم أولاً! NO ESCAPE!',
            x: p.x + p.width / 2,
            y: p.y - 22,
            vy: -1.4,
            color: '#ef4444',
            alpha: 1,
            scale: 1.3,
          });
        }
      } else {
        handleStageClear();
      }
    }

    // Fell off map
    if (p.y > levelDef.height + 60) {
      handlePlayerDeath();
    }

    // --- UPDATE ITEMS ---
    itemsRef.current.forEach(item => {
      if (item.collected) return;

      // Emerge from block upward smoothly
      if (item.emerging) {
        item.y -= 1.2;
        if (item.y <= item.emergeY - 32) {
          item.emerging = false;
          // Mushrooms march out of the box, flowers stay to be grabbed
          if (item.type === 'mushroom' && !item.vx) item.vx = 1.5;
        }
        return;
      }

      // Item world physics: powerups fall, land on ground/blocks — always reachable!
      if (item.type === 'mushroom' || item.type === 'flower') {
        item.vy = (item.vy || 0) + 0.45;
        if (item.vy > 9) item.vy = 9;
        item.y += item.vy;
        if (item.type === 'mushroom') {
          if (!item.vx) item.vx = 1.5;
          item.x += item.vx;
          // Bounce off walls
          blocksRef.current.forEach(block => {
            if (block.isDestroyed || block.type === 'lava') return;
            if (
              item.x < block.x + block.width &&
              item.x + item.width > block.x &&
              item.y < block.y + block.height &&
              item.y + item.height > block.y
            ) {
              if ((item.vx || 0) > 0) item.x = block.x - item.width;
              else if ((item.vx || 0) < 0) item.x = block.x + block.width;
              item.vx = -((item.vx || 1.5));
            }
          });
        }
        // Land on solid ground
        blocksRef.current.forEach(block => {
          if (block.isDestroyed || block.type === 'lava') return;
          if (
            (item.vy || 0) >= 0 &&
            item.x + item.width > block.x + 2 &&
            item.x < block.x + block.width - 2 &&
            item.y + item.height > block.y &&
            item.y + item.height - (item.vy || 0) <= block.y + 10
          ) {
            item.y = block.y - item.height;
            item.vy = 0;
          }
        });
        // Lost to the pit
        if (item.y > levelDef.height + 80) {
          item.collected = true;
          return;
        }
      }

      // Collect item check (generous pickup radius)
      if (
        p.x < item.x + item.width + 6 &&
        p.x + p.width + 6 > item.x &&
        p.y < item.y + item.height + 6 &&
        p.y + p.height + 6 > item.y
      ) {
        item.collected = true;
        if (item.type === 'coin') {
          p.coins += 1;
          p.score += 200;
          soundManager.playCoin();
        } else if (item.type === 'mushroom') {
          // Mushroom NEVER downgrades a flower — flower keeps its petals!
          if (p.powerUp === 'none') {
            p.powerUp = 'mushroom';
            growPlayer();
            p.score += 1000;
            floatingTextsRef.current.push({
              id: Math.random(),
              text: 'SUPER MUSHROOM! BIG! 🍄',
              x: item.x,
              y: item.y - 10,
              vy: -1.2,
              color: '#22c55e',
              alpha: 1,
              scale: 1.2,
            });
          } else {
            p.score += 1000;
            floatingTextsRef.current.push({
              id: Math.random(),
              text: 'POWER BONUS! +1000',
              x: item.x,
              y: item.y - 10,
              vy: -1.2,
              color: '#facc15',
              alpha: 1,
              scale: 1.1,
            });
          }
          soundManager.playPowerup();
        } else if (item.type === 'flower') {
          // FIRE FLOWER: always upgrades + full 3-petal shield, stays BIG
          p.powerUp = 'flower';
          growPlayer();
          p.flowerShield = 3;
          p.score += 2000;
          soundManager.playPowerup();
          floatingTextsRef.current.push({
            id: Math.random(),
            text: 'FIRE FLOWER! SHIELD x3! 🌸',
            x: item.x,
            y: item.y - 10,
            vy: -1.2,
            color: '#f97316',
            alpha: 1,
            scale: 1.3,
          });
        }
      }
    });

    // --- UPDATE PROJECTILES ---
    projectilesRef.current.forEach(proj => {
      if (!proj.active) return;
      proj.x += proj.vx;
      proj.y += proj.vy;
      if (proj.grav) proj.vy += proj.grav;
      proj.duration -= dt;
      if (proj.duration <= 0) proj.active = false;

      // Player projectiles hit enemies
      if (proj.owner === 'player') {
        enemiesRef.current.forEach(enemy => {
          if (!enemy.isAlive) return;

          if (
            proj.x < enemy.x + enemy.width &&
            proj.x + proj.width > enemy.x &&
            proj.y < enemy.y + enemy.height &&
            proj.y + proj.height > enemy.y
          ) {
            // Impact!
            if (proj.effect === 'freeze') {
              enemy.isFrozen = true;
              enemy.freezeTimer = 4.0;
              applyDamageToEnemy(enemy, proj.damage, 'freeze');
            } else if (proj.effect === 'pull') {
              // Scorpion spear: bosses / MK fighters get DIZZY in place (no pull, no self-damage)
              if (enemy.type === 'bowser' || enemy.type === 'rival_ninja' || enemy.type === 'fighter_boss' || enemy.isBoss) {
                enemy.isDizzy = true;
                enemy.dizzyTimer = 3.2;
                applyDamageToEnemy(enemy, 5, 'dizzy');
                soundManager.playDizzy();
                // Spear guard: Scorpion takes NO damage while the boss is dizzied
                p.isInvincible = true;
                p.invincibleTimer = Math.max(p.invincibleTimer, 1.2);
                floatingTextsRef.current.push({
                  id: Math.random(),
                  text: 'DIZZY! 😵 GET OVER HERE!',
                  x: enemy.x + enemy.width / 2,
                  y: enemy.y - 16,
                  vy: -1.5,
                  color: '#fbbf24',
                  alpha: 1,
                  scale: 1.4,
                });
              } else {
                // Regular enemy: classic pull
                enemy.x = p.facing === 'right' ? p.x + p.width + 10 : p.x - enemy.width - 10;
                applyDamageToEnemy(enemy, proj.damage, 'pull');
              }
            } else if (proj.effect === 'tackle') {
              // NOOB SAIBOT SHADOW CLONE RUSH
              applyDamageToEnemy(enemy, proj.damage, 'tackle');
            } else {
              applyDamageToEnemy(enemy, proj.damage, 'projectile');
            }

            // Consume projectile
            proj.active = false;
          }
        });
      } else if (proj.owner === 'enemy') {
        // Enemy projectiles hit player (lighter than melee — blockable chip)
        if (
          proj.x < p.x + p.width &&
          proj.x + proj.width > p.x &&
          proj.y < p.y + p.height &&
          proj.y + proj.height > p.y
        ) {
          proj.active = false;
          handlePlayerHurt(8);
        }
      }
    });

    // Clean inactive projectiles
    projectilesRef.current = projectilesRef.current.filter(pr => pr.active);

    // --- UPDATE ENEMIES ---
    enemiesRef.current.forEach(enemy => {
      if (!enemy.isAlive) return;

      // Frozen enemy timer
      if (enemy.isFrozen) {
        enemy.freezeTimer -= dt;
        if (enemy.freezeTimer <= 0) {
          enemy.isFrozen = false;
        }
        return; // Don't move or attack while frozen!
      }

      // DIZZY enemy timer (Scorpion spear / uppercuts) — wobbles in place, open to damage!
      if (enemy.isDizzy) {
        enemy.dizzyTimer = (enemy.dizzyTimer || 0) - dt;
        enemy.x += Math.sin(Date.now() / 90 + enemy.id) * 0.5;
        // Launched bodies still fall while dizzy — land on solid blocks
        if (enemy.vy) {
          enemy.vy += 0.5;
          enemy.y += enemy.vy;
          blocksRef.current.forEach(block => {
            if (block.isDestroyed || block.type === 'lava') return;
            if (
              enemy.vy > 0 &&
              enemy.x + enemy.width > block.x + 2 &&
              enemy.x < block.x + block.width - 2 &&
              enemy.y + enemy.height > block.y &&
              enemy.y + enemy.height - enemy.vy <= block.y + 8
            ) {
              enemy.y = block.y - enemy.height;
              enemy.vy = 0;
            }
          });
        }
        if ((enemy.dizzyTimer || 0) <= 0) {
          enemy.isDizzy = false;
          enemy.vy = 0;
        }
        return; // Don't move or attack while dizzy!
      }

      if (enemy.enemyBlockTimer && enemy.enemyBlockTimer > 0) {
        enemy.enemyBlockTimer -= dt;
      }

      if (enemy.type === 'bowser') {
        // --- BOWSER BOSS BEHAVIOR ---
        setBossEnemyState(enemy);

        // If bridge is collapsed, Bowser falls into the lava lake!
        if (enemy.isBridgeFallen) {
          enemy.vy += 0.4;
          enemy.y += enemy.vy;
          if (enemy.y > 520) {
            enemy.isAlive = false;
            handleBossDefeated();
          }
          return;
        }

        // Bowser patrols his home arena (no wandering off!)
        const homeX = enemy.homeX ?? enemy.x;
        enemy.x += enemy.vx;
        if (enemy.x < homeX - 240) {
          enemy.vx = Math.abs(enemy.vx) || 0.6;
          enemy.facing = 'right';
        } else if (enemy.x > homeX + 240) {
          enemy.vx = -(Math.abs(enemy.vx) || 0.6);
          enemy.facing = 'left';
        }

        // Bowser attacks periodically (breathes fire)
        enemy.attackTimer = (enemy.attackTimer || 0) + dt;
        if (enemy.attackTimer > 2.8) {
          enemy.attackTimer = 0;
          soundManager.playBowserRoar();

          // Spits fireball towards player
          const fireDir = p.x < enemy.x ? -1 : 1;
          projectilesRef.current.push({
            id: Math.random(),
            type: 'bowser_fire',
            x: enemy.x + (fireDir === -1 ? -20 : enemy.width + 10),
            y: enemy.y + 24,
            vx: fireDir * 4.5,
            vy: 0,
            width: 32,
            height: 22,
            damage: 1,
            owner: 'enemy',
            duration: 4.0,
            active: true,
            facing: fireDir === -1 ? 'left' : 'right',
          });
        }
      } else if (enemy.type === 'rival_ninja') {
        // RIVAL NINJA BOSS (Scorpion, Sub-Zero, Noob, Raiden)
        const dx = p.x - enemy.x;
        enemy.facing = dx > 0 ? 'right' : 'left';

        // Move towards player within arena
        if (Math.abs(dx) > 75) {
          enemy.vx = dx > 0 ? 1.5 : -1.5;
          enemy.x += enemy.vx;
        } else {
          enemy.vx = 0;
        }

        // Rival attacks periodically
        enemy.attackTimer = (enemy.attackTimer || 0) + dt;
        if (enemy.attackTimer > 2.2) {
          enemy.attackTimer = 0;
          const rival = enemy.fighterKind || 'scorpion';
          const dir = enemy.facing === 'right' ? 1 : -1;

          if (rival === 'subzero') {
            soundManager.playIceFreeze();
            projectilesRef.current.push({
              id: Math.random(),
              type: 'ice_blast',
              x: enemy.x + (dir === 1 ? enemy.width + 5 : -20),
              y: enemy.y + 18,
              vx: dir * 5.8,
              vy: 0,
              width: 20,
              height: 20,
              damage: 1,
              owner: 'enemy',
              duration: 3.5,
              active: true,
              facing: enemy.facing,
              effect: 'freeze',
            });
          } else if (rival === 'scorpion') {
            soundManager.playSpear();
            projectilesRef.current.push({
              id: Math.random(),
              type: 'spear',
              x: enemy.x + (dir === 1 ? enemy.width + 5 : -25),
              y: enemy.y + 18,
              vx: dir * 6.8,
              vy: 0,
              width: 25,
              height: 14,
              damage: 1,
              owner: 'enemy',
              duration: 2.0,
              active: true,
              facing: enemy.facing,
              effect: 'pull',
            });
          } else if (rival === 'raiden') {
            soundManager.playLightning();
            projectilesRef.current.push({
              id: Math.random(),
              type: 'lightning',
              x: enemy.x + (dir === 1 ? enemy.width + 5 : -28),
              y: enemy.y + 16,
              vx: dir * 7.2,
              vy: 0,
              width: 28,
              height: 18,
              damage: 1,
              owner: 'enemy',
              duration: 3.0,
              active: true,
              facing: enemy.facing,
            });
          } else {
            soundManager.playShadowClone();
            projectilesRef.current.push({
              id: Math.random(),
              type: 'shadow_ball',
              x: enemy.x + (dir === 1 ? enemy.width + 5 : -28),
              y: enemy.y + 16,
              vx: dir * 5.8,
              vy: 0,
              width: 26,
              height: 26,
              damage: 1,
              owner: 'enemy',
              duration: 3.0,
              active: true,
              facing: enemy.facing,
            });
          }
        }
      } else if (enemy.type === 'kombatant' || enemy.type === 'fighter_boss') {
        // --- MK FIGHTER ENEMY: stalks you, punches up close, fires projectiles from afar ---
        const isFBoss = enemy.type === 'fighter_boss';
        const bossKind = enemy.fighterKind || 'baraka';
        const dx = p.x - enemy.x;
        enemy.facing = dx > 0 ? 'right' : 'left';
        const enraged = isFBoss && enemy.health < enemy.maxHealth / 2;
        const stalkSpeed = (isFBoss ? 1.7 : 1.1) * (enraged ? 1.5 : 1);
        const meleeReach = isFBoss ? 70 : 55;

        if (enemy.meleeCooldown && enemy.meleeCooldown > 0) enemy.meleeCooldown -= dt;
        if ((enemy.attackTimer || 0) > 0) enemy.attackTimer -= dt;

        if (Math.abs(dx) > meleeReach && !(enemy.strikeTimer && enemy.strikeTimer > 0)) {
          enemy.x += dx > 0 ? stalkSpeed : -stalkSpeed;
        } else if ((enemy.meleeCooldown || 0) <= 0 && !(enemy.strikeTimer && enemy.strikeTimer > 0)) {
          // MELEE WIND-UP (telegraphed 0.35s — dodge it or hold BLOCK!)
          enemy.strikeTimer = 0.35;
          enemy.attackTimer = 0.45;
          soundManager.playPunch();
        }

        // Wind-up resolves into the real strike
        if (enemy.strikeTimer && enemy.strikeTimer > 0) {
          enemy.strikeTimer -= dt;
          if (enemy.strikeTimer <= 0) {
            enemy.meleeCooldown = enraged ? 1.2 : 1.8;
            if (Math.abs(p.x - enemy.x) < meleeReach + 26 && Math.abs(p.y - enemy.y) < 54) {
              handlePlayerHurt(isFBoss ? 13 : 10);
              floatingTextsRef.current.push({
                id: Math.random(),
                text: isFBoss ? 'BOSS STRIKE! 👊' : 'FIGHTER HIT! 👊',
                x: p.x + p.width / 2,
                y: p.y - 12,
                vy: -1.4,
                color: '#fca5a5',
                alpha: 1,
                scale: 1.1,
              });
            }
          }
        }

        // Ranged attack per fighter kind
        const rangedCd = enemy.specialCooldown || 0;
        const rangedInterval = enraged ? 1.4 : 2.4;
        if (Math.abs(dx) < 430 && Math.abs(dx) > 40 && rangedCd > rangedInterval) {
          enemy.specialCooldown = 0;
          const dir = enemy.facing === 'right' ? 1 : -1;
          const kindShots: Record<string, Projectile['type']> = {
            baraka: 'blade_spark',
            liukang: 'dragon_fire',
            kitana: 'steel_fan',
            shangtsung: 'soul_skull',
            kunglao: 'razor_hat',
            johnnycage: 'cage_bolt',
            jax: 'shockwave',
            sonya: 'energy_ring',
            subzero: 'ice_blast',
            scorpion: 'spear',
            raiden: 'lightning',
            reptile: 'acid_spit',
            noob: 'shadow_ball',
          };
          const shots = isFBoss && enraged ? 2 : 1;
          for (let s = 0; s < shots; s++) {
            projectilesRef.current.push({
              id: Math.random(),
              type: kindShots[bossKind] || 'shadow_ball',
              x: enemy.x + (dir === 1 ? enemy.width + 5 : -26),
              y: enemy.y + 16 - s * 16,
              vx: dir * 5.5,
              vy: 0,
              width: 24,
              height: 20,
              damage: 1,
              owner: 'enemy',
              duration: 3.5,
              active: true,
              facing: enemy.facing,
            });
          }
          soundManager.playFanThrow();
        } else {
          enemy.specialCooldown = rangedCd + dt;
        }

        if (isFBoss) setBossEnemyState({ ...enemy });

        // Fighter gravity + SOLID body: never sinks, never enters walls!
        enemy.vy = (enemy.vy || 0) + 0.5;
        if (enemy.vy > 10) enemy.vy = 10;
        enemy.y += enemy.vy;
        blocksRef.current.forEach(block => {
          if (block.isDestroyed || block.type === 'lava' || block.type === 'bridge' || block.type === 'axe') return;
          // Land on top
          if (
            (enemy.vy || 0) >= 0 &&
            enemy.x + enemy.width > block.x + 2 &&
            enemy.x < block.x + block.width - 2 &&
            enemy.y + enemy.height > block.y &&
            enemy.y + enemy.height - (enemy.vy || 0) <= block.y + 10
          ) {
            enemy.y = block.y - enemy.height;
            enemy.vy = 0;
          }
          // Walls stop fighters cold
          if (
            enemy.x < block.x + block.width &&
            enemy.x + enemy.width > block.x &&
            enemy.y < block.y + block.height &&
            enemy.y + enemy.height > block.y + 6
          ) {
            if (enemy.x + enemy.width / 2 < block.x + block.width / 2) enemy.x = block.x - enemy.width;
            else enemy.x = block.x + block.width;
          }
        });
        if (enemy.x < 0) enemy.x = 0;
        if (enemy.x > levelDef.width - enemy.width) enemy.x = levelDef.width - enemy.width;
        if (enemy.y > levelDef.height + 80) {
          enemy.y = levelDef.height - enemy.height - 40;
          enemy.vy = 0;
        }
      } else if (enemy.type === 'hammerbro' || enemy.type === 'spiny') {
        // --- HAMMER BRO & SPINY: classic Mario march + gravity, bro lobs hammers ---
        enemy.vy = (enemy.vy || 0) + 0.5;
        if (enemy.vy > 10) enemy.vy = 10;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        blocksRef.current.forEach(block => {
          if (block.isDestroyed || block.type === 'lava' || block.type === 'bridge' || block.type === 'axe') return;
          if (
            (enemy.vy || 0) >= 0 &&
            enemy.x + enemy.width > block.x + 2 &&
            enemy.x < block.x + block.width - 2 &&
            enemy.y + enemy.height > block.y &&
            enemy.y + enemy.height - (enemy.vy || 0) <= block.y + 10
          ) {
            enemy.y = block.y - enemy.height;
            enemy.vy = 0;
          }
          if (
            enemy.x < block.x + block.width &&
            enemy.x + enemy.width > block.x &&
            enemy.y < block.y + block.height &&
            enemy.y + enemy.height > block.y + 6
          ) {
            enemy.vx = -(enemy.vx || 1);
            enemy.facing = enemy.vx > 0 ? 'right' : 'left';
            if (enemy.x + enemy.width / 2 < block.x + block.width / 2) enemy.x = block.x - enemy.width;
            else enemy.x = block.x + block.width;
          }
        });
        if (enemy.type === 'hammerbro' && Math.abs(p.x - enemy.x) < 430) {
          enemy.attackTimer = (enemy.attackTimer || 0) + dt;
          if (enemy.attackTimer > 2.6) {
            enemy.attackTimer = 0;
            const dir = p.x < enemy.x ? -1 : 1;
            soundManager.playFanThrow();
            projectilesRef.current.push({
              id: Math.random(),
              type: 'hammer',
              x: enemy.x + enemy.width / 2 - 11,
              y: enemy.y - 8,
              vx: dir * 3.6,
              vy: -7.5,
              width: 22,
              height: 22,
              damage: 1,
              owner: 'enemy',
              duration: 4.0,
              active: true,
              facing: enemy.facing,
              grav: 0.35,
            });
          }
        }
      } else if (enemy.type === 'piranha') {
        // Piranha snaps up and down from pipe
        enemy.animationTimer += dt * 2;
        enemy.y = enemy.y + Math.sin(enemy.animationTimer) * 0.6;
      } else if (enemy.type === 'koopa' && enemy.inShell) {
        // --- KOOPA SHELL STATE: parked (wake timer) or racing (mows enemies!) ---
        if (enemy.shellTimer && enemy.shellTimer > 0) {
          enemy.shellTimer -= dt;
          if (enemy.shellTimer <= 0 && !enemy.shellVx) {
            // Wakes back up into a turtle!
            enemy.inShell = false;
            enemy.health = 2;
            enemy.vx = enemy.facing === 'right' ? 1.2 : -1.2;
            soundManager.playPunch();
            floatingTextsRef.current.push({
              id: Math.random(),
              text: 'WAKE UP! 🐢',
              x: enemy.x + enemy.width / 2,
              y: enemy.y - 10,
              vy: -1.2,
              color: '#fca5a5',
              alpha: 1,
              scale: 1.0,
            });
          }
        }
        if (enemy.shellVx) {
          // Racing shell physics
          enemy.vy = (enemy.vy || 0) + 0.5;
          if (enemy.vy > 10) enemy.vy = 10;
          enemy.x += enemy.shellVx;
          enemy.y += enemy.vy;
          blocksRef.current.forEach(block => {
            if (block.isDestroyed || block.type === 'lava' || block.type === 'bridge' || block.type === 'axe') return;
            // Bounce off walls
            if (
              enemy.x < block.x + block.width &&
              enemy.x + enemy.width > block.x &&
              enemy.y < block.y + block.height &&
              enemy.y + enemy.height > block.y + 4
            ) {
              enemy.shellVx = -(enemy.shellVx || 6);
              if (enemy.x + enemy.width / 2 < block.x + block.width / 2) enemy.x = block.x - enemy.width;
              else enemy.x = block.x + block.width;
              soundManager.playBlockHit();
            }
            // Land on ground
            if (
              (enemy.vy || 0) >= 0 &&
              enemy.x + enemy.width > block.x + 2 &&
              enemy.x < block.x + block.width - 2 &&
              enemy.y + enemy.height > block.y &&
              enemy.y + enemy.height - (enemy.vy || 0) <= block.y + 10
            ) {
              enemy.y = block.y - enemy.height;
              enemy.vy = 0;
            }
          });
          // Mow down EVERY enemy in the shell's path!
          enemiesRef.current.forEach(other => {
            if (other === enemy || !other.isAlive) return;
            if (
              enemy.x < other.x + other.width &&
              enemy.x + enemy.width > other.x &&
              enemy.y < other.y + other.height &&
              enemy.y + enemy.height > other.y
            ) {
              applyDamageToEnemy(other, 99, 'shell');
            }
          });
          if (enemy.y > levelDef.height + 60) enemy.isAlive = false;
        }
      } else {
        // Goomba / Koopa walking
        enemy.x += enemy.vx;
        // Turn around at ledge or wall
        blocksRef.current.forEach(block => {
          if (block.isDestroyed || block.type === 'lava' || block.type === 'bridge') return;
          if (
            enemy.x < block.x + block.width &&
            enemy.x + enemy.width > block.x &&
            enemy.y < block.y + block.height &&
            enemy.y + enemy.height > block.y
          ) {
            enemy.vx = -enemy.vx;
            enemy.facing = enemy.vx > 0 ? 'right' : 'left';
          }
        });
      }

      // Player collides with enemy (Stomp or Hurt)
      if (
        p.x < enemy.x + enemy.width &&
        p.x + p.width > enemy.x &&
        p.y < enemy.y + enemy.height &&
        p.y + p.height > enemy.y
      ) {
        // KOOPA SHELL contact rules — shells are toys, not threats!
        if (enemy.type === 'koopa' && enemy.inShell) {
          if (enemy.shellVx) {
            // Racing shell!
            if (p.isDashing || p.isSliding) {
              applyDamageToEnemy(enemy, 99, 'shell_smash');
              p.score += 400;
            } else if (p.vy > 0 && p.y + p.height - p.vy <= enemy.y + 14) {
              // Stomp stops the racing shell cold
              enemy.shellVx = 0;
              enemy.shellTimer = 6;
              p.vy = -8.5;
              p.score += 200;
              soundManager.playPunch();
              floatingTextsRef.current.push({
                id: Math.random(),
                text: 'SHELL STOP! +200 🛑',
                x: enemy.x + enemy.width / 2,
                y: enemy.y - 12,
                vy: -1.4,
                color: '#bbf7d0',
                alpha: 1,
                scale: 1.1,
              });
            } else {
              handlePlayerHurt(10);
            }
          } else {
            // Parked shell: touch it from ANY side to kick it flying (totally safe!)
            const kickDir = p.x + p.width / 2 < enemy.x + enemy.width / 2 ? 1 : -1;
            enemy.shellVx = kickDir * 6.5;
            enemy.shellTimer = 6;
            if (p.vy > 0 && p.y + p.height - p.vy <= enemy.y + 16) p.vy = -8.5;
            p.score += 100;
            soundManager.playPunch();
            floatingTextsRef.current.push({
              id: Math.random(),
              text: 'SHELL KICK! 🐢💨 +100',
              x: enemy.x + enemy.width / 2,
              y: enemy.y - 12,
              vy: -1.4,
              color: '#bbf7d0',
              alpha: 1,
              scale: 1.1,
            });
          }
        } else if (p.isDashing || p.isSliding) {
          // Dashing or sliding into enemy damages them safely!
          applyDamageToEnemy(enemy, 1, p.isSliding ? 'slide' : 'dash_tackle');
        } else if (p.vy > 0 && p.y + p.height - p.vy <= enemy.y + 12 && enemy.type !== 'bowser' && enemy.type !== 'kombatant' && enemy.type !== 'fighter_boss' && enemy.type !== 'rival_ninja') {
          if (enemy.type === 'spiny') {
            // SPINY PUNISHES stomps — punch it, don't jump on it!
            p.vy = -7;
            handlePlayerHurt(10);
            floatingTextsRef.current.push({
              id: Math.random(),
              text: 'SPIKY! 🦔',
              x: p.x + p.width / 2,
              y: p.y - 12,
              vy: -1.4,
              color: '#fca5a5',
              alpha: 1,
              scale: 1.1,
            });
          } else {
            // Classic Mario Stomp jump!
            p.vy = -8.5; // bounce up
            applyDamageToEnemy(enemy, 1, 'stomp');
            soundManager.playPunch();
          }
        } else {
          // Player hurt
          handlePlayerHurt();
        }
      }
    });

    // --- UPDATE PARTICLES ---
    particlesRef.current.forEach(part => {
      part.x += part.vx;
      part.y += part.vy;
      part.alpha -= part.decay;
    });
    particlesRef.current = particlesRef.current.filter(part => part.alpha > 0);

    // --- UPDATE FLOATING TEXT ---
    floatingTextsRef.current.forEach(ft => {
      ft.y += ft.vy;
      ft.alpha -= 0.02;
    });
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => ft.alpha > 0);

    // --- CAMERA TRACKING ---
    // Ground recharge: touching earth refreshes DASH + UP-SHIFT instantly (no timer lock!)
    if (p.isGrounded) {
      if (!p.hasAirShift) {
        p.hasAirShift = true;
        setHasAirShiftState(true);
      }
      if (p.dashCooldown > 0) {
        p.dashCooldown = 0;
        setDashCd(0);
      }
      if ((p.upShiftCooldown || 0) > 0) {
        p.upShiftCooldown = 0;
        setUpShiftCd(0);
      }
    }
    // Smooth camera horizontal tracking
    const targetCamX = p.x - 300;
    cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.12;
    if (cameraRef.current.x < 0) cameraRef.current.x = 0;
    if (cameraRef.current.x > levelDef.width - 854) {
      cameraRef.current.x = levelDef.width - 854;
    }
  };

  // Safe item spawn from block (Fixes flower block hang!)
  const spawnBlockItem = (block: Block) => {
    const itemType = block.content || 'coin';
    if (itemType === 'empty') return;

    itemsRef.current.push({
      id: Math.random(),
      type: itemType,
      x: block.x + (block.width - 24) / 2,
      y: block.y,
      vx: 0,
      vy: 0,
      width: 24,
      height: 24,
      collected: false,
      emerging: true,
      emergeY: block.y,
    });
  };

  // PIPE WARP: stand on a glowing warp pipe and press Down to dive inside!
  const tryPipeWarp = () => {
    const p = playerRef.current;
    if (!p.isGrounded) return;
    const pipe = blocksRef.current.find(
      b =>
        !b.isDestroyed &&
        b.isWarp &&
        b.warpTo &&
        (b.type === 'pipe' || b.type === 'pipe_top') &&
        p.x + p.width > b.x + 4 &&
        p.x < b.x + b.width - 4 &&
        Math.abs(p.y + p.height - b.y) < 16
    );
    if (!pipe || !pipe.warpTo) return;
    soundManager.playWarp();
    p.x = pipe.warpTo.x;
    p.y = pipe.warpTo.y;
    p.vx = 0;
    p.vy = 0;
    p.isBlocking = false;
    p.isCrouching = false;
    p.isInvincible = true;
    p.invincibleTimer = Math.max(p.invincibleTimer, 1.0);
    screenShakeRef.current = 6;
    for (let i = 0; i < 12; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x: pipe.x + pipe.width / 2,
        y: pipe.y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 4 - 1,
        color: Math.random() > 0.4 ? '#4ade80' : '#bbf7d0',
        size: Math.random() * 6 + 3,
        alpha: 1,
        decay: 0.05,
        shape: 'spark',
      });
    }
    floatingTextsRef.current.push({
      id: Math.random(),
      text: 'SECRET WARP! ▼',
      x: pipe.warpTo.x,
      y: pipe.warpTo.y - 16,
      vy: -1.5,
      color: '#4ade80',
      alpha: 1,
      scale: 1.4,
    });
  };

  // Bridge collapse trigger (Golden Axe switch)
  const triggerAxeBridgeCollapse = () => {
    soundManager.playVictory();

    // Destroy bridge blocks
    blocksRef.current.forEach(b => {
      if (b.type === 'bridge') {
        b.isDestroyed = true;
      }
    });

    // Make Bowser fall
    const bowser = enemiesRef.current.find(e => e.type === 'bowser');
    if (bowser) {
      bowser.isBridgeFallen = true;
      bowser.vy = 1;
    }

    floatingTextsRef.current.push({
      id: Math.random(),
      text: 'BRIDGE COLLAPSED! FATALITY!',
      x: 2360,
      y: 350,
      vy: -1.5,
      color: '#f59e0b',
      alpha: 1,
      scale: 1.5,
    });
  };

  // RENDER TICK
  const renderGame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const levelDef = LEVEL_DEFINITIONS[currentLevelIndex];
    const camX = cameraRef.current.x;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    // --- DRAW BACKGROUND THEME ---
    if (levelDef.theme === 'overworld') {
      // Classic Mario sky blue
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#5c94fc');
      skyGrad.addColorStop(1, '#92baff');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant clouds
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 7; i++) {
        const cx = ((i * 350 - camX * 0.3) % (canvas.width + 200)) - 100;
        ctx.beginPath();
        ctx.arc(cx, 80 + (i % 2) * 40, 24, 0, Math.PI * 2);
        ctx.arc(cx + 25, 75 + (i % 2) * 40, 32, 0, Math.PI * 2);
        ctx.arc(cx + 50, 80 + (i % 2) * 40, 24, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant green hills
      ctx.fillStyle = '#16a34a';
      for (let i = 0; i < 5; i++) {
        const hx = ((i * 450 - camX * 0.5) % (canvas.width + 300)) - 150;
        ctx.beginPath();
        ctx.arc(hx + 100, 440, 95, Math.PI, 0);
        ctx.fill();
      }
    } else if (levelDef.theme === 'underground') {
      // Deep underground cave indigo/black
      ctx.fillStyle = '#050814';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cave stalactite background
      ctx.fillStyle = '#111827';
      for (let i = 0; i < 16; i++) {
        const sx = ((i * 120 - camX * 0.2) % canvas.width);
        ctx.beginPath();
        ctx.moveTo(sx, 40);
        ctx.lineTo(sx + 30, 110);
        ctx.lineTo(sx + 60, 40);
        ctx.closePath();
        ctx.fill();
      }

      // Glowing subterranean crystals
      for (let i = 0; i < 10; i++) {
        const cx = ((i * 180 - camX * 0.4) % canvas.width);
        const cy = 200 + (i % 3) * 60;
        ctx.fillStyle = i % 2 === 0 ? '#00e5ff' : '#a855f7';
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 6, cy - 14);
        ctx.lineTo(cx + 12, cy);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else if (levelDef.theme === 'castle') {
      // Dark volcanic castle
      ctx.fillStyle = '#171010';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Castle brick battlement silhouettes
      ctx.fillStyle = '#261a1a';
      for (let i = 0; i < 12; i++) {
        const bx = ((i * 160 - camX * 0.3) % canvas.width);
        ctx.fillRect(bx, 120, 100, 320);
        ctx.fillRect(bx, 100, 30, 20);
        ctx.fillRect(bx + 70, 100, 30, 20);
      }

      // Castle burning torches
      for (let i = 0; i < 8; i++) {
        const tx = ((i * 240 - camX * 0.6) % canvas.width);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(tx, 220, 6 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (levelDef.theme === 'desert') {
      // Scorching desert dusk
      const duskGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      duskGrad.addColorStop(0, '#7c2d12');
      duskGrad.addColorStop(0.6, '#ea580c');
      duskGrad.addColorStop(1, '#fcd34d');
      ctx.fillStyle = duskGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pyramid silhouettes
      ctx.fillStyle = '#451a03';
      for (let i = 0; i < 4; i++) {
        const px = ((i * 520 - camX * 0.3) % (canvas.width + 400)) - 200;
        ctx.beginPath();
        ctx.moveTo(px, 440);
        ctx.lineTo(px + 150, 220);
        ctx.lineTo(px + 300, 440);
        ctx.closePath();
        ctx.fill();
      }

      // Blazing sun
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(canvas.width - 140, 110, 42, 0, Math.PI * 2);
      ctx.fill();
    } else if (levelDef.theme === 'airship') {
      // Stormy sky armada
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0c4a6e');
      skyGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant airships
      ctx.fillStyle = '#1e293b';
      for (let i = 0; i < 4; i++) {
        const ax = ((i * 480 - camX * 0.4) % (canvas.width + 300)) - 150;
        const ay = 90 + (i % 2) * 60;
        ctx.fillRect(ax, ay, 130, 34);
        ctx.fillRect(ax + 20, ay + 34, 90, 14);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(ax + 10, ay + 12, 8, 8);
        ctx.fillStyle = '#1e293b';
      }

      // Fast clouds
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 300 - camX * 0.7 + Date.now() / 40) % (canvas.width + 200)) - 100;
        ctx.beginPath();
        ctx.arc(cx, 200 + (i % 3) * 70, 20, 0, Math.PI * 2);
        ctx.arc(cx + 22, 196 + (i % 3) * 70, 26, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (levelDef.theme === 'netherrealm') {
      // Burning netherrealm abyss
      const abyssGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      abyssGrad.addColorStop(0, '#09090b');
      abyssGrad.addColorStop(0.7, '#450a0a');
      abyssGrad.addColorStop(1, '#dc2626');
      ctx.fillStyle = abyssGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floating ember particles
      for (let i = 0; i < 14; i++) {
        const ex = ((i * 173 - camX * 0.5 + Date.now() / 30) % canvas.width);
        const ey = 420 - ((Date.now() / 12 + i * 67) % 420);
        ctx.fillStyle = i % 2 === 0 ? '#f97316' : '#facc15';
        ctx.fillRect(ex, ey, 3, 3);
      }

      // Demon gate silhouettes
      ctx.fillStyle = '#18181b';
      for (let i = 0; i < 6; i++) {
        const gx = ((i * 300 - camX * 0.3) % canvas.width);
        ctx.fillRect(gx, 260, 44, 180);
        ctx.beginPath();
        ctx.moveTo(gx - 8, 260);
        ctx.lineTo(gx + 22, 210);
        ctx.lineTo(gx + 52, 260);
        ctx.closePath();
        ctx.fill();
      }
    } else if (levelDef.theme === 'forest') {
      // LIVING FOREST: deep jungle greens with god rays
      const jungleGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      jungleGrad.addColorStop(0, '#052e16');
      jungleGrad.addColorStop(0.6, '#14532d');
      jungleGrad.addColorStop(1, '#166534');
      ctx.fillStyle = jungleGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Giant tree trunks
      ctx.fillStyle = '#3f2d1c';
      for (let i = 0; i < 7; i++) {
        const tx = ((i * 260 - camX * 0.45) % (canvas.width + 200)) - 100;
        ctx.fillRect(tx, 60, 42, 380);
        ctx.fillStyle = '#573d26';
        ctx.fillRect(tx + 8, 60, 8, 380);
        ctx.fillStyle = '#3f2d1c';
      }

      // Canopy leaves
      ctx.fillStyle = '#15803d';
      for (let i = 0; i < 9; i++) {
        const lx = ((i * 200 - camX * 0.6) % (canvas.width + 160)) - 80;
        ctx.beginPath();
        ctx.arc(lx, 60 + (i % 3) * 22, 46, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#22c55e';
      for (let i = 0; i < 6; i++) {
        const lx = ((i * 290 - camX * 0.6 + 90) % (canvas.width + 160)) - 80;
        ctx.beginPath();
        ctx.arc(lx, 44 + (i % 2) * 26, 26, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fireflies
      for (let i = 0; i < 10; i++) {
        const fx = ((i * 211 - camX * 0.5) % canvas.width);
        const fy = 150 + ((i * 97 + Date.now() / 25) % 250);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(fx, fy, 3, 3);
      }
    } else if (levelDef.theme === 'pit') {
      // KAHN'S PIT: dark arena with bridge over the abyss
      const pitGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      pitGrad.addColorStop(0, '#0f0a1e');
      pitGrad.addColorStop(0.55, '#2e1065');
      pitGrad.addColorStop(0.8, '#7c2d12');
      pitGrad.addColorStop(1, '#030308');
      ctx.fillStyle = pitGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Arena columns
      ctx.fillStyle = '#312e81';
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 320 - camX * 0.35) % canvas.width);
        ctx.fillRect(cx, 80, 54, 300);
        ctx.fillStyle = '#4338ca';
        ctx.fillRect(cx - 6, 70, 66, 14);
        ctx.fillRect(cx - 6, 376, 66, 14);
        ctx.fillStyle = '#312e81';
      }

      // Moon of Outworld
      ctx.fillStyle = '#e9d5ff';
      ctx.beginPath();
      ctx.arc(150, 100, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f0a1e';
      ctx.beginPath();
      ctx.arc(164, 92, 30, 0, Math.PI * 2);
      ctx.fill();

      // Abyss glow cracks
      ctx.fillStyle = '#f97316';
      for (let i = 0; i < 5; i++) {
        const gx = ((i * 260 - camX * 0.8) % canvas.width);
        ctx.fillRect(gx, 452, 60, 3);
      }
    }

    // --- APPLY CAMERA TRANSLATION & SCREEN SHAKE ---
    const shakeX = screenShakeRef.current > 0 ? (Math.random() - 0.5) * screenShakeRef.current : 0;
    const shakeY = screenShakeRef.current > 0 ? (Math.random() - 0.5) * screenShakeRef.current : 0;
    ctx.translate(-camX + shakeX, shakeY);

    // 1. Draw Blocks
    blocksRef.current.forEach(block => {
      if (block.x + block.width >= camX - 50 && block.x <= camX + canvas.width + 50) {
        SpriteRenderer.drawBlock(ctx, block);
      }
    });

    // 2. Draw Items
    itemsRef.current.forEach(item => {
      if (item.x + item.width >= camX - 50 && item.x <= camX + canvas.width + 50) {
        SpriteRenderer.drawItem(ctx, item);
      }
    });

    // 3. Draw Enemies
    enemiesRef.current.forEach(enemy => {
      if (enemy.x + enemy.width >= camX - 80 && enemy.x <= camX + canvas.width + 80) {
        SpriteRenderer.drawEnemy(ctx, enemy);
      }
    });

    // 4. Draw Projectiles
    projectilesRef.current.forEach(proj => {
      if (proj.type === 'shadow_clone') {
        SpriteRenderer.drawShadowClone(ctx, proj);
      } else if (proj.type === 'ice_blast') {
        SpriteRenderer.drawIceBlast(ctx, proj);
      } else if (proj.type === 'spear') {
        SpriteRenderer.drawSpear(ctx, proj, playerRef.current.x, playerRef.current.y);
      } else if (proj.type === 'lightning') {
        SpriteRenderer.drawLightning(ctx, proj);
      } else if (proj.type === 'acid_spit') {
        SpriteRenderer.drawAcid(ctx, proj);
      } else if (proj.type === 'bowser_fire') {
        SpriteRenderer.drawBowserFire(ctx, proj);
      } else if (proj.type === 'blade_spark') {
        SpriteRenderer.drawBlade(ctx, proj);
      } else if (proj.type === 'dragon_fire') {
        SpriteRenderer.drawDragonFire(ctx, proj);
      } else if (proj.type === 'steel_fan') {
        SpriteRenderer.drawFan(ctx, proj);
      } else if (proj.type === 'soul_skull') {
        SpriteRenderer.drawSkull(ctx, proj);
      } else if (proj.type === 'razor_hat') {
        SpriteRenderer.drawHat(ctx, proj);
      } else if (proj.type === 'cage_bolt') {
        SpriteRenderer.drawBolt(ctx, proj);
      } else if (proj.type === 'shockwave') {
        SpriteRenderer.drawWave(ctx, proj);
      } else if (proj.type === 'energy_ring') {
        SpriteRenderer.drawRing(ctx, proj);
      } else if (proj.type === 'hammer') {
        SpriteRenderer.drawHammer(ctx, proj);
      } else if (proj.type === 'shadow_ball') {
        // NOOB SAIBOT DARK VORTEX
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#a855f7';
        // Outer dark purple swirl
        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.arc(proj.x + proj.width / 2, proj.y + proj.height / 2, proj.width / 2, 0, Math.PI * 2);
        ctx.fill();
        // Inner glowing lavender core
        ctx.fillStyle = '#d8b4fe';
        ctx.beginPath();
        ctx.arc(proj.x + proj.width / 2, proj.y + proj.height / 2, proj.width / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Generic orb
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(proj.x + proj.width / 2, proj.y + proj.height / 2, proj.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Draw Player (Mortal Kombat Ninja)
    SpriteRenderer.drawPlayer(ctx, playerRef.current);

    // 6. Draw Particles
    particlesRef.current.forEach(part => {
      SpriteRenderer.drawParticle(ctx, part);
    });

    // 7. Draw Floating Texts
    floatingTextsRef.current.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#000000';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    ctx.restore();
  };

  // Touch controls handlers with double-tap support
  const handleTouchPress = (
    action:
      | 'left'
      | 'right'
      | 'jump'
      | 'attack'
      | 'rangedSpecial'
      | 'closeSpecial'
      | 'dash'
      | 'dashUp'
      | 'down'
      | 'block'
      | 'special1'
      | 'special2'
  ) => {
    const now = performance.now();

    // LEFT: single press moves left, double-tap dashes left!
    if (action === 'left') {
      keysRef.current.left = true;
      if (now - lastLeftTapRef.current < 320) {
        triggerDash('left');
        lastLeftTapRef.current = 0;
      } else {
        lastLeftTapRef.current = now;
      }
    }

    // RIGHT: single press moves right, double-tap dashes right!
    if (action === 'right') {
      keysRef.current.right = true;
      if (now - lastRightTapRef.current < 320) {
        triggerDash('right');
        lastRightTapRef.current = 0;
      } else {
        lastRightTapRef.current = now;
      }
    }

    // JUMP: single press jumps, double-tap triggers Upward Super Shift!
    if (action === 'jump') {
      keysRef.current.jump = true;
      if (now - lastJumpTapRef.current < 450) {
        triggerDash('up');
        lastJumpTapRef.current = 0;
      } else {
        lastJumpTapRef.current = now;
      }
    }

    // ATTACK: single tap punches (or uppercuts), double-tap triggers Close Special 1!
    if (action === 'attack') {
      if (now - lastPunchTapRef.current < 330) {
        triggerAttack('special2'); // Close special move
        lastPunchTapRef.current = 0;
      } else {
        triggerAttack('punch');
        lastPunchTapRef.current = now;
      }
    }

    // RANGED SPECIAL: dedicated single button for Ranged Special 2!
    if (action === 'rangedSpecial' || action === 'special1') {
      triggerAttack('special1');
    }

    // DIRECT CLOSE SPECIAL
    if (action === 'closeSpecial' || action === 'special2') {
      triggerAttack('special2');
    }

    if (action === 'dash') triggerDash(keysRef.current.jump ? 'up' : 'forward');
    if (action === 'dashUp') triggerDash('up');

    // DOWN / CROUCH + PIPE ENTER (hold to crouch, tap on warp pipe to dive in)
    if (action === 'down') {
      keysRef.current.down = true;
      tryPipeWarp();
    }

    // BLOCK / DEFEND (hold to guard)
    if (action === 'block') {
      keysRef.current.block = true;
    }
  };

  const handleTouchRelease = (
    action:
      | 'left'
      | 'right'
      | 'jump'
      | 'attack'
      | 'rangedSpecial'
      | 'closeSpecial'
      | 'dash'
      | 'dashUp'
      | 'down'
      | 'block'
      | 'special1'
      | 'special2'
  ) => {
    if (action === 'left') keysRef.current.left = false;
    if (action === 'right') keysRef.current.right = false;
    if (action === 'jump') keysRef.current.jump = false;
    if (action === 'down') keysRef.current.down = false;
    if (action === 'block') keysRef.current.block = false;
  };

  const toggleSound = () => {
    soundManager.isMuted = !soundManager.isMuted;
    setIsMuted(soundManager.isMuted);
  };

  const togglePause = () => {
    setGameState(prev => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
  };

  return (
    <div id="game-stage-container" dir="ltr" className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      {/* HUD Bar */}
      <GameHUD
        player={playerRef.current}
        currentWorld={LEVEL_DEFINITIONS[currentLevelIndex].world}
        currentLevel={LEVEL_DEFINITIONS[currentLevelIndex].level}
        stageIdx={currentLevelIndex}
        timeRemaining={timeRemaining}
        bossEnemy={bossEnemyState}
        onOpenGuide={onOpenGuide}
        onOpenSelectFighter={onOpenSelectFighter}
        onToggleSound={toggleSound}
        isMuted={isMuted}
        onTogglePause={togglePause}
        isPaused={gameState === 'paused'}
      />

      {/* HTML5 Game Canvas (854x480 Widescreen Arcade with crisp pixel rendering) */}
      <canvas
        ref={canvasRef}
        id="mortal-mario-canvas"
        width={854}
        height={480}
        style={{ imageRendering: 'pixelated' }}
        className="w-full h-full object-contain select-none"
      />

      {/* Streamlined Mobile Touch Controls (Double-tap mechanics + Ranged Special button) */}
      <MobileControls
        character={character}
        onPress={handleTouchPress}
        onRelease={handleTouchRelease}
        cooldownRangedSpecial={special1Cd}
        cooldownCloseSpecial={special2Cd}
        cooldownSpecial1={special1Cd}
        cooldownSpecial2={special2Cd}
        cooldownDash={dashCd}
        upShiftCooldown={upShiftCd}
        hasAirShift={hasAirShiftState}
        isGrounded={isGroundedState}
        rangedLocked={currentLevelIndex < 2}
        upshiftLocked={currentLevelIndex < 3}
      />

      {/* Stage Clear Overlay */}
      {gameState === 'stage_clear' && (
        <div className="absolute inset-0 z-40 bg-black/85 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <span className="text-4xl mb-2">🏆</span>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
            STAGE CLEAR!
          </h2>
          <p className="text-sm text-neutral-300 mt-2 max-w-sm">
            أحسنت! تم تحرير هذه المنطقة بنجاح بواسطة {playerRef.current.character.toUpperCase()}.
          </p>
          {unlockedNow.length > 0 && (
            <div className="mt-3 bg-gradient-to-r from-amber-900/80 to-yellow-900/80 border-2 border-amber-400 rounded-xl px-5 py-3 shadow-[0_0_25px_rgba(245,158,11,0.5)] animate-pulse">
              <p className="text-amber-300 font-black text-sm">🔓 مقاتلون جدد انفتحوا!</p>
              <p className="text-white font-black text-base mt-1">
                {unlockedNow.map(id => `${FIGHTERS[id].avatar} ${FIGHTERS[id].nameAr}`).join(' • ')}
              </p>
            </div>
          )}
          <p className="text-xs text-neutral-500 mt-1 font-mono">اضغط Enter ⏎ للانتقال للعالم التالي</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleNextLevel}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-all"
            >
              الانتقال للعالم التالي ⏩
            </button>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === 'game_over' && (
        <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <span className="text-4xl mb-2">💀</span>
          <h2 className="text-3xl font-black text-red-600 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(220,38,38,0.7)]">
            FATALITY • GAME OVER
          </h2>
          <p className="text-sm text-neutral-400 mt-2">
            لقد سقط مقاتلك في معركة المشروم كينغدوم!
          </p>
          <button
            onClick={() => {
              playerRef.current.lives = 3;
              playerRef.current.score = 0;
              playerRef.current.blood = playerRef.current.maxBlood;
              playerRef.current.health = 3;
              loadLevel(currentLevelIndex);
              setGameState('playing');
            }}
            className="mt-6 px-6 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-all"
          >
            إعادة المحاولة من جديد 🔄
          </button>
        </div>
      )}

      {/* Victory / Game Complete Overlay */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <span className="text-5xl mb-2">👑</span>
          <h2 className="text-2xl sm:text-4xl font-black text-amber-400 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]">
            VICTORY • SHANG TSUNG DEFEATED!
          </h2>
          <p className="text-sm sm:text-base text-neutral-200 mt-3 max-w-md">
            تم سحق شانغ تسونغ وتحرير كل العوالم الثمانية! أثبت مقاتلو مورتال كومبات هيمنتهم المطلقة.
          </p>
          <div className="mt-4 bg-neutral-900/80 border border-neutral-700 rounded-xl p-4 text-xs sm:text-sm text-neutral-300 font-mono">
            <p>النقاط النهائية: <span className="text-amber-400 font-bold">{playerRef.current.score}</span></p>
            <p>القطع النقدية: <span className="text-amber-400 font-bold">{playerRef.current.coins}</span></p>
          </div>
          <button
            onClick={() => {
              playerRef.current.lives = 3;
              loadLevel(0);
              setGameState('playing');
            }}
            className="mt-6 px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-all"
          >
            اللعب مرة أخرى ⚔️
          </button>
        </div>
      )}

      {/* Paused Overlay */}
      {gameState === 'paused' && (
        <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <span className="text-3xl mb-2">⏸️</span>
          <h2 className="text-xl font-black text-white uppercase tracking-widest">
            اللعبة متوقفة مؤقتاً
          </h2>
          <button
            onClick={togglePause}
            className="mt-4 px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            استئناف اللعب ▶️
          </button>
        </div>
      )}
    </div>
  );
};
