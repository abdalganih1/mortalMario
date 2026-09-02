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
  });

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
    };
    const assignedRival = rivalMap[playerChar] || 'scorpion';

    enemiesRef.current = levelDef.enemies.map((e, idx) => ({
      ...e,
      id: idx + 1,
      isAlive: true,
      isFrozen: false,
      freezeTimer: 0,
      animationTimer: 0,
      attackTimer: 0,
      rivalFighter: e.type === 'rival_ninja' ? assignedRival : undefined,
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

    const boss = enemiesRef.current.find(e => e.type === 'bowser' || e.type === 'rival_ninja');
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
      if (['ArrowUp', 'ArrowLeft', 'ArrowRight', 'Space', 'Shift', 'KeyW', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }

      const now = performance.now();

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

      // SHIFT KEY / E KEY (Direct hotkeys for quick Dash & Up Shift)
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyS') {
        if (keysRef.current.jump || !playerRef.current.isGrounded) {
          triggerDash('up');
        } else {
          triggerDash('forward');
        }
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
      // 1. Check cooldown (4.5 seconds)
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
      // Horizontal directional dash sprint
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

      // Check if Uppercut triggered (holding Jump/Up or in mid-air)
      const isUppercut = keysRef.current.jump || !p.isGrounded;
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
        if (
          attackX < e.x + e.width &&
          attackX + attackRange > e.x &&
          attackY < e.y + e.height &&
          attackY + (isUppercut ? 50 : 30) > e.y
        ) {
          hitAny = true;
          const damage = isUppercut ? 2 : 1;
          applyDamageToEnemy(e, damage, isUppercut ? 'uppercut' : 'punch');

          if (isUppercut && e.isAlive) {
            // Launch enemy high into air with classic Mortal Kombat uppercut arc!
            e.vy = -8.5;
            e.vx = p.facing === 'right' ? 3.5 : -3.5;
          }
        }
      });

      if (isUppercut) {
        floatingTextsRef.current.push({
          id: Math.random(),
          text: 'UPPERCUT! 💥',
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
      // SPECIAL 1: Subzero (Ice Blast) / Scorpion (Spear) / Noob (Shadow Rush) / Raiden (Lightning) / Reptile (Acid Spit)
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
      }
    } else if (type === 'special2') {
      // SPECIAL 2: Sub-Zero (Cold Slide) / Scorpion (Hellfire Teleport) / Noob (Dark Vortex) / Raiden (Torpedo) / Reptile (Forceball)
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
      }
    }
  };

  // Damage Enemy Logic
  const applyDamageToEnemy = (enemy: Enemy, dmg: number, source: string) => {
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
      playerRef.current.score += enemy.type === 'bowser' ? 5000 : 200;

      if (enemy.type === 'bowser') {
        soundManager.playVictory();
        // Trigger victory after brief fanfare
        setTimeout(() => {
          setGameState('victory');
        }, 2200);
      } else {
        soundManager.playPunch();
      }
    } else {
      // Enemy stagger back
      enemy.vx = enemy.facing === 'left' ? 2.5 : -2.5;
    }
  };

  // Player Takes Damage
  const handlePlayerHurt = () => {
    const p = playerRef.current;
    if (p.isInvincible || p.isDashing || p.isSliding) return;

    if (p.powerUp === 'flower') {
      p.powerUp = 'mushroom';
    } else if (p.powerUp === 'mushroom') {
      p.powerUp = 'none';
    } else {
      p.health -= 1;
    }

    p.isInvincible = true;
    p.invincibleTimer = 1.5; // 1.5s invincibility frames
    p.vy = -5.5; // bounce back
    p.vx = p.facing === 'right' ? -4 : 4;
    soundManager.playPunch();

    if (p.health <= 0) {
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
      // Respawn at level start
      p.health = 3;
      p.powerUp = 'none';
      loadLevel(currentLevelIndex);
    }
  };

  // Complete level
  const handleStageClear = () => {
    soundManager.playVictory();
    setGameState('stage_clear');
  };

  // Next level transition
  const handleNextLevel = () => {
    if (currentLevelIndex < LEVEL_DEFINITIONS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
      loadLevel(currentLevelIndex + 1);
      setGameState('playing');
    } else {
      setGameState('victory');
    }
  };

  // MAIN 60 FPS GAME LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap delta time
      lastTime = now;

      if (gameState === 'playing') {
        updateGame(dt);
      }

      renderGame(ctx, canvas);
      animationFrameId = requestAnimationFrame(gameLoop);
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
      if (p.attackTimer <= 0) p.isAttacking = false;
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
    const accel = 0.8;
    const maxSpeed = 4.2;
    const friction = 0.82;
    const gravity = 0.52;

    if (!p.isDashing && !p.isSliding) {
      if (keys.left) {
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
            block.bounceOffset = -5;
            soundManager.playBlockHit();
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
      handleStageClear();
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
        }
        return;
      }

      // Collect item check
      if (
        p.x < item.x + item.width &&
        p.x + p.width > item.x &&
        p.y < item.y + item.height &&
        p.y + p.height > item.y
      ) {
        item.collected = true;
        if (item.type === 'coin') {
          p.coins += 1;
          p.score += 200;
          soundManager.playCoin();
        } else if (item.type === 'mushroom') {
          p.powerUp = 'mushroom';
          p.score += 1000;
          soundManager.playPowerup();
          floatingTextsRef.current.push({
            id: Math.random(),
            text: 'SUPER MUSHROOM!',
            x: item.x,
            y: item.y - 10,
            vy: -1.2,
            color: '#22c55e',
            alpha: 1,
            scale: 1.2,
          });
        } else if (item.type === 'flower') {
          // FIRE FLOWER - FIXED WITH ZERO FREEZE!
          p.powerUp = 'flower';
          p.score += 2000;
          soundManager.playPowerup();
          floatingTextsRef.current.push({
            id: Math.random(),
            text: 'ELEMENTAL FIRE SURGE!',
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
              // Scorpion spear pulls enemy
              enemy.x = p.facing === 'right' ? p.x + p.width + 10 : p.x - enemy.width - 10;
              applyDamageToEnemy(enemy, proj.damage, 'pull');
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
        // Enemy projectiles (Bowser Fire) hit player
        if (
          proj.x < p.x + p.width &&
          proj.x + proj.width > p.x &&
          proj.y < p.y + p.height &&
          proj.y + proj.height > p.y
        ) {
          proj.active = false;
          handlePlayerHurt();
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

      if (enemy.type === 'bowser') {
        // --- BOWSER BOSS BEHAVIOR ---
        setBossEnemyState(enemy);

        // If bridge is collapsed, Bowser falls into the lava lake!
        if (enemy.isBridgeFallen) {
          enemy.vy += 0.4;
          enemy.y += enemy.vy;
          if (enemy.y > 520) {
            enemy.isAlive = false;
            soundManager.playVictory();
            setTimeout(() => setGameState('victory'), 2000);
          }
          return;
        }

        // Bowser patrols bridge
        enemy.x += enemy.vx;
        if (enemy.x < 1750) {
          enemy.vx = 0.6;
          enemy.facing = 'right';
        } else if (enemy.x > 2200) {
          enemy.vx = -0.6;
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
          const rival = enemy.rivalFighter || 'scorpion';
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
      } else if (enemy.type === 'piranha') {
        // Piranha snaps up and down from pipe
        enemy.animationTimer += dt * 2;
        enemy.y = enemy.y + Math.sin(enemy.animationTimer) * 0.6;
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
        if (p.isDashing || p.isSliding) {
          // Dashing or sliding into enemy damages them safely!
          applyDamageToEnemy(enemy, 1, p.isSliding ? 'slide' : 'dash_tackle');
        } else if (p.vy > 0 && p.y + p.height - p.vy <= enemy.y + 12 && enemy.type !== 'bowser') {
          // Classic Mario Stomp jump!
          p.vy = -8.5; // bounce up
          applyDamageToEnemy(enemy, 1, 'stomp');
          soundManager.playPunch();
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
      if (now - lastJumpTapRef.current < 350) {
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
      | 'special1'
      | 'special2'
  ) => {
    if (action === 'left') keysRef.current.left = false;
    if (action === 'right') keysRef.current.right = false;
    if (action === 'jump') keysRef.current.jump = false;
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
              loadLevel(0);
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
            VICTORY • BOWSER DEFEATED!
          </h2>
          <p className="text-sm sm:text-base text-neutral-200 mt-3 max-w-md">
            تم سحق باوزر وتحرير مملكة الفطر! أثبت مقاتلو مورتال كومبات هيمنتهم المطلقة.
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
